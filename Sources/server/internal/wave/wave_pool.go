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
	spatialHashGridSize = 512

	PoolUpdatePerSec = 60
	DataUpdatePerSec = PoolUpdatePerSec / 2

	DeltaT = 1. / PoolUpdatePerSec
)

const (
	kb = 1024
	mb = 1024 * kb
	gb = 1024 * mb
)

// TODO: if buffer index is above buf len, would panic
var SharedBufPool = zeropool.New(func() []byte { return make([]byte, 256*kb) })

func writeCString[T ~string](buf []byte, at int, s T) int {
	n := copy(buf[at:], s)

	buf[at+n] = 0

	return at + n + 1
}

type DataProgress = uint16

type Data struct {
	Biome native.Biome

	Progress         DataProgress
	ProgressTimer    float32
	ProgressRedTimer float32
	ProgressIsRed    bool

	MapRadius uint16
}

type Pool struct {
	playerPool *xsync.Map[EntityId, *Player]
	mobPool    *xsync.Map[EntityId, *Mob]
	petalPool  *xsync.Map[EntityId, *Petal]

	// Room is wave room for this wave pool.
	Room *Room

	// Data is current data.
	Data *Data

	// Spawner is mob spawner.
	Spawner *MobSpawner

	eliminatedEntityIds []EntityId

	lightningBounces [][][2]float32

	updateTicker       *time.Ticker
	updateTickerStopCh chan struct{}

	frameCount *xsync.Counter

	SpatialHash *collision.SpatialHash

	hasBeenEnded atomic.Bool

	// commandQueue is command queue to run command with atomic.
	// If command fn is returns true, command execution will force ends.
	commandQueue chan func() bool

	Mu sync.RWMutex
}

func NewPool(wr *Room, data *Data) *Pool {
	return &Pool{
		playerPool: xsync.NewMap[EntityId, *Player](),
		mobPool:    xsync.NewMap[EntityId, *Mob](),
		petalPool:  xsync.NewMap[EntityId, *Petal](),

		Spawner: NewMobSpawner(data),

		eliminatedEntityIds: make([]EntityId, 0),

		lightningBounces: make([][][2]float32, 0),

		updateTicker:       nil,
		updateTickerStopCh: make(chan struct{}),

		frameCount: xsync.NewCounter(),

		SpatialHash: collision.NewSpatialHash(spatialHashGridSize),

		commandQueue: make(chan func() bool, 8),

		Data: data,

		Room: wr,
	}
}

// Start starts a wave with candidates.
func (wp *Pool) Start(candidates RoomCandidates) {
	wp.Mu.Lock()
	defer wp.Mu.Unlock()

	buf := SharedBufPool.Get()
	at := 0

	buf[at] = network.ClientboundWaveStarted
	at++

	buf[at] = wp.Data.Biome
	at++

	for _, c := range candidates {
		if pd, ok := ConnPool.Load(c.Conn); ok {
			mapRadius := float32(wp.Data.MapRadius)

			randX, randY := GetRandomCoordinate(mapRadius, mapRadius, mapRadius)

			player := wp.GeneratePlayer(pd.StaticPlayer, randX, randY)

			pd.AssignWavePlayerId(player.Id)

			pd.StaticPlayer.SafeWriteMessage(websocket.BinaryMessage, buf[:at])
		}
	}

	SharedBufPool.Put(buf)

	wp.broadcastSeldIdPacket()

	go wp.startUpdate()
}

// End ends a wave.
func (wp *Pool) End() {
	wp.Mu.Lock()
	defer wp.Mu.Unlock()

	wp.hasBeenEnded.Store(true)
}

// Dispose completely removes all values.
func (wp *Pool) Dispose() {
	wp.Mu.Lock()
	defer wp.Mu.Unlock()

	select { // Inqueue dispose fn
	case wp.commandQueue <- func() bool {
		// Send stop signal
		close(wp.updateTickerStopCh)

		wp.playerPool.Range(func(_ EntityId, p *Player) bool {
			p.Mu.Lock()

			p.Dispose()

			p.Mu.Unlock()

			return true
		})
		wp.mobPool.Range(func(_ EntityId, m *Mob) bool {
			m.Mu.Lock()

			m.Dispose()

			m.Mu.Unlock()

			return true
		})
		wp.petalPool.Range(func(_ EntityId, p *Petal) bool {
			p.Mu.Lock()

			p.Dispose()

			p.Mu.Unlock()

			return true
		})

		wp.playerPool.Clear()
		wp.mobPool.Clear()
		wp.petalPool.Clear()

		wp.eliminatedEntityIds = nil

		wp.lightningBounces = nil

		wp.SpatialHash.Reset()

		// Set nil because circular struct
		wp.Room = nil

		return true
	}:

	default:
		fmt.Println("Command queue is full or unavailable")
	}
}

func (wp *Pool) IsAllPlayersDead() bool {
	wp.Mu.Lock()
	defer wp.Mu.Unlock()

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

// broadcastSeldIdPacket broadcasts self id packet to every player.
// Caller must guarantees lock resource using Mu before call this.
func (wp *Pool) broadcastSeldIdPacket() {
	buf := SharedBufPool.Get()

	buf[0] = network.ClientboundWaveSelfId

	wp.playerPool.Range(func(id EntityId, p *Player) bool {
		i := 1 + PutUvarint16(buf[1:], id)

		p.SafeWriteMessage(websocket.BinaryMessage, buf[:i])

		return true
	})

	SharedBufPool.Put(buf)
}

func (wp *Pool) startUpdate() {
	wp.updateTicker = time.NewTicker(time.Second / PoolUpdatePerSec)
	defer wp.updateTicker.Stop()

	for {
		select {
		case <-wp.updateTickerStopCh:
			return

		case <-wp.updateTicker.C:
			wp.update()
		}
	}
}

func (wp *Pool) update() {
	for { // Execute all commands
		select {
		case cmd, ok := <-wp.commandQueue:
			if !ok {
				return
			}

			shouldClose := cmd()
			if shouldClose {
				// Execute remaining commands before closing
				for cmd := range wp.commandQueue {
					cmd()
				}

				close(wp.commandQueue)

				return
			}

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

		wp.stepData()
	}

	// TODO: maybe frameCount will overflow?
}

func (wp *Pool) updateEntities() {
	// Now include syscall and its bit cost, so we can call it once for every frame
	now := time.Now()

	// These order is important, dont move it

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

// stepData steps a wave data, this function should be called every Δt (= DeltaT) seconds.
func (wp *Pool) stepData() {
	if wp.hasBeenEnded.Load() {
		return
	}

	defer func() {
		// We nil wave room when dispose, so this can cause error,
		// check room is nil to avoid
		if wp.Room != nil {
			// CheckAndUpdateState requires resource lock
			wp.Room.Mu.Lock()
			defer wp.Room.Mu.Unlock()

			wp.Room.CheckAndUpdateState()
		}
	}()

	if !wp.Data.ProgressIsRed {
		dmd := wp.Spawner.ComputeDynamicMobData(wp.Data)
		if dmd != nil {
			randX, randY, ok := GetRandomSafeCoordinate(
				float32(wp.Data.MapRadius),
				300,
				wp.FilterPlayersWithCondition(func(p *Player) bool { return !p.IsDead }),
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

	waveLength := CalculateWaveLength(float32(wp.Data.Progress))

	if wp.Data.ProgressTimer >= waveLength {
		mobCount := len(wp.FilterMobsWithCondition(func(m *Mob) bool { return m.IsEnemy() }))

		if !(wp.Data.ProgressRedTimer >= waveLength) && mobCount > 4 {
			wp.Data.ProgressIsRed = true
			wp.Data.ProgressRedTimer = min(
				waveLength,
				wp.Data.ProgressRedTimer+0.016,
			)
		} else {
			wp.playerPool.Range(func(_ EntityId, p *Player) bool {
				RevivePlayer(wp, p)

				return true
			})

			wp.Data.ProgressIsRed = false
			wp.Data.ProgressRedTimer = 0
			wp.Data.ProgressTimer = 0
			wp.Data.Progress++

			wp.Spawner.Next(wp.Data, nil)
		}
	} else {
		wp.Data.ProgressTimer = min(
			waveLength,
			wp.Data.ProgressTimer+0.016,
		)
	}
}

// WriteFloat32 writes float32 into buf.
// Float32bits always return big value, so its counterproductive with varint.
func WriteFloat32(buf []byte, x float32) int {
	binary.LittleEndian.PutUint32(buf, math.Float32bits(x))
	return 4
}

// PutUvarint16 encodes a uint16 into buf and returns the number of bytes written.
// If the buffer is too small, PutUvarint16 will panic.
func PutUvarint16(buf []byte, x uint16) int {
	i := 0
	for x >= 0x80 {
		buf[i] = byte(x) | 0x80
		x >>= 7
		i++
	}
	buf[i] = byte(x)
	return i + 1
}

// FiniteObjectCount possible objects length.
type FiniteObjectCount = uint16

const ( // Entity kind for client identify entity read type.
	entityKindPlayer byte = iota
	entityKindMob
	entityKindPetal
)

// broadcastUpdatePacket broadcasts update packet to every player.
func (wp *Pool) broadcastUpdatePacket() {
	wp.Mu.Lock()
	defer wp.Mu.Unlock()

	packet := SharedBufPool.Get()
	defer SharedBufPool.Put(packet)

	at := wp.writeStaticUpdatePacket(packet)

	wp.playerPool.Range(func(_ EntityId, p *Player) bool {
		dynamicAt := at

		// RLock before read window
		p.Mu.RLock()

		window := p.Window

		p.Mu.RUnlock()

		entitiesToSend := wp.SpatialHash.QueryRect(
			p.X, p.Y,
			float32(window[0]), float32(window[1]),
			func(n collision.Node) bool {
				return !IsDeadNode(wp, n)
			},
		)

		// Write entity count
		dynamicAt += PutUvarint16(packet[dynamicAt:], FiniteObjectCount(len(entitiesToSend)))

		for _, e := range entitiesToSend {
			switch n := e.(type) {
			case *Player:
				{
					packet[dynamicAt] = entityKindPlayer
					dynamicAt++

					dynamicAt += PutUvarint16(packet[dynamicAt:], n.Id)

					dynamicAt += WriteFloat32(packet[dynamicAt:], n.X)
					dynamicAt += WriteFloat32(packet[dynamicAt:], n.Y)

					dynamicAt += WriteFloat32(packet[dynamicAt:], n.Angle)

					dynamicAt += WriteFloat32(packet[dynamicAt:], n.Health)

					dynamicAt += WriteFloat32(packet[dynamicAt:], n.Size)

					packet[dynamicAt] = byte(n.Mood)
					dynamicAt++

					// Write name
					dynamicAt = writeCString(packet, dynamicAt, n.Name)

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

					// Player is proper-damaged, or not
					if n.ConsumeWasProperDamage() {
						bFlags |= 8
					}

					packet[dynamicAt] = bFlags
					dynamicAt++
				}

			case *Mob:
				{
					packet[dynamicAt] = entityKindMob
					dynamicAt++

					dynamicAt += PutUvarint16(packet[dynamicAt:], n.Id)

					dynamicAt += WriteFloat32(packet[dynamicAt:], n.X)
					dynamicAt += WriteFloat32(packet[dynamicAt:], n.Y)

					dynamicAt += WriteFloat32(packet[dynamicAt:], n.Angle)

					dynamicAt += WriteFloat32(packet[dynamicAt:], n.Health)

					dynamicAt += WriteFloat32(packet[dynamicAt:], n.Size)

					packet[dynamicAt] = n.Type
					dynamicAt++

					packet[dynamicAt] = n.Rarity
					dynamicAt++

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

					// Mob is proper-damaged, or not
					if n.ConsumeWasProperDamage() {
						bFlags |= 16
					}

					packet[dynamicAt] = bFlags
					dynamicAt++

					if hasConnectingSegment {
						dynamicAt += PutUvarint16(packet[dynamicAt:], n.ConnectingSegment.GetId())
					}
				}

			case *Petal:
				{
					packet[dynamicAt] = entityKindPetal
					dynamicAt++

					dynamicAt += PutUvarint16(packet[dynamicAt:], n.Id)

					dynamicAt += WriteFloat32(packet[dynamicAt:], n.X)
					dynamicAt += WriteFloat32(packet[dynamicAt:], n.Y)

					dynamicAt += WriteFloat32(packet[dynamicAt:], n.Angle)

					dynamicAt += WriteFloat32(packet[dynamicAt:], n.Health)

					dynamicAt += WriteFloat32(packet[dynamicAt:], n.Size)

					packet[dynamicAt] = n.Type
					dynamicAt++

					packet[dynamicAt] = n.Rarity
					dynamicAt++

					var bFlags uint8 = 0

					// Petal is proper-damaged, or not
					if n.ConsumeWasProperDamage() {
						bFlags |= 1
					}

					packet[dynamicAt] = bFlags
					dynamicAt++
				}
			}
		}

		entitiesToSend = nil

		p.SafeWriteMessage(websocket.BinaryMessage, packet[:dynamicAt])

		return true
	})
}

// writeStaticUpdatePacket writes static section of update packet.
// Caller guarantees release buffer.
func (wp *Pool) writeStaticUpdatePacket(buf []byte) int {
	at := 0

	buf[at] = network.ClientboundWaveUpdate
	at++

	{ // Write wave data
		at += PutUvarint16(buf[at:], wp.Data.Progress)

		at += WriteFloat32(buf[at:], wp.Data.ProgressTimer)

		at += WriteFloat32(buf[at:], wp.Data.ProgressRedTimer)

		{ // Wave is ended or not
			if wp.hasBeenEnded.Load() {
				buf[at] = 1
			} else {
				buf[at] = 0
			}

			at++
		}

		at += PutUvarint16(buf[at:], wp.Data.MapRadius)
	}

	{ // Write eliminated entities
		at += PutUvarint16(buf[at:], FiniteObjectCount(len(wp.eliminatedEntityIds)))

		for _, e := range wp.eliminatedEntityIds {
			at += PutUvarint16(buf[at:], e)
		}

		wp.eliminatedEntityIds = nil
	}

	{ // Write lightning bounces
		at += PutUvarint16(buf[at:], FiniteObjectCount(len(wp.lightningBounces)))

		for _, bounces := range wp.lightningBounces {
			at += PutUvarint16(buf[at:], FiniteObjectCount(len(bounces)))

			for _, bounce := range bounces {
				at += WriteFloat32(buf[at:], bounce[0])
				at += WriteFloat32(buf[at:], bounce[1])
			}
		}

		wp.lightningBounces = nil
	}

	return at
}

func (wp *Pool) GeneratePlayer(
	sp *StaticPlayer[StaticPetalSlots],

	x float32,
	y float32,
) *Player {
	id := RandomId()
	if _, ok := wp.playerPool.Load(id); ok {
		return wp.GeneratePlayer(
			sp,

			x,
			y,
		)
	}

	player := NewPlayer(
		id,

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
				for _, petal := range player.Slots.Surface[i] {
					if petal != nil {
						petal.CompletelyRemove(wp)
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

		{ // Prepare surface supplies
			player.Slots.SurfaceSupplies = make([][]*StaticPetalData, len(sp.Slots.Surface))

			for i := range player.Slots.SurfaceSupplies {
				player.Slots.SurfaceSupplies[i] = make([]*StaticPetalData, PetalMaxClusterAmount)

				for j := range player.Slots.SurfaceSupplies[i] {
					player.Slots.SurfaceSupplies[i][j] = nil
				}
			}
		}
	}

	wp.playerPool.Store(id, player)

	wp.SpatialHash.Put(player)

	return player
}

func (wp *Pool) SafeGeneratePlayer(
	sp *StaticPlayer[StaticPetalSlots],

	x float32,
	y float32,
) *Player {
	wp.Mu.Lock()
	defer wp.Mu.Unlock()

	return wp.GeneratePlayer(
		sp,

		x,
		y,
	)
}

func (wp *Pool) RemovePlayer(id EntityId) {
	if p, ok := wp.playerPool.Load(id); ok {
		wp.playerPool.Delete(id)

		wp.SpatialHash.Remove(p)

		wp.eliminatedEntityIds = append(wp.eliminatedEntityIds, id)

		p.Dispose()
	}
}

func (wp *Pool) SafeRemovePlayer(id EntityId) {
	wp.Mu.Lock()

	wp.RemovePlayer(id)

	wp.Mu.Unlock()
}

func (wp *Pool) FindPlayer(id EntityId) *Player {
	p, _ := wp.playerPool.Load(id)

	return p
}

func (wp *Pool) SafeFindPlayer(id EntityId) *Player {
	wp.Mu.RLock()
	defer wp.Mu.RUnlock()

	return wp.FindPlayer(id)
}

// FilterPlayersWithCondition returns conditioned players.
func (wp *Pool) FilterPlayersWithCondition(condition func(*Player) bool) []*Player {
	filtered := make([]*Player, 0, wp.playerPool.Size())

	wp.playerPool.Range(func(_ EntityId, p *Player) bool {
		if condition(p) {
			filtered = append(filtered, p)
		}

		return true
	})

	return filtered
}

func (wp *Pool) SafeFilterPlayersWithCondition(condition func(*Player) bool) []*Player {
	wp.Mu.RLock()
	defer wp.Mu.RUnlock()

	return wp.FilterPlayersWithCondition(condition)
}

func (wp *Pool) GenerateMob(
	mType native.MobType,

	rarity native.Rarity,

	x float32,
	y float32,

	petMaster *Player,

	connectingSegment collision.Node,
	isFirstSegment bool,
) *Mob {
	id := RandomId()
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
		id,

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

func (wp *Pool) SafeGenerateMob(
	mType native.MobType,

	rarity native.Rarity,

	x float32,
	y float32,

	petMaster *Player,

	connectingSegment collision.Node,
	isFirstSegment bool,
) *Mob {
	wp.Mu.Lock()
	defer wp.Mu.Unlock()

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

func (wp *Pool) RemoveMob(id EntityId) {
	if m, ok := wp.mobPool.Load(id); ok {
		wp.mobPool.Delete(id)

		wp.SpatialHash.Remove(m)

		wp.eliminatedEntityIds = append(wp.eliminatedEntityIds, id)

		m.Dispose()
	}
}

func (wp *Pool) SafeRemoveMob(id EntityId) {
	wp.Mu.Lock()

	wp.RemoveMob(id)

	wp.Mu.Unlock()
}

func (wp *Pool) FindMob(id EntityId) *Mob {
	m, _ := wp.mobPool.Load(id)

	return m
}

func (wp *Pool) SafeFindMob(id EntityId) *Mob {
	wp.Mu.RLock()
	defer wp.Mu.RUnlock()

	return wp.FindMob(id)
}

// FilterMobsWithCondition returns conditioned mobs.
func (wp *Pool) FilterMobsWithCondition(condition func(*Mob) bool) []*Mob {
	filtered := make([]*Mob, 0, wp.mobPool.Size())

	wp.mobPool.Range(func(_ EntityId, m *Mob) bool {
		if condition(m) {
			filtered = append(filtered, m)
		}

		return true
	})

	return filtered
}

func (wp *Pool) SafeFilterMobsWithCondition(condition func(*Mob) bool) []*Mob {
	wp.Mu.RLock()
	defer wp.Mu.RUnlock()

	return wp.FilterMobsWithCondition(condition)
}

func (wp *Pool) LinkedMobSegmentation(
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

func (wp *Pool) SafeLinkedMobSegmentation(
	mType native.MobType,

	rarity native.Rarity,

	x float32,
	y float32,

	bodyCount int,

	petMaster *Player,
) {
	wp.Mu.Lock()
	defer wp.Mu.Unlock()

	wp.LinkedMobSegmentation(
		mType,

		rarity,

		x,
		y,

		bodyCount,

		petMaster,
	)
}

func (wp *Pool) GeneratePetal(
	pType native.MobType,

	rarity native.Rarity,

	x float32,
	y float32,

	master *Player,

	isDummy bool,
) *Petal {
	id := RandomId()
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
		id,

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

func (wp *Pool) SafeGeneratePetal(
	pType native.MobType,

	rarity native.Rarity,

	x float32,
	y float32,

	master *Player,

	isDummy bool,
) *Petal {
	wp.Mu.Lock()
	defer wp.Mu.Unlock()

	return wp.GeneratePetal(
		pType,

		rarity,

		x,
		y,

		master,

		isDummy,
	)
}

func (wp *Pool) RemovePetal(id EntityId) {
	if p, ok := wp.petalPool.Load(id); ok {
		wp.petalPool.Delete(id)

		wp.SpatialHash.Remove(p)

		wp.eliminatedEntityIds = append(wp.eliminatedEntityIds, id)

		p.Dispose()
	}
}

func (wp *Pool) SafeRemovePetal(id EntityId) {
	wp.Mu.Lock()

	wp.RemovePetal(id)

	wp.Mu.Unlock()
}

func (wp *Pool) FindPetal(id EntityId) *Petal {
	m, _ := wp.petalPool.Load(id)

	return m
}

func (wp *Pool) SafeFindPetal(id EntityId) *Petal {
	wp.Mu.RLock()
	defer wp.Mu.RUnlock()

	return wp.FindPetal(id)
}

// FilterPetalsWithCondition returns conditioned petals.
func (wp *Pool) FilterPetalsWithCondition(condition func(*Petal) bool) []*Petal {
	filtered := make([]*Petal, 0, wp.petalPool.Size())

	wp.petalPool.Range(func(_ EntityId, p *Petal) bool {
		if condition(p) {
			filtered = append(filtered, p)
		}

		return true
	})

	return filtered
}

func (wp *Pool) SafeFilterPetalsWithCondition(condition func(*Petal) bool) []*Petal {
	wp.Mu.RLock()
	defer wp.Mu.RUnlock()

	return wp.FilterPetalsWithCondition(condition)
}

// MobDoLightningBounce performs lightning bounce effect between players and pets from enemy (mob) side.
// hitEntity is the initially struck entity.
func (wp *Pool) MobDoLightningBounce(jellyfish *Mob, hitEntity collision.Node) {
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

	bouncedIds := make([]EntityId, 0, maxBouncesInt)

	var targetNode collision.Node = hitEntity

Loop:
	for range maxBouncesInt {
		switch targetEntity := targetNode.(type) {
		case *Player:
			{
				bouncePoints = append(bouncePoints, [2]float32{targetEntity.X, targetEntity.Y})

				bouncedIds = append(bouncedIds, targetEntity.Id)

				playerMaxHealth := targetEntity.MaxHealth()

				targetEntity.TakeProperDamage(lightningDamage / playerMaxHealth)

				bounceTargets := jellyfish.SearchLightningBounceTargets(wp, bouncedIds)

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
					mobMaxHealth := targetEntity.MaxHealth()

					targetEntity.TakeProperDamage(lightningDamage / mobMaxHealth)
				}

				// No hit after magnet
				if targetEntity.Type == native.PetalTypeMagnet {
					break Loop
				}

				bounceTargets := jellyfish.SearchLightningBounceTargets(wp, bouncedIds)

				targetNode = FindNearestEntityWithLimitedDistance(targetNode, bounceTargets, 2*targetEntity.Diameter())
				if targetNode == nil {
					break Loop
				}
			}

		case *Mob:
			{
				bouncePoints = append(bouncePoints, [2]float32{targetEntity.X, targetEntity.Y})

				bouncedIds = append(bouncedIds, targetEntity.Id)

				{
					targetEntityToDamage := targetEntity.MobToDamage(wp)

					mobMaxHealth := targetEntityToDamage.MaxHealth()

					targetEntityToDamage.TakeProperDamage(lightningDamage / mobMaxHealth)

					// Or just dont?
					targetEntityToDamage.LastAttackedEntity = jellyfish
				}

				bounceTargets := jellyfish.SearchLightningBounceTargets(wp, bouncedIds)

				targetNode = FindNearestEntityWithLimitedDistance(targetNode, bounceTargets, 2*targetEntity.Diameter())
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

		bouncePoints = nil
	}
}

// PetalDoLightningBounce performs lightning bounce effect between mobs.
// hitMob is the initially struck mob.
func (wp *Pool) PetalDoLightningBounce(lightning *Petal, hitMob *Mob) {
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

	bouncedIds := make([]EntityId, 0, maxBouncesInt)

	var targetNode collision.Node = hitMob

	for range maxBouncesInt {
		targetMob, ok := targetNode.(*Mob)
		if !ok {
			break
		}

		bouncePoints = append(bouncePoints, [2]float32{targetMob.X, targetMob.Y})

		bouncedIds = append(bouncedIds, targetMob.Id)

		{
			targetMobToDamage := targetMob.MobToDamage(wp)

			targetMobMaxHealth := targetMobToDamage.MaxHealth()

			targetMobToDamage.TakeProperDamage(lightningDamage / targetMobMaxHealth)

			targetMobToDamage.LastAttackedEntity = lightning.Master
		}

		bounceTargets := lightning.SearchLightningBounceTargets(wp, bouncedIds)

		targetNode = FindNearestEntityWithLimitedDistance(targetNode, bounceTargets, 2*targetMob.Diameter())
		if targetNode == nil {
			break
		}
	}

	bouncedIds = nil

	// Remove lightning
	lightning.ForceEliminate(wp)

	if len(bouncePoints) > 0 {
		wp.lightningBounces = append(wp.lightningBounces, bouncePoints)

		bouncePoints = nil
	}
}

func (wp *Pool) staticPetalToDynamicPetal(
	sp StaticPetalData,

	master *Player,
	isSurface bool,
) DynamicPetal {
	count := native.PetalProfiles[sp.Type].StatFromRarity(sp.Rarity).Count

	isNotSurface := !isSurface

	dp := make(DynamicPetal, count)

	for i := range count {
		dp[i] = wp.GeneratePetal(
			sp.Type,

			sp.Rarity,

			// Make it player coordinate so its looks like spawning from player body
			master.X,
			master.Y,

			master,

			isNotSurface,
		)
	}

	return dp
}

func (wp *Pool) createChatReceivePacket(msg string) []byte {
	buf := SharedBufPool.Get()
	defer SharedBufPool.Put(buf)

	at := 0

	buf[at] = network.ClientboundWaveChatReceive
	at++

	// Write chat message
	at = writeCString(buf, at, msg)

	return buf[:at]
}

func (wp *Pool) BroadcastChatReceivePacket(msg string) {
	buf := wp.createChatReceivePacket(msg)

	wp.playerPool.Range(func(_ EntityId, p *Player) bool {
		p.SafeWriteMessage(websocket.BinaryMessage, buf)

		return true
	})
}

func (wp *Pool) UnicastChatReceivePacket(player *Player, msg string) {
	buf := wp.createChatReceivePacket(msg)

	player.SafeWriteMessage(websocket.BinaryMessage, buf)
}

func (wp *Pool) HandleChatMessage(wPId EntityId, chatMsg string) {
	wp.Mu.Lock()
	defer wp.Mu.Unlock()

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
			wp.UnicastChatReceivePacket(player, err.Error())

			return
		}

		// Inqueue command run func to queue
		select {
		case wp.commandQueue <- func() bool {
			err = ctx.Run(&Context{
				Operator: player,
				Wp:       wp,
			})
			if err != nil {
				wp.UnicastChatReceivePacket(player, err.Error())
			}

			return false
		}:

		default:
			wp.UnicastChatReceivePacket(player, "Command queue is full or unavailable")
		}
	} else {
		hash := sha256.New()
		if _, err := io.Copy(hash, strings.NewReader(chatMsg)); err != nil {
			return
		}

		if os.Getenv("TOGGLE_DEV_SALT") == hex.EncodeToString(hash.Sum(nil)) {
			player.IsDev = !player.IsDev

			// Dont forget this lol
			return
		}

		wp.BroadcastChatReceivePacket(fmt.Sprintf("%s: %s", player.Name, chatMsg))
	}
}
