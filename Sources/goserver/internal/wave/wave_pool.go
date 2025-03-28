package wave

import (
	"encoding/binary"
	"math"
	"sync"
	"time"

	"flooooio/internal/collision"
	"flooooio/internal/native"
	"flooooio/internal/network"

	"github.com/gorilla/websocket"
	"github.com/puzpuzpuz/xsync/v3"
)

const (
	SpatialHashGridSize = 1024

	UpdateIntervalMS = 60
)

type WaveData struct {
	biome native.Biome

	progress         uint16
	progressTimer    float64
	progressRedTimer float64
	progressIsRed    bool

	mapRadius uint16
}

type WavePool struct {
	playerPool *xsync.MapOf[PlayerId, *Player]
	mobPool    *xsync.MapOf[MobId, *Mob]
	petalPool  *xsync.MapOf[PetalId, *Petal]

	eliminatedEntityIDs []uint32

	updateTicker *time.Ticker
	frameCount   *xsync.Counter

	SpatialHash *collision.SpatialHash[collision.Node]

	waveData *WaveData

	mu sync.RWMutex
}

func NewWavePool(wd *WaveData) *WavePool {
	return &WavePool{
		playerPool: xsync.NewMapOf[PlayerId, *Player](),
		mobPool:    xsync.NewMapOf[MobId, *Mob](),
		petalPool:  xsync.NewMapOf[PetalId, *Petal](),

		eliminatedEntityIDs: make([]uint32, 0),

		updateTicker: nil,
		frameCount:   xsync.NewCounter(),

		waveData: wd,

		SpatialHash: collision.NewSpatialHash[collision.Node](SpatialHashGridSize),
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

	buf[at] = wp.waveData.biome
	at++

	for _, c := range candidates {
		if pd, ok := ConnManager.GetUser(c.Conn); ok {
			mapRadius := float64(wp.waveData.mapRadius)

			randX, randY := GetRandomCoordinate(mapRadius, mapRadius, mapRadius)

			player := wp.generatePlayer(pd.Sp, randX, randY)

			pd.AssignWavePlayerId(player.Id)

			pd.Sp.Conn.WriteMessage(websocket.BinaryMessage, buf)
		}
	}

	wp.broadcastSeldIdPacket()

	go wp.startUpdate()
}

// EndWave ends a wave.
func (wp *WavePool) EndWave() {
	wp.mu.Lock()
	defer wp.mu.Unlock()
}

// Dispose completely remove all values from memory.
func (wp *WavePool) Dispose() {
	wp.mu.Lock()
	defer wp.mu.Unlock()

	if wp.updateTicker != nil {
		wp.updateTicker.Stop()
		wp.updateTicker = nil
	}

	// TODO: call all entity dispose

	wp.eliminatedEntityIDs = nil

	wp.waveData = nil

	wp.SpatialHash.Reset()
	wp.SpatialHash = nil
}

func (wp *WavePool) IsAllPlayerDead() bool {
	wp.mu.Lock()
	defer wp.mu.Unlock()

	allDead := true

	wp.playerPool.Range(func(id PlayerId, player *Player) bool {
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

	wp.playerPool.Range(func(id PlayerId, player *Player) bool {
		binary.LittleEndian.PutUint32(buf[1:], id)

		player.Conn.WriteMessage(websocket.BinaryMessage, buf)

		return true
	})
}

func (wp *WavePool) startUpdate() {
	wp.updateTicker = time.NewTicker(UpdateIntervalMS * time.Millisecond)

	for range wp.updateTicker.C {
		wp.update()
	}
}

func (wp *WavePool) update() {
	wp.frameCount.Add(1)

	wp.updateEntities()

	wp.broadcastUpdatePacket()

	if wp.frameCount.Value()%2 == 0 {
		// updateWave
	}

	// TODO: maybe frameCount will overflow?
}

func (wp *WavePool) updateEntities() {
	wp.mu.RLock()

	wp.playerPool.Range(func(id PlayerId, player *Player) bool {
		player.OnUpdateTickBase(wp)
		player.OnUpdateTickPlayer(wp)

		return true
	})
	wp.mobPool.Range(func(id MobId, mob *Mob) bool {
		mob.OnUpdateTickBase(wp)
		mob.OnUpdateTickMob(wp)

		return true
	})
	wp.petalPool.Range(func(id PetalId, petal *Petal) bool {
		petal.OnUpdateTickBase(wp)
		petal.OnUpdateTickPetal(wp)

		return true
	})

	wp.playerPool.Range(func(id PlayerId, player *Player) bool {
		wp.SpatialHash.Update(player)

		return true
	})
	wp.mobPool.Range(func(id MobId, mob *Mob) bool {
		wp.SpatialHash.Update(mob)

		return true
	})
	wp.petalPool.Range(func(id PetalId, petal *Petal) bool {
		wp.SpatialHash.Update(petal)

		return true
	})

	wp.mu.RUnlock()
}

func (wp *WavePool) broadcastUpdatePacket() {
	wp.mu.Lock()

	updatePacket := wp.createUpdatePacket()

	wp.playerPool.Range(func(id PlayerId, player *Player) bool {
		player.Conn.WriteMessage(websocket.BinaryMessage, updatePacket)

		return true
	})

	wp.mu.Unlock()
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
		wp.playerPool.Range(func(id PlayerId, player *Player) bool {
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

	return size
}

func (wp *WavePool) createUpdatePacket() []byte {
	buf := make([]byte, wp.calculateUpdatePacketSize())
	at := 0

	buf[at] = network.ClientboundWaveUpdate
	at++

	binary.LittleEndian.PutUint16(buf[at:], wp.waveData.progress)
	at += 2

	binary.LittleEndian.PutUint64(buf[at:], math.Float64bits(wp.waveData.progressTimer))
	at += 8

	binary.LittleEndian.PutUint64(buf[at:], math.Float64bits(wp.waveData.progressRedTimer))
	at += 8

	buf[at] = 0
	at++

	binary.LittleEndian.PutUint16(buf[at:], wp.waveData.mapRadius)
	at += 2

	{ // Write players
		binary.LittleEndian.PutUint16(buf[at:], uint16(wp.playerPool.Size()))
		at += 2

		wp.playerPool.Range(func(id PlayerId, player *Player) bool {
			binary.LittleEndian.PutUint32(buf[at:], *player.Id)
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

			return true
		})
	}

	{ // Write mobs
		binary.LittleEndian.PutUint16(buf[at:], uint16(wp.mobPool.Size()))
		at += 2

		wp.mobPool.Range(func(id MobId, mob *Mob) bool {
			binary.LittleEndian.PutUint32(buf[at:], *mob.Id)
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
			if mob.PetMaster != nil {
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

		wp.petalPool.Range(func(id PetalId, petal *Petal) bool {
			binary.LittleEndian.PutUint32(buf[at:], *petal.Id)
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

	return buf
}

func (wp *WavePool) generatePlayer(
	sp StaticPlayer,

	x float64,
	y float64,
) *Player {
	id := RandomId()
	if _, ok := wp.playerPool.Load(id); ok {
		return wp.generatePlayer(
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

	wp.playerPool.Store(id, player)

	wp.SpatialHash.Put(player)

	return player
}

func (wp *WavePool) SafeGeneratePlayer(
	sp StaticPlayer,

	x float64,
	y float64,
) *Player {
	wp.mu.Lock()
	defer wp.mu.Unlock()

	return wp.generatePlayer(
		sp,

		x,
		y,
	)
}

func (wp *WavePool) removePlayer(id PlayerId) {
	if player, ok := wp.playerPool.Load(id); ok {
		// player.dispose

		wp.SpatialHash.Remove(player)

		wp.eliminatedEntityIDs = append(wp.eliminatedEntityIDs, id)

		wp.playerPool.Delete(id)
	}
}

func (wp *WavePool) SafeRemovePlayer(id PlayerId) {
	wp.mu.Lock()
	defer wp.mu.Unlock()

	wp.removePlayer(id)
}

func (wp *WavePool) findPlayer(id PlayerId) *Player {
	player, _ := wp.playerPool.Load(id)

	return player
}

func (wp *WavePool) SafeFindPlayer(id PlayerId) *Player {
	wp.mu.RLock()
	defer wp.mu.RUnlock()

	return wp.findPlayer(id)
}

func (wp *WavePool) generateMob(
	mType native.MobType,

	rarity native.Rarity,

	x float64,
	y float64,

	petMaster *Entity,

	connectingSegment *Entity,
	isFirstSegment bool,
) *Mob {
	id := RandomId()
	if _, ok := wp.mobPool.Load(id); ok {
		return wp.generateMob(
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

	x float64,
	y float64,

	petMaster *Entity,

	connectingSegment *Entity,
	isFirstSegment bool,
) *Mob {
	wp.mu.Lock()
	defer wp.mu.Unlock()

	return wp.generateMob(
		mType,

		rarity,

		x,
		y,

		petMaster,

		connectingSegment,
		isFirstSegment,
	)
}

func (wp *WavePool) removeMob(id MobId) {
	if mob, ok := wp.mobPool.Load(id); ok {
		// mob.dispose

		wp.SpatialHash.Remove(mob)

		wp.eliminatedEntityIDs = append(wp.eliminatedEntityIDs, id)

		wp.mobPool.Delete(id)
	}
}

func (wp *WavePool) SafeRemoveMob(id MobId) {
	wp.mu.Lock()
	defer wp.mu.Unlock()

	wp.removeMob(id)
}

func (wp *WavePool) findMob(id MobId) *Mob {
	mob, _ := wp.mobPool.Load(id)

	return mob
}

func (wp *WavePool) SafeFindMob(id MobId) *Mob {
	wp.mu.RLock()
	defer wp.mu.RUnlock()

	return wp.findMob(id)
}

func (wp *WavePool) generatePetal(
	pType native.MobType,

	rarity native.Rarity,

	x float64,
	y float64,

	master *Player,
) *Petal {
	id := RandomId()
	if _, ok := wp.petalPool.Load(id); ok {
		return wp.generatePetal(
			pType,

			rarity,

			x,
			y,

			master,
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

	wp.petalPool.Store(id, petal)

	wp.SpatialHash.Put(petal)

	return petal
}

func (wp *WavePool) SafeGeneratePetal(
	pType native.MobType,

	rarity native.Rarity,

	x float64,
	y float64,

	master *Player,
) *Petal {
	wp.mu.Lock()
	defer wp.mu.Unlock()

	return wp.generatePetal(
		pType,

		rarity,

		x,
		y,

		master,
	)
}

func (wp *WavePool) removePetal(id PetalId) {
	if petal, ok := wp.petalPool.Load(id); ok {
		// petal.dispose

		wp.SpatialHash.Remove(petal)

		wp.eliminatedEntityIDs = append(wp.eliminatedEntityIDs, id)

		wp.petalPool.Delete(id)
	}
}

func (wp *WavePool) SafeRemovePetal(id PetalId) {
	wp.mu.Lock()
	defer wp.mu.Unlock()

	wp.removePetal(id)
}

func (wp *WavePool) findPetal(id PetalId) *Petal {
	mob, _ := wp.petalPool.Load(id)

	return mob
}

func (wp *WavePool) SafeFindPetal(id PetalId) *Petal {
	wp.mu.RLock()
	defer wp.mu.RUnlock()

	return wp.findPetal(id)
}