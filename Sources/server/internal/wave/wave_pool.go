package wave

import (
	"crypto/sha256"
	"encoding/binary"
	"encoding/hex"
	"fmt"
	"io"
	"math"
	"os"
	"slices"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"flooooio/internal/wave/collision"
	"flooooio/internal/wave/florr/native"
	"flooooio/internal/wave/kernel/network"

	"github.com/colega/zeropool"
	"github.com/gorilla/websocket"
	"github.com/puzpuzpuz/xsync/v4"
)

const (
	spatialHashGridSize = 1024

	WaveUpdateFPS = 60

	DeltaT = 1. / WaveUpdateFPS

	WaveDataUpdateFPS = WaveUpdateFPS / 2
)

const (
	KB = 1024
	MB = 1024 * KB
	GB = 1024 * MB
)

var SharedBufPool = zeropool.New(func() []byte { return make([]byte, 512*KB) })

func writeCString[T ~string](buf []byte, at int, s T) int {
	n := copy(buf[at:], s)

	buf[at+n] = 0

	return at + n + 1
}

type WaveProgress = uint16

type WaveData struct {
	Biome native.Biome

	Progress         WaveProgress
	ProgressTimer    float32
	ProgressRedTimer float32
	ProgressIsRed    bool

	MapRadius uint16
}

type WavePool struct {
	playerPool *xsync.Map[EntityId, *Player]
	mobPool    *xsync.Map[EntityId, *Mob]
	petalPool  *xsync.Map[EntityId, *Petal]

	Ms *WaveMobSpawner

	eliminatedEntityIDs []uint32

	lightningBounces [][][2]float32

	updateTicker *time.Ticker
	frameCount   *xsync.Counter

	SpatialHash *collision.SpatialHash

	wasDisposed atomic.Bool

	hasBeenEnded atomic.Bool

	// commandQueue is command queue to run command with atomic.
	commandQueue chan func()

	Wd *WaveData

	Wr *WaveRoom

	mu sync.RWMutex
}

func NewWavePool(wr *WaveRoom, wd *WaveData) *WavePool {
	spawner := new(WaveMobSpawner)
	spawner.Next(wd, nil)

	return &WavePool{
		playerPool: xsync.NewMap[EntityId, *Player](),
		mobPool:    xsync.NewMap[EntityId, *Mob](),
		petalPool:  xsync.NewMap[EntityId, *Petal](),

		Ms: spawner,

		eliminatedEntityIDs: make([]uint32, 0),

		lightningBounces: make([][][2]float32, 0),

		updateTicker: nil,
		frameCount:   xsync.NewCounter(),

		SpatialHash: collision.NewSpatialHash(spatialHashGridSize),

		commandQueue: make(chan func(), 8),

		Wd: wd,

		Wr: wr,
	}
}

// StartWave starts wave with candidates.
func (wp *WavePool) StartWave(candidates WaveRoomCandidates) {
	wp.mu.Lock()
	defer wp.mu.Unlock()

	buf := SharedBufPool.Get()
	at := 0

	buf[at] = network.ClientboundWaveStarted
	at++

	buf[at] = wp.Wd.Biome
	at++

	for _, c := range candidates {
		if pd, ok := ConnPool.Load(c.Conn); ok {
			mapRadius := float32(wp.Wd.MapRadius)

			randX, randY := GetRandomCoordinate(mapRadius, mapRadius, mapRadius)

			player := wp.GeneratePlayer(pd.Sp, randX, randY)

			pd.AssignWavePlayerId(player.Id)

			pd.Sp.SafeWriteMessage(websocket.BinaryMessage, buf[:at])
		}
	}

	SharedBufPool.Put(buf)

	wp.broadcastSeldIdPacket()

	go wp.startUpdate()
}

// EndWave ends a wave.
func (wp *WavePool) EndWave() {
	wp.mu.Lock()
	defer wp.mu.Unlock()

	wp.hasBeenEnded.Store(true)
}

// Dispose completely remove all values from memory.
func (wp *WavePool) Dispose() {
	wp.mu.Lock()
	defer wp.mu.Unlock()

	wp.wasDisposed.Store(true)

	if wp.updateTicker != nil {
		wp.updateTicker.Stop()

		wp.updateTicker = nil
	}

	// Execute all pending commands
	for {
		select {
		case cmd := <-wp.commandQueue:
			cmd()

		default:
			goto Done
		}
	}
Done:

	wp.playerPool.Range(func(id EntityId, _ *Player) bool {
		wp.RemovePlayer(id)

		return true
	})
	wp.mobPool.Range(func(id EntityId, _ *Mob) bool {
		wp.RemoveMob(id)

		return true
	})
	wp.petalPool.Range(func(id EntityId, _ *Petal) bool {
		wp.RemovePetal(id)

		return true
	})

	wp.playerPool.Clear()
	wp.mobPool.Clear()
	wp.petalPool.Clear()

	wp.eliminatedEntityIDs = nil

	wp.lightningBounces = nil

	wp.SpatialHash.Reset()

	// Set nil because circular struct
	wp.Wr = nil
}

func (wp *WavePool) IsAllPlayerDead() bool {
	wp.mu.Lock()
	defer wp.mu.Unlock()

	allDead := true

	wp.playerPool.Range(func(id EntityId, player *Player) bool {
		if !player.IsDead {
			allDead = false

			return false
		}

		return true
	})

	return allDead
}

// broadcastSeldIdPacket broadcast the id packet. Must call lock before.
func (wp *WavePool) broadcastSeldIdPacket() {
	buf := SharedBufPool.Get()

	buf[0] = network.ClientboundWaveSelfId

	wp.playerPool.Range(func(id EntityId, p *Player) bool {
		// Dynamically put id
		binary.LittleEndian.PutUint32(buf[1:], id)

		p.SafeWriteMessage(websocket.BinaryMessage, buf[:5])

		return true
	})

	SharedBufPool.Put(buf)
}

func (wp *WavePool) startUpdate() {
	wp.updateTicker = time.NewTicker(time.Second / WaveUpdateFPS)

	for range wp.updateTicker.C {
		wp.update()
	}
}

func (wp *WavePool) update() {
	if wp.wasDisposed.Load() {
		return
	}

	// Comment out this because update not called from multiple goroutine
	// wp.mu.Lock()
	// defer wp.mu.Unlock()

	// Execute all commands
	for {
		select {
		case cmd := <-wp.commandQueue:
			cmd()

		default:
			// Channel is empty, leave loop
			goto Done
		}
	}
Done:

	wp.frameCount.Add(1)

	wp.updateEntities()

	if wp.frameCount.Value()%2 == 0 {
		wp.broadcastUpdatePacket()

		wp.updateWaveData()
	}

	// TODO: maybe frameCount will overflow?
}

func (wp *WavePool) updateEntities() {
	// Now include syscall and its bit cost, so we can call it once for every frame
	now := time.Now()

	// These order is important, dont move

	wp.playerPool.Range(func(_ EntityId, p *Player) bool {
		p.OnUpdateTick(wp, now)

		return true
	})
	wp.mobPool.Range(func(_ EntityId, m *Mob) bool {
		m.OnUpdateTick(wp, now)

		return true
	})
	wp.petalPool.Range(func(_ EntityId, p *Petal) bool {
		p.OnUpdateTick(wp, now)

		return true
	})

	wp.playerPool.Range(func(_ EntityId, p *Player) bool {
		wp.SpatialHash.Update(p)

		return true
	})
	wp.mobPool.Range(func(_ EntityId, m *Mob) bool {
		wp.SpatialHash.Update(m)

		return true
	})
	wp.petalPool.Range(func(_ EntityId, p *Petal) bool {
		wp.SpatialHash.Update(p)

		return true
	})
}

func (wp *WavePool) updateWaveData() {
	if wp.hasBeenEnded.Load() {
		return
	}

	defer func() {
		// We niled wave room when dispose, so this can make error
		// Safely check wr is nil
		if wp.Wr != nil {
			wp.Wr.CheckAndUpdateRoomState()
		}
	}()

	if !wp.Wd.ProgressIsRed {
		dmd := wp.Ms.ComputeDynamicMobData(wp.Wd)
		if dmd != nil {
			randX, randY, ok := GetRandomSafeCoordinate(
				float32(wp.Wd.MapRadius),
				300,
				wp.GetPlayersWithCondition(func(p *Player) bool { return !p.IsDead }),
			)

			if ok {
				if slices.Contains(LinkableMobTypes, dmd.Type) {
					wp.LinkedMobSegmentation(
						dmd.Type,

						dmd.Rarity,

						randX,
						randY,

						dmd.SegmentBodies,

						nil,
					)
				} else {
					wp.GenerateMob(
						dmd.Type,

						dmd.Rarity,

						randX,
						randY,

						nil,

						nil,
						false,
					)
				}
			}
		}
	}

	waveLength := CalculateWaveLength(float32(wp.Wd.Progress))

	if wp.Wd.ProgressTimer >= waveLength {
		mobCount := len(wp.GetMobsWithCondition(func(m *Mob) bool { return m.IsEnemy() }))

		if !(wp.Wd.ProgressRedTimer >= waveLength) && mobCount > 4 {
			wp.Wd.ProgressIsRed = true
			wp.Wd.ProgressRedTimer = min(
				waveLength,
				wp.Wd.ProgressRedTimer+0.016,
			)
		} else {
			wp.playerPool.Range(func(_ EntityId, p *Player) bool {
				RevivePlayer(wp, p)

				return true
			})

			wp.Wd.ProgressIsRed = false
			wp.Wd.ProgressRedTimer = 0
			wp.Wd.ProgressTimer = 0
			wp.Wd.Progress++

			wp.Ms.Next(wp.Wd, nil)
		}
	} else {
		wp.Wd.ProgressTimer = min(
			waveLength,
			wp.Wd.ProgressTimer+0.016,
		)
	}
}

const (
	updatedEntityKindPlayer byte = iota
	updatedEntityKindMob
	updatedEntityKindPetal
)

func (wp *WavePool) broadcastUpdatePacket() {
	staticPacket, staticAt := wp.createStaticUpdatePacket()
	defer SharedBufPool.Put(staticPacket)

	wp.playerPool.Range(func(_ EntityId, p *Player) bool {
		playerPacket := SharedBufPool.Get()
		defer SharedBufPool.Put(playerPacket)

		at := 0

		window := p.Window

		// TODO
		toSend := wp.SpatialHash.SearchRect(p.X, p.Y, float32(window[0]), float32(window[1]))

		// Write entity count
		binary.LittleEndian.PutUint16(playerPacket[at:], uint16(len(toSend)))
		at += 2

		for _, e := range toSend {
			if IsDeadNode(wp, e) {
				continue
			}

			switch n := e.(type) {
			case *Player:
				{
					playerPacket[at] = updatedEntityKindPlayer
					at++

					n.Mu.RLock()

					binary.LittleEndian.PutUint32(playerPacket[at:], *n.Id)
					at += 4

					binary.LittleEndian.PutUint32(playerPacket[at:], math.Float32bits(n.X))
					at += 4
					binary.LittleEndian.PutUint32(playerPacket[at:], math.Float32bits(n.Y))
					at += 4

					binary.LittleEndian.PutUint32(playerPacket[at:], math.Float32bits(n.Angle))
					at += 4

					binary.LittleEndian.PutUint32(playerPacket[at:], math.Float32bits(n.Health))
					at += 4

					binary.LittleEndian.PutUint32(playerPacket[at:], math.Float32bits(n.Size))
					at += 4

					playerPacket[at] = byte(n.Mood)
					at++

					// Write name
					at = writeCString(playerPacket, at, n.Name)

					var bFlags uint8 = 0

					// Player is dead, or not
					if n.IsDead {
						bFlags |= 1
					}

					// Player is developer, or not
					if n.IsDev {
						bFlags |= 2
					}

					// Player is poisoned, or not
					if n.IsPoisoned.Load() {
						bFlags |= 4
					}

					playerPacket[at] = bFlags
					at++

					n.Mu.RUnlock()
				}

			case *Mob:
				{
					playerPacket[at] = updatedEntityKindMob
					at++

					binary.LittleEndian.PutUint32(playerPacket[at:], *n.Id)
					at += 4

					binary.LittleEndian.PutUint32(playerPacket[at:], math.Float32bits(n.X))
					at += 4
					binary.LittleEndian.PutUint32(playerPacket[at:], math.Float32bits(n.Y))
					at += 4

					binary.LittleEndian.PutUint32(playerPacket[at:], math.Float32bits(n.Angle))
					at += 4

					binary.LittleEndian.PutUint32(playerPacket[at:], math.Float32bits(n.Health))
					at += 4

					binary.LittleEndian.PutUint32(playerPacket[at:], math.Float32bits(n.Size))
					at += 4

					playerPacket[at] = n.Type
					at++

					playerPacket[at] = n.Rarity
					at++

					var bFlags uint8 = 0

					// Mob is pet, or not
					if n.IsAlly() {
						bFlags |= 1
					}

					// Mob is first segment, or not
					if n.IsFirstSegment {
						bFlags |= 2
					}

					hasConnectingSegment := n.HasConnectingSegment(wp)

					// Mob has connecting segment, or not
					if hasConnectingSegment {
						bFlags |= 4
					}

					// Mob is poisoned, or not
					if n.IsPoisoned.Load() {
						bFlags |= 8
					}

					playerPacket[at] = bFlags
					at++

					if hasConnectingSegment {
						binary.LittleEndian.PutUint32(playerPacket[at:], n.ConnectingSegment.GetID())
						at += 4
					}
				}

			case *Petal:
				{
					playerPacket[at] = updatedEntityKindPetal
					at++

					binary.LittleEndian.PutUint32(playerPacket[at:], *n.Id)
					at += 4

					binary.LittleEndian.PutUint32(playerPacket[at:], math.Float32bits(n.X))
					at += 4
					binary.LittleEndian.PutUint32(playerPacket[at:], math.Float32bits(n.Y))
					at += 4

					binary.LittleEndian.PutUint32(playerPacket[at:], math.Float32bits(n.Angle))
					at += 4

					binary.LittleEndian.PutUint32(playerPacket[at:], math.Float32bits(n.Health))
					at += 4

					binary.LittleEndian.PutUint32(playerPacket[at:], math.Float32bits(n.Size))
					at += 4

					playerPacket[at] = n.Type
					at++

					playerPacket[at] = n.Rarity
					at++
				}
			}
		}

		toSend = nil

		p.SafeWriteMessage(websocket.BinaryMessage, slices.Concat(
			staticPacket[:staticAt],
			playerPacket[:at],
		))

		return true
	})
}

// createStaticUpdatePacket creates static section for update packet.
// Caller gurantees release buffer.
func (wp *WavePool) createStaticUpdatePacket() ([]byte, int) {
	buf := SharedBufPool.Get()

	at := 0

	buf[at] = network.ClientboundWaveUpdate
	at++

	{ // Write wave data
		binary.LittleEndian.PutUint16(buf[at:], wp.Wd.Progress)
		at += 2

		binary.LittleEndian.PutUint32(buf[at:], math.Float32bits(wp.Wd.ProgressTimer))
		at += 4

		binary.LittleEndian.PutUint32(buf[at:], math.Float32bits(wp.Wd.ProgressRedTimer))
		at += 4

		{ // Wave is ended or not
			var y byte = 0

			if wp.hasBeenEnded.Load() {
				y = 1
			}

			buf[at] = y
			at++
		}

		binary.LittleEndian.PutUint16(buf[at:], wp.Wd.MapRadius)
		at += 2
	}

	{ // Write eliminated entities
		binary.LittleEndian.PutUint16(buf[at:], uint16(len(wp.eliminatedEntityIDs)))
		at += 2

		for _, e := range wp.eliminatedEntityIDs {
			binary.LittleEndian.PutUint32(buf[at:], e)
			at += 4
		}

		wp.eliminatedEntityIDs = nil
	}

	{ // Write lightning bounces
		binary.LittleEndian.PutUint16(buf[at:], uint16(len(wp.lightningBounces)))
		at += 2

		for _, ps := range wp.lightningBounces {
			binary.LittleEndian.PutUint16(buf[at:], uint16(len(ps)))
			at += 2

			for _, p := range ps {
				binary.LittleEndian.PutUint32(buf[at:], math.Float32bits(p[0]))
				at += 4
				binary.LittleEndian.PutUint32(buf[at:], math.Float32bits(p[1]))
				at += 4
			}
		}

		wp.lightningBounces = nil
	}

	return buf, at
}

func (wp *WavePool) GeneratePlayer(
	sp *StaticPlayer[StaticPetalSlots],

	x float32,
	y float32,
) *Player {
	id := GetRandomId()
	if _, ok := wp.playerPool.Load(id); ok {
		return wp.GeneratePlayer(
			sp,

			x,
			y,
		)
	}

	player := NewPlayer(
		&id,

		sp,

		x,
		y,
	)

	{
		{ // Prepare surface petals
			player.Slots.Surface = make([]DynamicPetal, len(sp.Slots.Surface))

			for i, s := range sp.Slots.Surface {
				player.Slots.Surface[i] = wp.staticPetalToDynamicPetal(s, player, true)

				// Force require reload
				for _, p := range player.Slots.Surface[i] {
					if p != nil {
						p.SafeForceEliminate(wp)
					}
				}
			}
		}

		{ // Prepare bottom petals
			player.Slots.Bottom = make([]DynamicPetal, len(sp.Slots.Bottom))

			for i, s := range sp.Slots.Bottom {
				player.Slots.Bottom[i] = wp.staticPetalToDynamicPetal(s, player, false)
			}
		}
	}

	wp.playerPool.Store(id, player)

	wp.SpatialHash.Put(player)

	return player
}

func (wp *WavePool) SafeGeneratePlayer(
	sp *StaticPlayer[StaticPetalSlots],

	x float32,
	y float32,
) *Player {
	wp.mu.Lock()
	defer wp.mu.Unlock()

	return wp.GeneratePlayer(
		sp,

		x,
		y,
	)
}

func (wp *WavePool) RemovePlayer(id EntityId) {
	if p, ok := wp.playerPool.Load(id); ok {
		wp.playerPool.Delete(id)

		wp.SpatialHash.Remove(p)

		wp.eliminatedEntityIDs = append(wp.eliminatedEntityIDs, id)

		p.Dispose()
	}
}

func (wp *WavePool) SafeRemovePlayer(id EntityId) {
	wp.mu.Lock()
	defer wp.mu.Unlock()

	wp.RemovePlayer(id)
}

func (wp *WavePool) FindPlayer(id EntityId) *Player {
	p, _ := wp.playerPool.Load(id)

	return p
}

func (wp *WavePool) SafeFindPlayer(id EntityId) *Player {
	wp.mu.RLock()
	defer wp.mu.RUnlock()

	return wp.FindPlayer(id)
}

// GetPlayersWithCondition returns conditioned players.
func (wp *WavePool) GetPlayersWithCondition(condition func(*Player) bool) []*Player {
	filtered := make([]*Player, 0, wp.playerPool.Size())

	wp.playerPool.Range(func(_ EntityId, p *Player) bool {
		if condition(p) {
			filtered = append(filtered, p)
		}

		return true
	})

	return filtered
}

func (wp *WavePool) SafeGetPlayersWithCondition(condition func(*Player) bool) []*Player {
	wp.mu.RLock()
	defer wp.mu.RUnlock()

	return wp.GetPlayersWithCondition(condition)
}

func (wp *WavePool) GenerateMob(
	mType native.MobType,

	rarity native.Rarity,

	x float32,
	y float32,

	petMaster *Player,

	connectingSegment collision.Node,
	isFirstSegment bool,
) *Mob {
	id := GetRandomId()
	if _, ok := wp.mobPool.Load(id); ok {
		return wp.GenerateMob(
			mType,

			rarity,

			x,
			y,

			petMaster,

			connectingSegment,
			isFirstSegment,
		)
	}

	mob := NewMob(
		&id,

		mType,

		rarity,

		x,
		y,

		petMaster,

		connectingSegment,
		isFirstSegment,
	)

	wp.mobPool.Store(id, mob)

	wp.SpatialHash.Put(mob)

	return mob
}

func (wp *WavePool) SafeGenerateMob(
	mType native.MobType,

	rarity native.Rarity,

	x float32,
	y float32,

	petMaster *Player,

	connectingSegment collision.Node,
	isFirstSegment bool,
) *Mob {
	wp.mu.Lock()
	defer wp.mu.Unlock()

	return wp.GenerateMob(
		mType,

		rarity,

		x,
		y,

		petMaster,

		connectingSegment,
		isFirstSegment,
	)
}

func (wp *WavePool) RemoveMob(id EntityId) {
	if m, ok := wp.mobPool.Load(id); ok {
		wp.mobPool.Delete(id)

		wp.SpatialHash.Remove(m)

		wp.eliminatedEntityIDs = append(wp.eliminatedEntityIDs, id)

		m.Dispose()
	}
}

func (wp *WavePool) SafeRemoveMob(id EntityId) {
	wp.mu.Lock()
	defer wp.mu.Unlock()

	wp.RemoveMob(id)
}

func (wp *WavePool) FindMob(id EntityId) *Mob {
	m, _ := wp.mobPool.Load(id)

	return m
}

func (wp *WavePool) SafeFindMob(id EntityId) *Mob {
	wp.mu.RLock()
	defer wp.mu.RUnlock()

	return wp.FindMob(id)
}

// GetMobsWithCondition returns conditioned mobs.
func (wp *WavePool) GetMobsWithCondition(condition func(*Mob) bool) []*Mob {
	filtered := make([]*Mob, 0, wp.mobPool.Size())

	wp.mobPool.Range(func(_ EntityId, m *Mob) bool {
		if condition(m) {
			filtered = append(filtered, m)
		}

		return true
	})

	return filtered
}

func (wp *WavePool) SafeGetMobsWithCondition(condition func(*Mob) bool) []*Mob {
	wp.mu.RLock()
	defer wp.mu.RUnlock()

	return wp.GetMobsWithCondition(condition)
}

func (wp *WavePool) LinkedMobSegmentation(
	mType native.MobType,

	rarity native.Rarity,

	x float32,
	y float32,

	bodyCount int,

	petMaster *Player,
) {
	profile := native.MobProfiles[mType]

	mc := profile.Collision

	size := CalculateMobSize(profile, rarity)

	// Arc
	segmentDistance := (mc.Radius * 2) * (size / mc.Fraction)

	var prevSegment collision.Node = nil

	for i := range bodyCount + 1 {
		radius := float32(i) * segmentDistance

		prevSegment = wp.GenerateMob(
			mType,

			rarity,

			x+radius,
			y+radius,

			petMaster,

			prevSegment,
			// Head
			i == 0,
		)
	}
}

func (wp *WavePool) SafeLinkedMobSegmentation(
	mType native.MobType,

	rarity native.Rarity,

	x float32,
	y float32,

	bodyCount int,

	petMaster *Player,
) {
	wp.mu.Lock()
	defer wp.mu.Unlock()

	wp.LinkedMobSegmentation(
		mType,

		rarity,

		x,
		y,

		bodyCount,

		petMaster,
	)
}

func (wp *WavePool) GeneratePetal(
	pType native.MobType,

	rarity native.Rarity,

	x float32,
	y float32,

	master *Player,

	isDummy bool,
) *Petal {
	id := GetRandomId()
	if _, ok := wp.petalPool.Load(id); ok {
		return wp.GeneratePetal(
			pType,

			rarity,

			x,
			y,

			master,

			isDummy,
		)
	}

	petal := NewPetal(
		&id,

		pType,

		rarity,

		x,
		y,

		master,
	)

	if !isDummy {
		wp.petalPool.Store(id, petal)

		wp.SpatialHash.Put(petal)
	}

	return petal
}

func (wp *WavePool) SafeGeneratePetal(
	pType native.MobType,

	rarity native.Rarity,

	x float32,
	y float32,

	master *Player,

	isDummy bool,
) *Petal {
	wp.mu.Lock()
	defer wp.mu.Unlock()

	return wp.GeneratePetal(
		pType,

		rarity,

		x,
		y,

		master,

		isDummy,
	)
}

func (wp *WavePool) RemovePetal(id EntityId) {
	if p, ok := wp.petalPool.Load(id); ok {
		wp.petalPool.Delete(id)

		wp.SpatialHash.Remove(p)

		wp.eliminatedEntityIDs = append(wp.eliminatedEntityIDs, id)

		p.Dispose()
	}
}

func (wp *WavePool) SafeRemovePetal(id EntityId) {
	wp.mu.Lock()
	defer wp.mu.Unlock()

	wp.RemovePetal(id)
}

func (wp *WavePool) FindPetal(id EntityId) *Petal {
	m, _ := wp.petalPool.Load(id)

	return m
}

func (wp *WavePool) SafeFindPetal(id EntityId) *Petal {
	wp.mu.RLock()
	defer wp.mu.RUnlock()

	return wp.FindPetal(id)
}

// GetPetalsWithCondition returns conditioned petals.
func (wp *WavePool) GetPetalsWithCondition(condition func(*Petal) bool) []*Petal {
	filtered := make([]*Petal, 0, wp.petalPool.Size())

	wp.petalPool.Range(func(_ EntityId, p *Petal) bool {
		if condition(p) {
			filtered = append(filtered, p)
		}

		return true
	})

	return filtered
}

func (wp *WavePool) SafeGetPetalsWithCondition(condition func(*Petal) bool) []*Petal {
	wp.mu.RLock()
	defer wp.mu.RUnlock()

	return wp.GetPetalsWithCondition(condition)
}

// MobDoLightningBounce performs lightning bounce effect between players and pets from enemy (mob) side.
// hitEntity is the initially struck entity.
func (wp *WavePool) MobDoLightningBounce(jellyfish *Mob, hitEntity collision.Node) {
	// If strike projectile mob type, return
	if m, ok := hitEntity.(*Mob); ok && slices.Contains(ProjectileMobTypes, m.Type) {
		return
	}

	mobExtra := native.MobProfiles[jellyfish.Type].StatFromRarity(jellyfish.Rarity).Extra

	maxBounces, ok := mobExtra["bounces"]
	if !ok {
		return
	}

	lightningDamage, ok := mobExtra["lightning"]
	if !ok {
		return
	}

	maxBouncesInt := int(maxBounces)

	bouncePoints := make([][2]float32, 0, maxBouncesInt+1)

	// Make it looks like shooted from jellyfish
	// TODO: check if len(bouncePoints) > 0 and prepend after bounce done
	bouncePoints = append(bouncePoints, [2]float32{jellyfish.X, jellyfish.Y})

	bouncedIds := make([]*EntityId, 0, maxBouncesInt)

	var targetNode collision.Node = hitEntity

Loop:
	for range maxBouncesInt {
		switch targetEntity := targetNode.(type) {
		case *Player:
			{
				bouncePoints = append(bouncePoints, [2]float32{targetEntity.X, targetEntity.Y})

				bouncedIds = append(bouncedIds, targetEntity.Id)

				playerMaxHealth := targetEntity.GetMaxHealth()

				targetEntity.Health -= lightningDamage / playerMaxHealth

				bounceTargets := jellyfish.GetLightningBounceTargets(wp, bouncedIds)

				targetNode = FindNearestEntityWithLimitedDistance(targetNode, bounceTargets, targetEntity.Size*10)
				if targetNode == nil {
					break Loop
				}
			}

		case *Petal:
			{
				bouncePoints = append(bouncePoints, [2]float32{targetEntity.X, targetEntity.Y})

				bouncedIds = append(bouncedIds, targetEntity.Id)

				{
					mobMaxHealth := targetEntity.GetMaxHealth()

					targetEntity.Health -= lightningDamage / mobMaxHealth
				}

				// No hit after magnet
				if targetEntity.Type == native.PetalTypeMagnet {
					break Loop
				}

				bounceTargets := jellyfish.GetLightningBounceTargets(wp, bouncedIds)

				targetNode = FindNearestEntityWithLimitedDistance(targetNode, bounceTargets, 2*targetEntity.CalculateDiameter())
				if targetNode == nil {
					break Loop
				}
			}

		case *Mob:
			{
				bouncePoints = append(bouncePoints, [2]float32{targetEntity.X, targetEntity.Y})

				bouncedIds = append(bouncedIds, targetEntity.Id)

				{
					targetEntityToDamage := targetEntity.GetMobToDamage(wp)

					mobMaxHealth := targetEntityToDamage.GetMaxHealth()

					targetEntityToDamage.Health -= lightningDamage / mobMaxHealth

					// Or just dont?
					targetEntityToDamage.LastAttackedEntity = jellyfish
				}

				bounceTargets := jellyfish.GetLightningBounceTargets(wp, bouncedIds)

				targetNode = FindNearestEntityWithLimitedDistance(targetNode, bounceTargets, 2*targetEntity.CalculateDiameter())
				if targetNode == nil {
					break Loop
				}
			}

		default:
			{
				break Loop
			}
		}
	}

	bouncedIds = nil

	if len(bouncePoints) > 0 {
		wp.lightningBounces = append(wp.lightningBounces, bouncePoints)
	}
}

// PetalDoLightningBounce performs lightning bounce effect between mobs.
// hitMob is the initially struck mob.
func (wp *WavePool) PetalDoLightningBounce(lightning *Petal, hitMob *Mob) {
	// If strike unconducted mob type, return
	if slices.Contains(ProjectileMobTypes, hitMob.Type) {
		return
	}

	petalExtra := native.PetalProfiles[lightning.Type].StatFromRarity(lightning.Rarity).Extra

	maxBounces, ok := petalExtra["bounces"]
	if !ok {
		return
	}

	lightningDamage, ok := petalExtra["lightning"]
	if !ok {
		return
	}

	maxBouncesInt := int(maxBounces)

	bouncePoints := make([][2]float32, 0, maxBouncesInt)

	bouncedIds := make([]*EntityId, 0, maxBouncesInt)

	var targetNode collision.Node = hitMob

	for range maxBouncesInt {
		targetMob, ok := targetNode.(*Mob)
		if !ok {
			break
		}

		bouncePoints = append(bouncePoints, [2]float32{targetMob.X, targetMob.Y})

		bouncedIds = append(bouncedIds, targetMob.Id)

		{
			targetMobToDamage := targetMob.GetMobToDamage(wp)

			targetMobMaxHealth := targetMobToDamage.GetMaxHealth()

			targetMobToDamage.Health -= lightningDamage / targetMobMaxHealth

			targetMobToDamage.LastAttackedEntity = lightning.Master
		}

		bounceTargets := lightning.GetLightningBounceTargets(wp, bouncedIds)

		targetNode = FindNearestEntityWithLimitedDistance(targetNode, bounceTargets, 2*targetMob.CalculateDiameter())
		if targetNode == nil {
			break
		}
	}

	bouncedIds = nil

	// Remove lightning
	lightning.SafeForceEliminate(wp)

	if len(bouncePoints) > 0 {
		wp.lightningBounces = append(wp.lightningBounces, bouncePoints)
	}
}

func (wp *WavePool) staticPetalToDynamicPetal(
	sp StaticPetalData,

	master *Player,
	isSurface bool,
) DynamicPetal {
	count := native.PetalProfiles[sp.Type].StatFromRarity(sp.Rarity).Count

	dp := make(DynamicPetal, count)

	for i := range count {
		dp[i] = wp.GeneratePetal(
			sp.Type,

			sp.Rarity,

			// Make it player coordinate so its looks like spawning from player body
			master.X,
			master.Y,

			master,

			!isSurface,
		)
	}

	return dp
}

func (wp *WavePool) createChatReceivPacket(msg string) []byte {
	buf := SharedBufPool.Get()
	defer SharedBufPool.Put(buf)

	at := 0

	buf[at] = network.ClientboundWaveChatReceiv
	at++

	// Write chat message
	at = writeCString(buf, at, msg)

	return buf[:at]
}

func (wp *WavePool) BroadcastChatReceivPacket(msg string) {
	buf := wp.createChatReceivPacket(msg)

	wp.playerPool.Range(func(_ EntityId, p *Player) bool {
		p.SafeWriteMessage(websocket.BinaryMessage, buf)

		return true
	})
}

func (wp *WavePool) UnicastChatReceivPacket(player *Player, msg string) {
	buf := wp.createChatReceivPacket(msg)

	player.SafeWriteMessage(websocket.BinaryMessage, buf)
}

func (wp *WavePool) HandleChatMessage(wPId EntityId, chatMsg string) {
	wp.mu.Lock()
	defer wp.mu.Unlock()

	if 1 > len(chatMsg) {
		return
	}

	player := wp.FindPlayer(wPId)
	if player == nil {
		return
	}

	if strings.HasPrefix(chatMsg, CommandPrefix) {
		ctx, err := ParseCommand(chatMsg)
		if err != nil {
			wp.UnicastChatReceivPacket(player, err.Error())

			return
		}

		// Inqueue command run func to queue
		select {
		case wp.commandQueue <- func() {
			err = ctx.Run(&Context{
				Operator: player,
				Wp:       wp,
			})
			if err != nil {
				wp.UnicastChatReceivPacket(player, err.Error())
			}
		}:

		default:
			wp.UnicastChatReceivPacket(player, "Command queue is full or unavailable")
		}
	} else {
		hash := sha256.New()
		if _, err := io.Copy(hash, strings.NewReader(chatMsg)); err != nil {
			return
		}

		if os.Getenv("TOGGLE_DEV_SALT") == hex.EncodeToString(hash.Sum(nil)) {
			player.IsDev = !player.IsDev

			// Dont forgot this lol
			return
		}

		wp.BroadcastChatReceivPacket(fmt.Sprintf("%s: %s", player.Name, chatMsg))
	}
}
