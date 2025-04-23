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

	"flooooio/internal/collision"
	"flooooio/internal/native"
	"flooooio/internal/network"

	"github.com/gorilla/websocket"
	"github.com/puzpuzpuz/xsync/v3"
)

const (
	spatialHashGridSize = 1024

	WaveUpdateFPS = 60
)

func calculateWaveLength(x float64) float64 {
	return max(60, math.Pow(x, 0.2)*18.9287+30)
}

type WaveData struct {
	Biome native.Biome

	Progress         uint16
	ProgressTimer    float64
	ProgressRedTimer float64
	ProgressIsRed    bool

	MapRadius uint16
}

type WavePool struct {
	playerPool *xsync.MapOf[EntityId, *Player]
	mobPool    *xsync.MapOf[EntityId, *Mob]
	petalPool  *xsync.MapOf[EntityId, *Petal]

	Ms *WaveMobSpawner

	eliminatedEntityIDs []uint32

	lightningBounces [][][2]float64

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
	spawner.Next(wd)

	return &WavePool{
		playerPool: xsync.NewMapOf[EntityId, *Player](),
		mobPool:    xsync.NewMapOf[EntityId, *Mob](),
		petalPool:  xsync.NewMapOf[EntityId, *Petal](),

		Ms: spawner,

		eliminatedEntityIDs: make([]uint32, 0),

		lightningBounces: make([][][2]float64, 0),

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

	buf := make([]byte, 2)
	at := 0

	buf[at] = network.ClientboundWaveStarted
	at++

	buf[at] = wp.Wd.Biome
	at++

	for _, c := range candidates {
		if pd, ok := ConnManager.GetUser(c.Conn); ok {
			mapRadius := float64(wp.Wd.MapRadius)

			randX, randY := GetRandomCoordinate(mapRadius, mapRadius, mapRadius)

			player := wp.GeneratePlayer(pd.Sp, randX, randY)

			pd.AssignWavePlayerId(player.Id)

			pd.Sp.SafeWriteMessage(websocket.BinaryMessage, buf)
		}
	}

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
			goto done
		}
	}
done:

	wp.playerPool.Range(func(id EntityId, player *Player) bool {
		player.Dispose()

		return true
	})
	wp.mobPool.Range(func(id EntityId, mob *Mob) bool {
		mob.Dispose()

		return true
	})
	wp.petalPool.Range(func(id EntityId, petal *Petal) bool {
		petal.Dispose()

		return true
	})

	wp.playerPool.Clear()
	wp.mobPool.Clear()
	wp.petalPool.Clear()

	clear(wp.eliminatedEntityIDs)

	wp.lightningBounces = wp.lightningBounces[:0]

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
	buf := make([]byte, 5)

	buf[0] = network.ClientboundWaveSelfId

	wp.playerPool.Range(func(id EntityId, player *Player) bool {
		// Dynamically put id
		binary.LittleEndian.PutUint32(buf[1:], id)

		player.SafeWriteMessage(websocket.BinaryMessage, buf)

		return true
	})
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
			goto done
		}
	}
done:

	wp.frameCount.Add(1)

	wp.updateEntities()

	if wp.frameCount.Value()%2 == 0 {
		wp.broadcastUpdatePacket()

		wp.updateWaveData()
	}

	// TODO: maybe frameCount will overflow?
}

func (wp *WavePool) updateEntities() {
	wp.playerPool.Range(func(id EntityId, player *Player) bool {
		player.OnUpdateTick(wp)

		return true
	})
	wp.mobPool.Range(func(id EntityId, mob *Mob) bool {
		mob.OnUpdateTick(wp)

		return true
	})
	wp.petalPool.Range(func(id EntityId, petal *Petal) bool {
		petal.OnUpdateTick(wp)

		return true
	})

	wp.playerPool.Range(func(id EntityId, player *Player) bool {
		wp.SpatialHash.Update(player)

		return true
	})
	wp.mobPool.Range(func(id EntityId, mob *Mob) bool {
		wp.SpatialHash.Update(mob)

		return true
	})
	wp.petalPool.Range(func(id EntityId, petal *Petal) bool {
		wp.SpatialHash.Update(petal)

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
		sm := wp.Ms.DetermineStaticMobData(wp.Wd)
		if sm != nil {
			randX, randY, ok := GetRandomSafeCoordinate(
				float64(wp.Wd.MapRadius),
				300,
				wp.GetPlayersWithCondition(func(p *Player) bool { return !p.IsDead }),
			)

			if ok {
				if slices.Contains(LinkableMobs, sm.MobType) {
					wp.LinkedMobSegmentation(
						sm.MobType,

						sm.Rarity,

						randX,
						randY,

						sm.CentiBodies,
					)
				} else {
					wp.GenerateMob(
						sm.MobType,

						sm.Rarity,

						randX,
						randY,

						nil,

						nil,
						false,

						nil,
					)
				}
			}
		}
	}

	waveLength := calculateWaveLength(float64(wp.Wd.Progress))

	if wp.Wd.ProgressTimer >= waveLength {
		mobCount := len(wp.GetMobsWithCondition(func(m *Mob) bool {
			return m.PetMaster == nil
		}))

		if !(wp.Wd.ProgressRedTimer >= waveLength) && mobCount > 4 {
			wp.Wd.ProgressIsRed = true
			wp.Wd.ProgressRedTimer = math.Min(
				waveLength,
				wp.Wd.ProgressRedTimer+0.016,
			)
		} else {
			wp.playerPool.Range(func(id EntityId, p *Player) bool {
				RevivePlayer(wp, p)

				return true
			})

			wp.Wd.ProgressIsRed = false
			wp.Wd.ProgressRedTimer = 0
			wp.Wd.ProgressTimer = 0
			wp.Wd.Progress++

			wp.Ms.Next(wp.Wd)
		}
	} else {
		wp.Wd.ProgressTimer = math.Min(
			waveLength,
			wp.Wd.ProgressTimer+0.016,
		)
	}
}

func (wp *WavePool) broadcastUpdatePacket() {
	updatePacket := wp.createUpdatePacket()

	wp.playerPool.Range(func(id EntityId, player *Player) bool {
		player.SafeWriteMessage(websocket.BinaryMessage, updatePacket)

		return true
	})
}

func (wp *WavePool) calculateUpdatePacketSize() int {
	size := 1 + // Opcode
		// Wave progress
		2 +
		// Wave progress timer
		8 +
		// Wave progress red timer
		8 +
		// Wave ended
		1 +
		// Map radius
		2

	{ // Add player packet size
		// Player count
		size += 2
		wp.playerPool.Range(func(id EntityId, player *Player) bool {
			// String length is dynamically changeable, so we can do is just loop
			size += 4 + // Id
				// X
				8 +
				// Y
				8 +
				// Angle
				8 +
				// Health
				8 +
				// Size
				8 +
				// Mood
				1 +
				// Name length, null terminator
				(len(player.Name) + 1) +
				// Boolean flags
				1

			return true
		})
	}

	{ // Add mob packet size
		// Mob count
		size += 2
		size += wp.mobPool.Size() * (4 + // Id
			// X
			8 +
			// Y
			8 +
			// Angle
			8 +
			// Health
			8 +
			// Size
			8 +
			// Type
			1 +
			// Rarity
			1 +
			// Boolean flags
			1)
	}

	{ // Add petal packet size
		// Petal count
		size += 2
		size += wp.petalPool.Size() * (4 + // Id
			// X
			8 +
			// Y
			8 +
			// Angle
			8 +
			// Health
			8 +
			// Size
			8 +
			// Type
			1 +
			// Rarity
			1)
	}

	{ // Add size for eliminated entities
		// Eliminated entity count
		size += 2
		size += len(wp.eliminatedEntityIDs) * 4
	}

	{ // Add size for lightning bounces
		// Lightning bounce count
		size += 2

		for _, points := range wp.lightningBounces {
			// Points count
			size += 2
			// Each point has X and Y coordinates (float64)
			size += len(points) * (8 + 8)
		}
	}

	return size
}

func (wp *WavePool) createUpdatePacket() []byte {
	wp.mu.Lock()

	buf := make([]byte, wp.calculateUpdatePacketSize())
	at := 0

	buf[at] = network.ClientboundWaveUpdate
	at++

	binary.LittleEndian.PutUint16(buf[at:], wp.Wd.Progress)
	at += 2

	binary.LittleEndian.PutUint64(buf[at:], math.Float64bits(wp.Wd.ProgressTimer))
	at += 8

	binary.LittleEndian.PutUint64(buf[at:], math.Float64bits(wp.Wd.ProgressRedTimer))
	at += 8

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

	{ // Write players
		binary.LittleEndian.PutUint16(buf[at:], uint16(wp.playerPool.Size()))
		at += 2

		wp.playerPool.Range(func(id EntityId, player *Player) bool {
			player.Mu.RLock()

			binary.LittleEndian.PutUint32(buf[at:], id)
			at += 4

			binary.LittleEndian.PutUint64(buf[at:], math.Float64bits(player.X))
			at += 8
			binary.LittleEndian.PutUint64(buf[at:], math.Float64bits(player.Y))
			at += 8

			binary.LittleEndian.PutUint64(buf[at:], math.Float64bits(player.Angle))
			at += 8

			binary.LittleEndian.PutUint64(buf[at:], math.Float64bits(player.Health))
			at += 8

			binary.LittleEndian.PutUint64(buf[at:], math.Float64bits(player.Size))
			at += 8

			buf[at] = byte(player.Mood)
			at++

			{ // Write name
				copy(buf[at:], []byte(player.Name))
				at += len(player.Name)

				// Write null terminator
				buf[at] = 0
				at++
			}

			var bFlags uint8 = 0

			// Player is dead, or not
			if player.IsDead {
				bFlags |= 1
			}

			// Player is developer, or not
			if player.IsDev {
				bFlags |= 2
			}

			buf[at] = bFlags
			at++

			player.Mu.RUnlock()

			return true
		})
	}

	{ // Write mobs
		binary.LittleEndian.PutUint16(buf[at:], uint16(wp.mobPool.Size()))
		at += 2

		wp.mobPool.Range(func(id EntityId, mob *Mob) bool {
			binary.LittleEndian.PutUint32(buf[at:], id)
			at += 4

			binary.LittleEndian.PutUint64(buf[at:], math.Float64bits(mob.X))
			at += 8
			binary.LittleEndian.PutUint64(buf[at:], math.Float64bits(mob.Y))
			at += 8

			binary.LittleEndian.PutUint64(buf[at:], math.Float64bits(mob.Angle))
			at += 8

			binary.LittleEndian.PutUint64(buf[at:], math.Float64bits(mob.Health))
			at += 8

			binary.LittleEndian.PutUint64(buf[at:], math.Float64bits(mob.Size))
			at += 8

			buf[at] = mob.Type
			at++

			buf[at] = mob.Rarity
			at++

			var bFlags uint8 = 0

			// Mob is pet, or not
			if !mob.IsEnemy() {
				bFlags |= 1
			}

			// Mob is first segment, or not
			if mob.IsFirstSegment {
				bFlags |= 2
			}

			buf[at] = bFlags
			at++

			return true
		})
	}

	{ // Write petals
		binary.LittleEndian.PutUint16(buf[at:], uint16(wp.petalPool.Size()))
		at += 2

		wp.petalPool.Range(func(id EntityId, petal *Petal) bool {
			binary.LittleEndian.PutUint32(buf[at:], id)
			at += 4

			binary.LittleEndian.PutUint64(buf[at:], math.Float64bits(petal.X))
			at += 8
			binary.LittleEndian.PutUint64(buf[at:], math.Float64bits(petal.Y))
			at += 8

			binary.LittleEndian.PutUint64(buf[at:], math.Float64bits(petal.Angle))
			at += 8

			binary.LittleEndian.PutUint64(buf[at:], math.Float64bits(petal.Health))
			at += 8

			binary.LittleEndian.PutUint64(buf[at:], math.Float64bits(petal.Size))
			at += 8

			buf[at] = petal.Type
			at++

			buf[at] = petal.Rarity
			at++

			return true
		})
	}

	{ // Write eliminated entities
		binary.LittleEndian.PutUint16(buf[at:], uint16(len(wp.eliminatedEntityIDs)))
		at += 2

		for _, e := range wp.eliminatedEntityIDs {
			binary.LittleEndian.PutUint32(buf[at:], e)
			at += 4
		}

		clear(wp.eliminatedEntityIDs)
	}

	{ // Write lightning bounces
		binary.LittleEndian.PutUint16(buf[at:], uint16(len(wp.lightningBounces)))
		at += 2

		for _, points := range wp.lightningBounces {
			binary.LittleEndian.PutUint16(buf[at:], uint16(len(points)))
			at += 2

			for _, point := range points {
				binary.LittleEndian.PutUint64(buf[at:], math.Float64bits(point[0]))
				at += 8
				binary.LittleEndian.PutUint64(buf[at:], math.Float64bits(point[1]))
				at += 8
			}
		}

		wp.lightningBounces = wp.lightningBounces[:0]
	}

	wp.mu.Unlock()

	return buf
}

func (wp *WavePool) GeneratePlayer(
	sp *StaticPlayer[StaticPetalSlots],

	x float64,
	y float64,
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

	x float64,
	y float64,
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
	if player, ok := wp.playerPool.Load(id); ok {
		wp.playerPool.Delete(id)

		wp.SpatialHash.Remove(player)

		wp.eliminatedEntityIDs = append(wp.eliminatedEntityIDs, id)

		player.Dispose()
	}
}

func (wp *WavePool) SafeRemovePlayer(id EntityId) {
	wp.mu.Lock()
	defer wp.mu.Unlock()

	wp.RemovePlayer(id)
}

func (wp *WavePool) FindPlayer(id EntityId) *Player {
	player, _ := wp.playerPool.Load(id)

	return player
}

func (wp *WavePool) SafeFindPlayer(id EntityId) *Player {
	wp.mu.RLock()
	defer wp.mu.RUnlock()

	return wp.FindPlayer(id)
}

// GetPlayersWithCondition returns conditioned players.
func (wp *WavePool) GetPlayersWithCondition(condition func(*Player) bool) []*Player {
	filtered := make([]*Player, 0, wp.playerPool.Size())

	wp.playerPool.Range(func(id EntityId, player *Player) bool {
		if condition(player) {
			filtered = append(filtered, player)
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

	x float64,
	y float64,

	petMaster *Player,

	connectingSegment collision.Node,
	isFirstSegment bool,

	missileMaster *Mob,
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

			missileMaster,
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

		missileMaster,
	)

	wp.mobPool.Store(id, mob)

	wp.SpatialHash.Put(mob)

	return mob
}

func (wp *WavePool) SafeGenerateMob(
	mType native.MobType,

	rarity native.Rarity,

	x float64,
	y float64,

	petMaster *Player,

	connectingSegment collision.Node,
	isFirstSegment bool,

	missileMaster *Mob,
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

		missileMaster,
	)
}

func (wp *WavePool) RemoveMob(id EntityId) {
	if mob, ok := wp.mobPool.Load(id); ok {
		wp.mobPool.Delete(id)

		wp.SpatialHash.Remove(mob)

		wp.eliminatedEntityIDs = append(wp.eliminatedEntityIDs, id)

		mob.Dispose()
	}
}

func (wp *WavePool) SafeRemoveMob(id EntityId) {
	wp.mu.Lock()
	defer wp.mu.Unlock()

	wp.RemoveMob(id)
}

func (wp *WavePool) FindMob(id EntityId) *Mob {
	mob, _ := wp.mobPool.Load(id)

	return mob
}

func (wp *WavePool) SafeFindMob(id EntityId) *Mob {
	wp.mu.RLock()
	defer wp.mu.RUnlock()

	return wp.FindMob(id)
}

// GetMobsWithCondition returns conditioned mobs.
func (wp *WavePool) GetMobsWithCondition(condition func(*Mob) bool) []*Mob {
	filtered := make([]*Mob, 0, wp.mobPool.Size())

	wp.mobPool.Range(func(id EntityId, mob *Mob) bool {
		if condition(mob) {
			filtered = append(filtered, mob)
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

	x float64,
	y float64,

	bodyCount int,
) {
	profile := native.MobProfiles[mType]

	mc := profile.Collision

	size := CalculateMobSize(profile, rarity)

	// Arc
	segmentDistance := (mc.Radius * 2) * (size / mc.Fraction)

	var prevSegment collision.Node = nil

	for i := range bodyCount + 1 {
		radius := float64(i) * segmentDistance

		prevSegment = wp.GenerateMob(
			mType,

			rarity,

			x+radius,
			y+radius,

			nil,

			prevSegment,
			// Head
			i == 0,

			nil,
		)
	}
}

func (wp *WavePool) SafeLinkedMobSegmentation(
	mType native.MobType,

	rarity native.Rarity,

	x float64,
	y float64,

	bodyCount int,
) {
	wp.mu.Lock()
	defer wp.mu.Unlock()

	wp.LinkedMobSegmentation(
		mType,

		rarity,

		x,
		y,

		bodyCount,
	)
}

func (wp *WavePool) GeneratePetal(
	pType native.MobType,

	rarity native.Rarity,

	x float64,
	y float64,

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

	x float64,
	y float64,

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
	if petal, ok := wp.petalPool.Load(id); ok {
		wp.petalPool.Delete(id)

		wp.SpatialHash.Remove(petal)

		wp.eliminatedEntityIDs = append(wp.eliminatedEntityIDs, id)

		petal.Dispose()
	}
}

func (wp *WavePool) SafeRemovePetal(id EntityId) {
	wp.mu.Lock()
	defer wp.mu.Unlock()

	wp.RemovePetal(id)
}

func (wp *WavePool) FindPetal(id EntityId) *Petal {
	mob, _ := wp.petalPool.Load(id)

	return mob
}

func (wp *WavePool) SafeFindPetal(id EntityId) *Petal {
	wp.mu.RLock()
	defer wp.mu.RUnlock()

	return wp.FindPetal(id)
}

// GetPetalsWithCondition returns conditioned petals.
func (wp *WavePool) GetPetalsWithCondition(condition func(*Petal) bool) []*Petal {
	filtered := make([]*Petal, 0, wp.petalPool.Size())

	wp.petalPool.Range(func(id EntityId, petal *Petal) bool {
		if condition(petal) {
			filtered = append(filtered, petal)
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

func (wp *WavePool) getMobLightningBounceTargets(bouncedIds []*EntityId) []collision.Node {
	playerTargets := wp.GetPlayersWithCondition(func(targetPlayer *Player) bool {
		return !slices.Contains(bouncedIds, targetPlayer.Id)
	})

	// Target pets
	mobTargets := wp.GetMobsWithCondition(func(targetMob *Mob) bool {
		return !slices.Contains(bouncedIds, targetMob.Id) && targetMob.PetMaster != nil
	})

	lenPlayerTargets := len(playerTargets)
	lenMobTargets := len(mobTargets)

	nodeTargets := make([]collision.Node, lenPlayerTargets+lenMobTargets)

	for i, player := range playerTargets {
		nodeTargets[i] = player
	}

	for i, mob := range mobTargets {
		nodeTargets[lenPlayerTargets+i] = mob
	}

	return nodeTargets
}

// MobDoLightningBounce performs lightning bounce effect between players and pets from enemy (mob) side.
// hitEntity is the initially struck entity.
func (wp *WavePool) MobDoLightningBounce(jellyfish *Mob, hitEntity collision.Node) {
	mobExtra := native.MobProfiles[jellyfish.Type].StatFromRarity(jellyfish.Rarity).Extra

	maxBounces, ok := mobExtra["bounces"].(float64)
	if !ok {
		return
	}

	lightningDamage, ok := mobExtra["lightning"].(float64)
	if !ok {
		return
	}

	maxBouncesInt := int(maxBounces)

	bouncePoints := make([][2]float64, 0, maxBouncesInt+1)

	// Make it looks like shooted from jellyfish
	// TODO: check if len(bouncePoints) > 0 and prepend after bounce done
	bouncePoints = append(bouncePoints, [2]float64{jellyfish.X, jellyfish.Y})

	bouncedIds := make([]*EntityId, 0, maxBouncesInt)

	var targetNode collision.Node = hitEntity

Loop:
	for range maxBouncesInt {
		switch targetEntity := targetNode.(type) {
		case *Player:
			{
				bouncePoints = append(bouncePoints, [2]float64{targetEntity.X, targetEntity.Y})

				bouncedIds = append(bouncedIds, targetEntity.Id)

				playerMaxHealth := targetEntity.GetMaxHealth()

				targetEntity.Health -= lightningDamage / playerMaxHealth

				bounceTargets := wp.getMobLightningBounceTargets(bouncedIds)

				targetNode = FindNearestEntityWithLimitedDistance(targetNode, bounceTargets, targetEntity.Size*10)
				if targetNode == nil {
					break Loop
				}
			}

		case *Mob:
			{
				// Missile is not electrical
				if targetEntity.Type == native.MobTypeMissile {
					break Loop
				}

				bouncePoints = append(bouncePoints, [2]float64{targetEntity.X, targetEntity.Y})

				bouncedIds = append(bouncedIds, targetEntity.Id)

				mobMaxHealth := targetEntity.GetMaxHealth()

				targetEntity.Health -= lightningDamage / mobMaxHealth

				// Or just dont?
				targetEntity.LastAttackedEntity = jellyfish

				bounceTargets := wp.getMobLightningBounceTargets(bouncedIds)

				// Distance is radius * 1.5
				// TODO: this should very very expanded
				targetNode = FindNearestEntityWithLimitedDistance(targetNode, bounceTargets, targetEntity.CalculateRadius()*3)
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

	clear(bouncedIds)

	if len(bouncePoints) > 0 {
		wp.lightningBounces = append(wp.lightningBounces, bouncePoints)
	}
}

// PetalDoLightningBounce performs lightning bounce effect between mobs.
// hitMob is the initially struck mob.
func (wp *WavePool) PetalDoLightningBounce(lightning *Petal, hitMob *Mob) {
	petalExtra := native.PetalProfiles[lightning.Type].StatFromRarity(lightning.Rarity).Extra

	maxBounces, ok := petalExtra["bounces"].(float64)
	if !ok {
		return
	}

	lightningDamage, ok := petalExtra["lightning"].(float64)
	if !ok {
		return
	}

	maxBouncesInt := int(maxBounces)

	bouncePoints := make([][2]float64, 0, maxBouncesInt)

	bouncedIds := make([]*EntityId, 0, maxBouncesInt)

	var targetNode collision.Node = hitMob

	for range maxBouncesInt {
		targetMob, ok := targetNode.(*Mob)
		if !ok {
			break
		}

		// Missile is not electrical
		if targetMob.Type == native.MobTypeMissile {
			break
		}

		bouncePoints = append(bouncePoints, [2]float64{targetMob.X, targetMob.Y})

		bouncedIds = append(bouncedIds, targetMob.Id)

		mobMaxHealth := targetMob.GetMaxHealth()

		targetMob.Health -= lightningDamage / mobMaxHealth

		targetMob.LastAttackedEntity = lightning.Master

		mobTargets := wp.GetMobsWithCondition(func(targetMob *Mob) bool {
			return !slices.Contains(bouncedIds, targetMob.Id) && targetMob.PetMaster == nil
		})

		nodeTargets := make([]collision.Node, len(mobTargets))
		for i, mob := range mobTargets {
			nodeTargets[i] = mob
		}

		// Distance is radius * 1.5
		// TODO: this should very very expanded
		targetNode = FindNearestEntityWithLimitedDistance(targetNode, nodeTargets, targetMob.CalculateRadius()*3)
		if targetNode == nil {
			break
		}
	}

	clear(bouncedIds)

	// Remove lightning
	lightning.SafeForceEliminate(wp)

	if len(bouncePoints) > 0 {
		wp.lightningBounces = append(wp.lightningBounces, bouncePoints)
	}
}

func (wp *WavePool) staticPetalToDynamicPetal(
	sp StaticPetal,

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
	buf := make(
		[]byte,
		1+ // Opcode size
			4+ // Player id size
			(len(msg)+1), // Length + null terminator
	)
	at := 0

	buf[at] = network.ClientboundWaveChatReceiv
	at++

	{ // Write chat message
		copy(buf[at:], []byte(msg))
		at += len(msg)

		// Write null terminator
		buf[at] = 0
		at++
	}

	return buf
}

func (wp *WavePool) BroadcastChatReceivPacket(msg string) {
	buf := wp.createChatReceivPacket(msg)

	wp.playerPool.Range(func(id EntityId, player *Player) bool {
		player.SafeWriteMessage(websocket.BinaryMessage, buf)

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
			player.IsDev = true

			// Dont forgot this lol
			return
		}

		wp.BroadcastChatReceivPacket(fmt.Sprintf("%s: %s", player.Name, chatMsg))
	}
}
