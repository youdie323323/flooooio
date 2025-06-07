package wave

import (
	"encoding/binary"
	"math/rand/v2"
	"slices"
	"sync"
	"time"

	"flooooio/internal/wave/florr/native"
	"flooooio/internal/wave/kernel/network"

	"github.com/gorilla/websocket"
	"github.com/puzpuzpuz/xsync/v4"
)

const (
	waveRoomMaxPlayerAmount = 4 // Maxium player amount that how many joinable to wave room.

	waveRoomUpdatePacketSendIntervalMS = 30
)

type WaveRoomPlayerId = uint32

// StaticWaveRoomCandidatePlayer is static candidate player data to generate the dynamic player instance.
type StaticWaveRoomCandidatePlayer struct {
	*StaticPlayer[StaticPetalSlots]

	// Id is id of player.
	Id WaveRoomPlayerId
	// State is used for starting wave room.
	State PlayerState
	// Owner determinate if player is owner of wave room.
	Owner bool
}

type WaveRoomCandidates = []*StaticWaveRoomCandidatePlayer

type PlayerData struct {
	WrPId *WaveRoomPlayerId
	WPId  *EntityId

	// Sp represents static player data of user.
	Sp *StaticPlayer[StaticPetalSlots]

	mu sync.RWMutex
}

// ConnPool link conn and UserData together.
var ConnPool = xsync.NewMap[*websocket.Conn, *PlayerData]()

type WaveRoom struct {
	// updatePacketBroadcastTicker is ticker to send wave room update packet
	updatePacketBroadcastTicker *time.Ticker

	// WavePool is main core of wave.
	WavePool *WavePool

	// biome is static biome to start.
	biome native.Biome
	// code is unique identification.
	code WaveRoomCode
	// visibility is visibility state.
	visibility WaveRoomVisibility
	// state is state.
	state WaveRoomState
	// candidates is static player candidates to start.
	candidates WaveRoomCandidates

	mu sync.RWMutex
}

func (pd *PlayerData) AssignWaveRoomPlayerId(id *WaveRoomPlayerId) {
	var opcode byte
	if id != nil {
		opcode = network.ClientboundWaveRoomSelfId
	} else {
		opcode = network.ClientboundWaveRoomJoinFailed
	}

	buf := SharedBufPool.Get()
	at := 0

	buf[at] = opcode
	at++

	pd.mu.Lock()

	if id != nil {
		binary.LittleEndian.PutUint32(buf[at:], uint32(*id))
		at += 4

		pd.WrPId = id
	}

	pd.Sp.SafeWriteMessage(websocket.BinaryMessage, buf[:at])

	pd.mu.Unlock()

	SharedBufPool.Put(buf)
}

func (pd *PlayerData) AssignWavePlayerId(id *EntityId) {
	if id != nil {
		pd.mu.Lock()

		pd.WPId = id

		pd.mu.Unlock()
	}
}

func NewWaveRoom(b native.Biome, v WaveRoomVisibility) *WaveRoom {
	wr := &WaveRoom{
		updatePacketBroadcastTicker: time.NewTicker(time.Second / waveRoomUpdatePacketSendIntervalMS),

		WavePool: nil,

		biome:      b,
		code:       GenerateRandomWaveRoomCode(),
		visibility: v,
		state:      RoomStateWaiting,
		candidates: make([]*StaticWaveRoomCandidatePlayer, 0, waveRoomMaxPlayerAmount),
	}

	// They have circular property wr -> wp, wp -> wr
	// So init wp after initialized wr
	wr.WavePool = NewWavePool(wr, &WaveData{
		Biome: b,

		Progress:         43,
		ProgressTimer:    0,
		ProgressRedTimer: 0,
		ProgressIsRed:    false,

		MapRadius: 1500,
	})

	// Start sending update packet
	go wr.startBroadcastUpdatePacket()

	return wr
}

// RegisterPlayer adds new player candidate.
func (w *WaveRoom) RegisterPlayer(sp *StaticPlayer[StaticPetalSlots]) *WaveRoomPlayerId {
	w.mu.Lock()
	defer w.mu.Unlock()

	if !w.isNewPlayerRegisterable() {
		return nil
	}

	id := rand.Uint32()

	for _, c := range w.candidates {
		if c != nil && c.Id == id {
			return w.RegisterPlayer(sp)
		}
	}

	w.candidates = append(w.candidates, &StaticWaveRoomCandidatePlayer{
		StaticPlayer: sp,
		Id:           id,
		State:        PlayerStateNotReady,
		Owner:        len(w.candidates) == 0, // First player is the owner
	})

	w.CheckAndUpdateRoomState()

	return &id
}

// DeregisterPlayer remove candidate and return if it removed.
func (w *WaveRoom) DeregisterPlayer(id WaveRoomPlayerId) (ok bool) {
	w.mu.Lock()
	defer w.mu.Unlock()

	// If user leave while playing, its not working
	/*
		if w.state != RoomStateWaiting {
			return false
		}
	*/

	// Find player with matching id
	for i, c := range w.candidates {
		if c != nil && c.Id == id {
			savedIsOwner := c.Owner

			// Remove the candidate using slice operations
			w.candidates = slices.Delete(w.candidates, i, i+1)

			// Grant owner to first remaining candidate if owner was removed
			if savedIsOwner && len(w.candidates) > 0 {
				w.candidates[0].Owner = true
			}

			w.CheckAndUpdateRoomState()

			return true
		}
	}

	return false
}

// UpdatePlayerState update state of player.
func (w *WaveRoom) UpdatePlayerState(id WaveRoomPlayerId, s PlayerState) (ok bool) {
	w.mu.Lock()
	defer w.mu.Unlock()

	if w.state != RoomStateWaiting {
		return false
	}

	for _, c := range w.candidates {
		if c != nil && c.Id == id {
			c.State = s

			w.CheckAndUpdateRoomState()

			return true
		}
	}

	return false
}

// UpdatePlayerName update name of player.
func (w *WaveRoom) UpdatePlayerName(id WaveRoomPlayerId, name string) (ok bool) {
	w.mu.Lock()
	defer w.mu.Unlock()

	if w.state != RoomStateWaiting {
		return false
	}

	for _, c := range w.candidates {
		if c != nil && c.Id == id {
			c.Name = name

			w.CheckAndUpdateRoomState()

			return true
		}
	}

	return false
}

// UpdateRoomVisibility update visibility of this wave room.
func (w *WaveRoom) UpdateRoomVisibility(caller WaveRoomPlayerId, v WaveRoomVisibility) (ok bool) {
	w.mu.Lock()
	defer w.mu.Unlock()

	if w.state != RoomStateWaiting {
		return false
	}

	for _, c := range w.candidates {
		if c != nil && c.Id == caller && c.Owner {
			w.visibility = v

			w.CheckAndUpdateRoomState()

			return true
		}
	}

	return false
}

func (w *WaveRoom) isAllCandidateReady() bool {
	candidatesReady := true

	for _, c := range w.candidates {
		if c != nil && c.State != PlayerStateReady {
			candidatesReady = false

			break
		}
	}

	return candidatesReady
}

func (w *WaveRoom) CheckAndUpdateRoomState() {
	if w.state == RoomStateWaiting && len(w.candidates) != 0 && w.isAllCandidateReady() {
		w.StartWave()
	}

	if w.state == RoomStatePlaying && w.WavePool.IsAllPlayerDead() {
		w.EndWave()
	}
}

// StartWave starts a wave.
func (w *WaveRoom) StartWave() {
	w.state = RoomStatePlaying

	w.updatePacketBroadcastTicker.Stop()

	w.WavePool.StartWave(w.candidates)
}

// EndWave ends a wave.
func (w *WaveRoom) EndWave() {
	w.state = RoomStateEnded

	if w.WavePool != nil {
		w.WavePool.EndWave()
	}
}

func (w *WaveRoom) Dispose() {
	w.mu.Lock()
	defer w.mu.Unlock()

	w.WavePool.Dispose()
	// Set nil because circular struct
	w.WavePool = nil

	w.updatePacketBroadcastTicker.Stop()

	w.candidates = nil
}

// startBroadcastUpdatePacket starts sending update packets on an interval.
func (w *WaveRoom) startBroadcastUpdatePacket() {
	for range w.updatePacketBroadcastTicker.C {
		w.broadcastUpdatePacket()
	}
}

func (w *WaveRoom) broadcastUpdatePacket() {
	w.mu.RLock()
	defer w.mu.RUnlock()

	updatePacket := w.createUpdatePacket()

	for _, c := range w.candidates {
		c.SafeWriteMessage(websocket.BinaryMessage, updatePacket)
	}
}

// createUpdatePacket returns update packet to broadcast. Must rlock before call.
func (w *WaveRoom) createUpdatePacket() []byte {
	buf := SharedBufPool.Get()
	defer SharedBufPool.Put(buf)

	at := 0

	buf[at] = network.ClientboundWaveRoomUpdate
	at++

	buf[at] = byte(len(w.candidates))
	at++

	for _, c := range w.candidates {
		binary.LittleEndian.PutUint32(buf[at:], c.Id)
		at += 4

		// Write name
		at = writeCString(buf, at, c.Name)

		buf[at] = c.State
		at++
	}

	// Write code
	at = writeCString(buf, at, w.code)

	buf[at] = w.state
	at++

	buf[at] = w.visibility
	at++

	buf[at] = w.biome
	at++

	return buf[:at]
}

func (w *WaveRoom) isNewPlayerRegisterable() bool {
	return len(w.candidates) < waveRoomMaxPlayerAmount &&
		w.state == RoomStateWaiting
}
