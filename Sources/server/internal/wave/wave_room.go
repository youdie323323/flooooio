package wave

import (
	"math/rand/v2"
	"slices"
	"sync"
	"sync/atomic"
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

type RoomCandidateId = uint16

// RoomCandidate is candidate player data to generate the dynamic player instance.
type RoomCandidate struct {
	*StaticPlayer[StaticPetalSlots]

	// Id is id.
	Id RoomCandidateId
	// State is used for starting wave room.
	State RoomPlayerReadyState
	// Owner determinate if player is owner of wave room.
	Owner bool
}

type RoomCandidates = []*RoomCandidate

type PlayerData struct {
	*StaticPlayer[StaticPetalSlots]

	WrPId *RoomCandidateId
	WPId  *EntityId

	mu sync.RWMutex
}

// ConnPool link conn and PlayerData, respectively.
var ConnPool = xsync.NewMap[*websocket.Conn, *PlayerData]()

type Room struct {
	// updatePacketBroadcastTicker is ticker to send wave room update packet
	updatePacketBroadcastTicker *time.Ticker

	// Pool is wave pool of this wave room.
	Pool *Pool

	// biome is static biome for start pool.
	biome native.Biome
	// code is unique identification of this room.
	code RoomCode
	// visibility is visibility state of this room.
	visibility RoomVisibility
	// state is state of this room.
	state RoomState
	// candidates is static candidates to start.
	candidates RoomCandidates

	wasDisposed atomic.Bool

	Mu sync.RWMutex
}

func (pd *PlayerData) AssignWaveRoomPlayerId(id *RoomCandidateId) {
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
		at += PutUvarint16(buf[at:], *id)

		pd.WrPId = id
	}

	pd.StaticPlayer.SafeWriteMessage(websocket.BinaryMessage, buf[:at])

	pd.mu.Unlock()

	SharedBufPool.Put(buf)
}

func (pd *PlayerData) AssignWavePlayerId(id *EntityId) {
	if id != nil {
		pd.mu.Lock()
		defer pd.mu.Unlock()

		pd.WPId = id
	}
}

func NewRoom(biome native.Biome, visibility RoomVisibility) *Room {
	wr := &Room{
		updatePacketBroadcastTicker: time.NewTicker(time.Second / waveRoomUpdatePacketSendIntervalMS),

		Pool: nil,

		biome:      biome,
		code:       GenerateRandomRoomCode(),
		visibility: visibility,
		state:      RoomStateWaiting,
		candidates: make([]*RoomCandidate, 0, waveRoomMaxPlayerAmount),
	}

	// WavePool and WaveRoom respectively has circular property,
	// thus initalize WavePool after initialized WaveRoom
	wr.Pool = NewPool(wr, &Data{
		Biome: biome,

		Progress:         70,
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
func (w *Room) RegisterPlayer(sp *StaticPlayer[StaticPetalSlots]) *RoomCandidateId {
	// Check this before lock, isNewPlayerRegisterable calling rlock
	if !w.isNewPlayerRegisterable() {
		return nil
	}

	w.Mu.Lock()

	id := rand.N[RoomCandidateId](65535)

	for _, c := range w.candidates {
		if c != nil && c.Id == id {
			return w.RegisterPlayer(sp)
		}
	}

	w.candidates = append(w.candidates, &RoomCandidate{
		StaticPlayer: sp,
		Id:           id,
		State:        RoomPlayerReadyStateNotReady,
		Owner:        len(w.candidates) == 0, // First player is the owner
	})

	w.CheckAndUpdateState()

	w.Mu.Unlock()

	// Guarantees registered candidate will receive update packet
	w.broadcastUpdatePacket()

	return &id
}

// DeregisterPlayer remove candidate and return if it removed.
func (w *Room) DeregisterPlayer(id RoomCandidateId) (ok bool) {
	w.Mu.Lock()
	defer w.Mu.Unlock()

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

			// Remove the candidate
			w.candidates = slices.Delete(w.candidates, i, i+1)

			// Grant owner to first remaining candidate if owner was removed
			if savedIsOwner && len(w.candidates) > 0 {
				w.candidates[0].Owner = true
			}

			w.CheckAndUpdateState()

			return true
		}
	}

	return false
}

// UpdatePlayerState update state of player.
func (w *Room) UpdatePlayerState(id RoomCandidateId, s RoomPlayerReadyState) (ok bool) {
	w.Mu.Lock()
	defer w.Mu.Unlock()

	if w.state != RoomStateWaiting {
		return false
	}

	for _, c := range w.candidates {
		if c != nil && c.Id == id {
			c.State = s

			w.CheckAndUpdateState()

			return true
		}
	}

	return false
}

// UpdatePlayerName update name of player.
func (w *Room) UpdatePlayerName(id RoomCandidateId, name string) (ok bool) {
	w.Mu.Lock()
	defer w.Mu.Unlock()

	if w.state != RoomStateWaiting {
		return false
	}

	for _, c := range w.candidates {
		if c != nil && c.Id == id {
			c.Name = name

			w.CheckAndUpdateState()

			return true
		}
	}

	return false
}

// UpdateVisibility update visibility of this wave room.
func (w *Room) UpdateVisibility(caller RoomCandidateId, v RoomVisibility) (ok bool) {
	w.Mu.Lock()
	defer w.Mu.Unlock()

	if w.state != RoomStateWaiting {
		return false
	}

	for _, c := range w.candidates {
		if c != nil && c.Id == caller && c.Owner {
			w.visibility = v

			w.CheckAndUpdateState()

			return true
		}
	}

	return false
}

func (w *Room) IsAllCandidateReady() bool {
	candidatesReady := true

	for _, c := range w.candidates {
		if c != nil && c.State != RoomPlayerReadyStateReady {
			candidatesReady = false

			break
		}
	}

	return candidatesReady
}

func (w *Room) CheckAndUpdateState() {
	if w.wasDisposed.Load() {
		return
	}

	if w.state == RoomStateWaiting && len(w.candidates) != 0 && w.IsAllCandidateReady() {
		w.Start()
	}

	if w.state == RoomStatePlaying && w.Pool.IsAllPlayersDead() {
		w.End()
	}
}

// Start starts a wave.
func (w *Room) Start() {
	w.state = RoomStatePlaying

	w.updatePacketBroadcastTicker.Stop()

	w.Pool.Start(w.candidates)
}

// End ends a wave.
func (w *Room) End() {
	w.state = RoomStateEnded

	if w.Pool != nil {
		w.Pool.End()
	}
}

func (w *Room) Dispose() {
	w.Mu.Lock()
	defer w.Mu.Unlock()

	w.wasDisposed.Store(true)

	w.Pool.Dispose()
	w.Pool = nil

	w.updatePacketBroadcastTicker.Stop()

	w.candidates = nil
}

// startBroadcastUpdatePacket starts broadcasting an update packets.
func (w *Room) startBroadcastUpdatePacket() {
	for range w.updatePacketBroadcastTicker.C {
		w.broadcastUpdatePacket()
	}
}

func (w *Room) broadcastUpdatePacket() {
	w.Mu.RLock()
	defer w.Mu.RUnlock()

	updatePacket := w.createUpdatePacket()

	for _, c := range w.candidates {
		c.SafeWriteMessage(websocket.BinaryMessage, updatePacket)
	}
}

// createUpdatePacket returns update packet to broadcast. Must rlock before call.
func (w *Room) createUpdatePacket() []byte {
	buf := SharedBufPool.Get()
	defer SharedBufPool.Put(buf)

	at := 0

	buf[at] = network.ClientboundWaveRoomUpdate
	at++

	buf[at] = byte(len(w.candidates))
	at++

	for _, c := range w.candidates {
		at += PutUvarint16(buf[at:], c.Id)

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

func (w *Room) isNewPlayerRegisterable() bool {
	w.Mu.RLock()
	defer w.Mu.RUnlock()

	return len(w.candidates) < waveRoomMaxPlayerAmount &&
		w.state == RoomStateWaiting
}
