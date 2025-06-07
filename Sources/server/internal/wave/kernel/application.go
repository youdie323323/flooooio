package kernel

import (
	"bytes"
	"encoding/binary"
	"slices"
	"unsafe"

	"flooooio/internal/wave"
	"flooooio/internal/wave/florr/native"
	"flooooio/internal/wave/kernel/network"
)

func readCString(buf []byte, at int) (string, int) {
	end := at + bytes.IndexByte(buf[at:], 0)
	if end < at {
		end = len(buf)
	}

	return unsafe.String(&buf[at], end-at), end + 1
}

func HandleMessage(pd *wave.PlayerData, message []byte) {
	msgLen := len(message)

	if msgLen < 1 {
		return
	}

	at := 0

	opcode := message[at]
	at++

	switch opcode {
	case network.ServerboundWaveChangeMove:
		{
			if msgLen != 3 {
				return
			}

			if pd.WrPId == nil || pd.WPId == nil {
				return
			}

			wr := wave.WrService.FindPlayerRoom(*pd.WrPId)
			if wr == nil {
				return
			}

			player := wr.WavePool.SafeFindPlayer(*pd.WPId)
			if player == nil {
				return
			}

			angle := message[at]
			at++

			magnitude := message[at]
			at++

			player.UpdateMovement(angle, magnitude)
		}

	case network.ServerboundWaveChangeMood:
		{
			if msgLen != 2 {
				return
			}

			if pd.WrPId == nil || pd.WPId == nil {
				return
			}

			flag := native.Mood(message[at])
			at++

			if !slices.Contains(native.ValidMoodFlags, flag) {
				return
			}

			wr := wave.WrService.FindPlayerRoom(*pd.WrPId)
			if wr == nil {
				return
			}

			player := wr.WavePool.SafeFindPlayer(*pd.WPId)
			if player == nil {
				return
			}

			player.ChangeMood(flag)
		}

	case network.ServerboundWaveSwapPetal:
		{
			if msgLen != 2 {
				return
			}

			if pd.WrPId == nil || pd.WPId == nil {
				return
			}

			swapAt := message[at]
			at++

			wr := wave.WrService.FindPlayerRoom(*pd.WrPId)
			if wr == nil {
				return
			}

			if wr.WavePool == nil {
				return
			}

			player := wr.WavePool.SafeFindPlayer(*pd.WPId)
			if player == nil {
				return
			}

			player.SwapPetal(
				wr.WavePool,

				int(swapAt),
			)
		}

	case network.ServerboundWaveChat:
		{
			if msgLen < 2 {
				return
			}

			if pd.WrPId == nil || pd.WPId == nil {
				return
			}

			wr := wave.WrService.FindPlayerRoom(*pd.WrPId)
			if wr == nil {
				return
			}

			if wr.WavePool == nil {
				return
			}

			var chatMsg string
			chatMsg, at = readCString(message, at)

			wr.WavePool.HandleChatMessage(*pd.WPId, chatMsg)
		}

	case network.ServerboundWaveLeave:
		{
			wave.RemovePlayerFromService(pd)
		}

	case network.ServerboundWaveRoomCreate:
		{
			if msgLen != 2 {
				return
			}

			biome := message[at]
			at++

			if !slices.Contains(native.BiomeValues, biome) {
				return
			}

			id := wave.WrService.NewPublicWaveRoom(pd, biome)

			pd.AssignWaveRoomPlayerId(id)
		}

	case network.ServerboundWaveRoomJoin:
		{
			if msgLen < 2 {
				return
			}

			var maybeCode string
			maybeCode, at = readCString(message, at)
			if !wave.IsWaveRoomCode(maybeCode) {
				return
			}

			code := wave.WaveRoomCode(maybeCode)

			id := wave.WrService.JoinWaveRoom(pd, code)

			pd.AssignWaveRoomPlayerId(id)
		}

	case network.ServerboundWaveRoomFindPublic:
		{
			if msgLen != 2 {
				return
			}

			biome := message[at]
			at++

			if !slices.Contains(native.BiomeValues, biome) {
				return
			}

			id := wave.WrService.JoinPublicWaveRoom(pd, biome)
			if id == nil {
				// If public wave room not found, make new public wave room
				id = wave.WrService.NewPublicWaveRoom(pd, biome)
			}

			pd.AssignWaveRoomPlayerId(id)
		}

	case network.ServerboundWaveRoomChangeReady:
		{
			if msgLen != 2 {
				return
			}

			if pd.WrPId == nil {
				return
			}

			state := message[at]
			at++

			if !slices.Contains(wave.PlayerStateValues, state) {
				return
			}

			wr := wave.WrService.FindPlayerRoom(*pd.WrPId)
			if wr == nil {
				return
			}

			wr.UpdatePlayerState(*pd.WrPId, wave.PlayerState(state))
		}

	case network.ServerboundWaveRoomChangeVisible:
		{
			if msgLen != 2 {
				return
			}

			if pd.WrPId == nil {
				return
			}

			state := message[at]
			at++

			if !slices.Contains(wave.WaveRoomVisibilityValues, state) {
				return
			}

			wr := wave.WrService.FindPlayerRoom(*pd.WrPId)
			if wr == nil {
				return
			}

			wr.UpdateRoomVisibility(*pd.WrPId, wave.WaveRoomVisibility(state))
		}

	case network.ServerboundWaveRoomChangeName:
		{
			if msgLen < 2 {
				return
			}

			if pd.WrPId == nil {
				return
			}

			var name string
			name, at = readCString(message, at)

			wr := wave.WrService.FindPlayerRoom(*pd.WrPId)
			if wr == nil {
				return
			}

			wr.UpdatePlayerName(*pd.WrPId, name)
		}

	case network.ServerboundWaveRoomLeave:
		{
			ok := wave.WrService.LeaveCurrentWaveRoom(pd)
			if !ok {
				return
			}

			pd.WrPId = nil
		}

	case network.ServerboundAck:
		if msgLen < 5 || pd.WPId == nil {
			return
		}

		tick := binary.LittleEndian.Uint32(message[at:])
		at += 4

		wr := wave.WrService.FindPlayerRoom(*pd.WrPId)
		if wr == nil {
			return
		}
		
		player := wr.WavePool.SafeFindPlayer(*pd.WPId)
		if player != nil {
			player.LastAckTick = tick
		}
	}
}
