package game

import (
	"slices"
	"sync"

	"flooooio/internal/native"
)

type WaveRoomService struct {
	waveRooms []*WaveRoom

	mu sync.RWMutex
}

var WrService = NewWaveRoomService()

func NewWaveRoomService() *WaveRoomService {
	return &WaveRoomService{
		waveRooms: make([]*WaveRoom, 0),
	}
}

// JoinPublicWaveRoom adds a player to an existing public wave room or creates a new one if none exists.
func (s *WaveRoomService) JoinPublicWaveRoom(pd *PlayerData, biome native.Biome) *WaveRoomPlayerId {
	// Place this before lock so doesnt double call lock
	s.LeaveCurrentWaveRoom(pd)

	s.mu.Lock()
	defer s.mu.Unlock()

	if !s.canPlayerJoin(pd) {
		return nil
	}

	// Try to find existing public room
	if room := s.findPublicRoom(biome); room != nil {
		return room.RegisterPlayer(pd.Sp)
	}

	// Return nil if not found
	return nil
}

// JoinWaveRoom adds a player to a private wave room using a room code.
func (s *WaveRoomService) JoinWaveRoom(pd *PlayerData, code WaveRoomCode) *WaveRoomPlayerId {
	// Place this before lock so doesnt double call lock
	s.LeaveCurrentWaveRoom(pd)

	s.mu.Lock()
	defer s.mu.Unlock()

	if !s.canPlayerJoin(pd) {
		return nil
	}

	room := s.findPrivateRoom(code)
	if room == nil {
		return nil
	}

	return room.RegisterPlayer(pd.Sp)
}

// removeWaveRoom removes a specific wave room from the manager.
func (s *WaveRoomService) removeWaveRoom(room *WaveRoom) {
	for i, r := range s.waveRooms {
		if r == room {
			room.Dispose()

			s.waveRooms = slices.Delete(s.waveRooms, i, i+1)

			return
		}
	}
}

// leaveWaveRoom removes a player from their wave room, deletes empty rooms.
func (s *WaveRoomService) leaveWaveRoom(id WaveRoomPlayerId) (ok bool) {
	for _, room := range s.waveRooms {
		if ok := room.DeregisterPlayer(id); ok {
			if len(room.candidates) == 0 {
				// Remove empty room
				s.removeWaveRoom(room)
			}

			return true
		}
	}

	return false
}

// LeaveCurrentWaveRoom removes player from wave room if player was in other wave room.
func (s *WaveRoomService) LeaveCurrentWaveRoom(pd *PlayerData) (ok bool) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if pd.WrPId != nil {
		return s.leaveWaveRoom(*pd.WrPId)
	}

	return false
}

// NewPublicWaveRoom creates a new public wave room with initial player.
func (s *WaveRoomService) NewPublicWaveRoom(pd *PlayerData, biome native.Biome) *WaveRoomPlayerId {
	// Place this before lock so doesnt double call lock
	s.LeaveCurrentWaveRoom(pd)

	s.mu.Lock()
	defer s.mu.Unlock()

	if !s.canPlayerJoin(pd) {
		return nil
	}

	room := NewWaveRoom(biome, RoomVisibilityPublic)

	s.waveRooms = append(s.waveRooms, room)

	return room.RegisterPlayer(pd.Sp)
}

// FindPublicRoom finds a public room with available slots for the specified biome.
func (s *WaveRoomService) findPublicRoom(biome native.Biome) *WaveRoom {
	// First try to find room with matching biome
	for _, room := range s.waveRooms {
		if room.visibility == RoomVisibilityPublic &&
			room.biome == biome &&
			room.isNewPlayerRegisterable() {
			return room
		}
	}

	// If no matching biome found, return any public room
	for _, room := range s.waveRooms {
		if room.visibility == RoomVisibilityPublic &&
			room.isNewPlayerRegisterable() {
			return room
		}
	}

	return nil
}

// FindPrivateRoom finds a private room with available slots by room code.
func (s *WaveRoomService) findPrivateRoom(code WaveRoomCode) *WaveRoom {
	for _, room := range s.waveRooms {
		if room.code == code && room.isNewPlayerRegisterable() {
			return room
		}
	}

	return nil
}

// FindPlayerRoom finds the wave room that contains a specific player.
func (s *WaveRoomService) FindPlayerRoom(id WaveRoomPlayerId) *WaveRoom {
	s.mu.RLock()
	defer s.mu.RUnlock()

	for _, room := range s.waveRooms {
		for _, candidate := range room.candidates {
			if candidate != nil && candidate.Id == id {
				return room
			}
		}
	}

	return nil
}

// canPlayerJoin determines if a player is allowed to join/add.
func (s *WaveRoomService) canPlayerJoin(pd *PlayerData) bool {
	// Check if player is already in a room
	for _, room := range s.waveRooms {
		for _, candidate := range room.candidates {
			if candidate != nil && candidate.Conn == pd.Sp.Conn {
				return false
			}
		}
	}

	return true
}

func RemovePlayerFromService(pd *PlayerData) {
	if pd.WrPId != nil && pd.WPId != nil {
		wr := WrService.FindPlayerRoom(*pd.WrPId)

		if wr != nil {
			wp := wr.WavePool

			if wp != nil {
				player := wp.FindPlayer(*pd.WPId)

				if player != nil {
					DisposeBindings(wp, player)

					wp.RemovePlayer(*pd.WPId)

					pd.WPId = nil
				}
			}
		}
	}

	{ // This block should executed after because needs to use FindPlayerRoom
		// Dont care about result
		_ = WrService.LeaveCurrentWaveRoom(pd)

		pd.WrPId = nil
	}
}
