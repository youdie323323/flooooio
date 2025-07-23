package wave

import (
	"fmt"
	"slices"
	"sync"

	"flooooio/internal/wave/florr/native"
)

type RoomService struct {
	rooms []*Room

	mu sync.RWMutex
}

func NewRoomService() *RoomService {
	return &RoomService{
		rooms: make([]*Room, 0),
	}
}

// JoinPublicWaveRoom adds a player to an existing public wave room or creates a new one if none exists.
func (s *RoomService) JoinPublicWaveRoom(pd *PlayerData, biome native.Biome) *RoomCandidateId {
	// Place this before locking to avoid deadlock
	s.LeaveCurrentWaveRoom(pd)

	s.mu.Lock()
	defer s.mu.Unlock()

	if !s.isPlayerJoinable(pd) {
		return nil
	}

	// Try to find existing public room
	if room := s.findPublicRoom(biome); room != nil {
		return room.RegisterPlayer(pd.StaticPlayer)
	}

	// Return nil if not found
	return nil
}

// JoinWaveRoom adds a player to a private wave room using a room code.
func (s *RoomService) JoinWaveRoom(pd *PlayerData, code RoomCode) *RoomCandidateId {
	// Place this before lock to avoid deadlock
	s.LeaveCurrentWaveRoom(pd)

	s.mu.Lock()
	defer s.mu.Unlock()

	if !s.isPlayerJoinable(pd) {
		return nil
	}

	room := s.findPrivateRoom(code)
	if room == nil {
		return nil
	}

	return room.RegisterPlayer(pd.StaticPlayer)
}

// removeWaveRoom removes a specific wave room from the manager.
func (s *RoomService) removeWaveRoom(room *Room) {
	for i, r := range s.rooms {
		if r == room {
			room.Dispose()

			s.rooms = slices.Delete(s.rooms, i, i+1)

			return
		}
	}
}

// leaveWaveRoom removes a player from their wave room, deletes empty rooms.
func (s *RoomService) leaveWaveRoom(id RoomCandidateId) (ok bool) {
	for _, room := range s.rooms {
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
func (s *RoomService) LeaveCurrentWaveRoom(pd *PlayerData) (ok bool) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if pd.WrPId != nil {
		return s.leaveWaveRoom(*pd.WrPId)
	}

	return false
}

// NewPublicWaveRoom creates a new public wave room with initial player.
func (s *RoomService) NewPublicWaveRoom(pd *PlayerData, biome native.Biome) *RoomCandidateId {
	// Place this before locking to avoid deadlock
	s.LeaveCurrentWaveRoom(pd)

	s.mu.Lock()
	defer s.mu.Unlock()

	if !s.isPlayerJoinable(pd) {
		return nil
	}

	room := NewRoom(biome, RoomVisibilityPublic)

	s.rooms = append(s.rooms, room)

	return room.RegisterPlayer(pd.StaticPlayer)
}

// FindPublicRoom finds a public room with available slots for the specified biome.
func (s *RoomService) findPublicRoom(biome native.Biome) *Room {
	// First try to find room with matching biome
	for _, room := range s.rooms {
		if room.visibility == RoomVisibilityPublic &&
			room.biome == biome &&
			room.isNewPlayerRegisterable() {
			return room
		}
	}

	// If no matching biome found, return any public room
	for _, room := range s.rooms {
		if room.visibility == RoomVisibilityPublic &&
			room.isNewPlayerRegisterable() {
			return room
		}
	}

	return nil
}

// FindPrivateRoom finds a private room with available slots by room code.
func (s *RoomService) findPrivateRoom(code RoomCode) *Room {
	for _, room := range s.rooms {
		if room.code == code && room.isNewPlayerRegisterable() {
			return room
		}
	}

	return nil
}

// FindPlayerRoom finds the wave room that contains a specific player.
func (s *RoomService) FindPlayerRoom(id RoomCandidateId) *Room {
	s.mu.RLock()
	defer s.mu.RUnlock()

	for _, room := range s.rooms {
		for _, candidate := range room.candidates {
			if candidate != nil && candidate.Id == id {
				return room
			}
		}
	}

	return nil
}

// isPlayerJoinable determines if a player is allowed to join/add.
func (s *RoomService) isPlayerJoinable(pd *PlayerData) bool {
	// Check if player is already in a room
	for _, room := range s.rooms {
		for _, candidate := range room.candidates {
			if candidate != nil && candidate.Conn == pd.StaticPlayer.Conn {
				return false
			}
		}
	}

	return true
}

// RemovePlayer remove player from service using player data.
func (s *RoomService) RemovePlayer(pd *PlayerData) {
	if pd.WrPId != nil && pd.WPId != nil {
		wr := s.FindPlayerRoom(*pd.WrPId)
		if wr != nil {
			wp := wr.Pool
			if wp != nil {
				// commandQueue is thread-safe. No need to do this
				// wp.Mu.Lock()
				// defer wp.Mu.Unlock()

				select { // Inqueue player remove fn
				case wp.commandQueue <- func() bool {
					p := wp.FindPlayer(*pd.WPId)
					if p != nil {
						ResetPlayerBindings(wp, p)

						wp.RemovePlayer(*pd.WPId)
					}

					pd.WPId = nil

					return false
				}:

				default:
					fmt.Println("Command queue is full or unavailable")
				}
			}
		}
	}

	{ // This block should executed after room properties deinialization
		// Dont care about result
		_ = s.LeaveCurrentWaveRoom(pd)

		pd.WrPId = nil
	}
}
