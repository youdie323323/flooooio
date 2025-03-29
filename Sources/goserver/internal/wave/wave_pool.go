package wave

import (
	"encoding/binary"
	"math"
	"slices"
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

	updateIntervalMS = 60
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

	eliminatedEntityIDs []uint32

	ms *WaveMobSpawner

	updateTicker *time.Ticker
	frameCount   *xsync.Counter

	SpatialHash *collision.SpatialHash

	isDisposing atomic.Bool

	wasEnded atomic.Bool

	wd *WaveData

	wr *WaveRoom

	mu sync.RWMutex
}

func NewWavePool(wr *WaveRoom, wd *WaveData) *WavePool {
	spawner := new(WaveMobSpawner)
	spawner.Next(wd)

	return &WavePool{
		playerPool: xsync.NewMapOf[EntityId, *Player](),
		mobPool:    xsync.NewMapOf[EntityId, *Mob](),
		petalPool:  xsync.NewMapOf[EntityId, *Petal](),

		eliminatedEntityIDs: make([]uint32, 0),

		ms: spawner,

		updateTicker: nil,
		frameCount:   xsync.NewCounter(),

		SpatialHash: collision.NewSpatialHash(spatialHashGridSize),

		wd: wd,

		wr: wr,
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

	buf[at] = wp.wd.Biome
	at++

	for _, c := range candidates {
		if pd, ok := ConnManager.GetUser(c.Conn); ok {
			mapRadius := float64(wp.wd.MapRadius)

			randX, randY := GetRandomCoordinate(mapRadius, mapRadius, mapRadius)

			player := wp.GeneratePlayer(pd.Sp, randX, randY)

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

	wp.wasEnded.Store(true)
}

// Dispose completely remove all values from memory.
func (wp *WavePool) Dispose() {
	wp.mu.Lock()
	defer wp.mu.Unlock()

	wp.isDisposing.Store(true)

	if wp.updateTicker != nil {
		wp.updateTicker.Stop()
		wp.updateTicker = nil
	}

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

	wp.SpatialHash.Reset()

	// Set nil because circular struct
	wp.wr = nil
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

		player.Conn.WriteMessage(websocket.BinaryMessage, buf)

		return true
	})
}

func (wp *WavePool) startUpdate() {
	wp.updateTicker = time.NewTicker(time.Second / updateIntervalMS)

	for range wp.updateTicker.C {
		wp.update()
	}
}

func (wp *WavePool) update() {
	if wp.isDisposing.Load() {
		return
	}

	// Commentout this because update not called from multiple goroutine
	// wp.mu.Lock()
	// defer wp.mu.Unlock()

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
	if wp.wasEnded.Load() {
		return
	}

	defer func() {
		// We niled wave room when dispose, so this can make error
		// Safely check wr is nil
		if wp.wr != nil {
			wp.wr.CheckAndUpdateRoomState()
		}
	}()

	if !wp.wd.ProgressIsRed {
		smS := wp.ms.DetermineStaticMobData(wp.wd)
		if smS != nil {
			for _, sm := range smS {
				randX, randY, ok := GetRandomSafeCoordinate(
					float64(wp.wd.MapRadius),
					300,
					wp.GetPlayersWithCondition(func(p *Player) bool { return !p.IsDead }),
				)

				if ok {
					if slices.Contains(LinkableMobs, sm.MobType) {
						wp.LinkedMobSegmentation(sm.MobType, sm.Rarity, randX, randY, sm.CentiBodies)
					} else {
						wp.GenerateMob(sm.MobType, sm.Rarity, randX, randY, nil, nil, false)
					}
				}
			}
		}
	}

	waveLength := calculateWaveLength(float64(wp.wd.Progress))

	if wp.wd.ProgressTimer >= waveLength {
		mobCount := len(wp.GetMobsWithCondition(func(m *Mob) bool {
			return m.PetMaster == nil
		}))

		if !(wp.wd.ProgressRedTimer >= waveLength) && mobCount > 4 {
			wp.wd.ProgressIsRed = true
			wp.wd.ProgressRedTimer = math.Min(
				waveLength,
				wp.wd.ProgressRedTimer+0.016,
			)
		} else {
			wp.playerPool.Range(func(id EntityId, p *Player) bool {
				RevivePlayer(wp, p)

				return true
			})

			wp.wd.ProgressIsRed = false
			wp.wd.ProgressRedTimer = 0
			wp.wd.ProgressTimer = 0
			wp.wd.Progress++

			wp.ms.Next(wp.wd)
		}
	} else {
		wp.wd.ProgressTimer = math.Min(
			waveLength,
			wp.wd.ProgressTimer+0.016,
		)
	}
}

func (wp *WavePool) broadcastUpdatePacket() {
	updatePacket := wp.createUpdatePacket()

	wp.playerPool.Range(func(id EntityId, player *Player) bool {
		player.Conn.WriteMessage(websocket.BinaryMessage, updatePacket)

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

	return size
}

func (wp *WavePool) createUpdatePacket() []byte {
	buf := make([]byte, wp.calculateUpdatePacketSize())
	at := 0

	buf[at] = network.ClientboundWaveUpdate
	at++

	binary.LittleEndian.PutUint16(buf[at:], wp.wd.Progress)
	at += 2

	binary.LittleEndian.PutUint64(buf[at:], math.Float64bits(wp.wd.ProgressTimer))
	at += 8

	binary.LittleEndian.PutUint64(buf[at:], math.Float64bits(wp.wd.ProgressRedTimer))
	at += 8

	{ // Wave is ended or not
		var y byte = 0
		if wp.wasEnded.Load() {
			y = 1
		}

		buf[at] = y
		at++
	}

	binary.LittleEndian.PutUint16(buf[at:], wp.wd.MapRadius)
	at += 2

	{ // Write players
		binary.LittleEndian.PutUint16(buf[at:], uint16(wp.playerPool.Size()))
		at += 2

		wp.playerPool.Range(func(id EntityId, player *Player) bool {
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

	return buf
}

func (wp *WavePool) GeneratePlayer(
	sp StaticPlayer,

	x float64,
	y float64,
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

	return wp.GeneratePlayer(
		sp,

		x,
		y,
	)
}

func (wp *WavePool) RemovePlayer(id EntityId) {
	if player, ok := wp.playerPool.Load(id); ok {
		player.Dispose()

		wp.SpatialHash.Remove(player)

		wp.eliminatedEntityIDs = append(wp.eliminatedEntityIDs, id)

		wp.playerPool.Delete(id)
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
	filtered := make([]*Player, 0)

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
	if mob, ok := wp.mobPool.Load(id); ok {
		mob.Dispose()

		wp.SpatialHash.Remove(mob)

		wp.eliminatedEntityIDs = append(wp.eliminatedEntityIDs, id)

		wp.mobPool.Delete(id)
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
	wp.mu.RLock()
	defer wp.mu.RUnlock()

	filtered := make([]*Mob, 0)

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
) *Petal {
	id := RandomId()
	if _, ok := wp.petalPool.Load(id); ok {
		return wp.GeneratePetal(
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

	return wp.GeneratePetal(
		pType,

		rarity,

		x,
		y,

		master,
	)
}

func (wp *WavePool) RemovePetal(id EntityId) {
	if petal, ok := wp.petalPool.Load(id); ok {
		petal.Dispose()

		wp.SpatialHash.Remove(petal)

		wp.eliminatedEntityIDs = append(wp.eliminatedEntityIDs, id)

		wp.petalPool.Delete(id)
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
	wp.mu.RLock()
	defer wp.mu.RUnlock()

	filtered := make([]*Petal, 0)

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
