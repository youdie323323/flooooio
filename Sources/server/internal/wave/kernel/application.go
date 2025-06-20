package kernel

import (
	"bytes"
	"cmp"
	"encoding/binary"
	"slices"
	"unsafe"

	"flooooio/internal/wave"
	"flooooio/internal/wave/florr/native"
	"flooooio/internal/wave/kernel/network"
)

// Clamp returns f clamped to [low, high].
func Clamp[T cmp.Ordered](f, low, high T) T {
	return min(max(f, low), high)
}

const (
	maxWindowWidth  uint16 = 4000
	maxWindowHeight uint16 = 3000
	minWindowWidth  uint16 = 100
	minWindowHeight uint16 = 100
)

// clampWindowSize clamp window size.
func clampWindowSize(width, height uint16) (uint16, uint16) {
	width = Clamp(width, minWindowWidth, maxWindowWidth)
	height = Clamp(height, minWindowHeight, maxWindowHeight)

	return width, height
}

func readCString(buf []byte, at int) (string, int) {
	end := at + bytes.IndexByte(buf[at:], 0)
	if end < at {
		end = len(buf)
	}

	return unsafe.String(&buf[at], end-at), end + 1
}

func HandleMessage(pd *wave.PlayerData, buf []byte) {
	bufLen := len(buf)
	if bufLen < 1 {
		return
	}

	at := 0

	opcode := buf[at]
	at++

	switch opcode {
	case network.ServerboundWaveChangeMove:
		{
			if bufLen != 3 {
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

			player := wr.WavePool.SafeFindPlayer(*pd.WPId)
			if player == nil {
				return
			}

			angle := buf[at]
			at++

			magnitude := buf[at]
			at++

			player.UpdateMovement(angle, magnitude)
		}

	case network.ServerboundWaveChangeMood:
		{
			if bufLen != 2 {
				return
			}

			if pd.WrPId == nil || pd.WPId == nil {
				return
			}

			flag := native.Mood(buf[at])
			at++

			if !slices.Contains(native.ValidMoodFlags, flag) {
				return
			}

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

			player.ChangeMood(flag)
		}

	case network.ServerboundWaveSwapPetal:
		{
			if bufLen != 2 {
				return
			}

			if pd.WrPId == nil || pd.WPId == nil {
				return
			}

			swapAt := buf[at]
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
			if bufLen < 2 {
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
			chatMsg, at = readCString(buf, at)

			wr.WavePool.HandleChatMessage(*pd.WPId, chatMsg)
		}

	case network.ServerboundWaveLeave:
		{
			wave.RemovePlayerFromService(pd)
		}

	case network.ServerboundWaveRoomCreate:
		{
			if bufLen != 2 {
				return
			}

			biome := buf[at]
			at++

			if !slices.Contains(native.BiomeValues, biome) {
				return
			}

			id := wave.WrService.NewPublicWaveRoom(pd, biome)

			pd.AssignWaveRoomPlayerId(id)
		}

	case network.ServerboundWaveRoomJoin:
		{
			if bufLen < 2 {
				return
			}

			var maybeCode string

			maybeCode, at = readCString(buf, at)
			if !wave.IsWaveRoomCode(maybeCode) {
				return
			}

			code := wave.WaveRoomCode(maybeCode)

			id := wave.WrService.JoinWaveRoom(pd, code)

			pd.AssignWaveRoomPlayerId(id)
		}

	case network.ServerboundWaveRoomFindPublic:
		{
			if bufLen != 2 {
				return
			}

			biome := buf[at]
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
			if bufLen != 2 {
				return
			}

			if pd.WrPId == nil {
				return
			}

			state := buf[at]
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
			if bufLen != 2 {
				return
			}

			if pd.WrPId == nil {
				return
			}

			state := buf[at]
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
			if bufLen < 2 {
				return
			}

			if pd.WrPId == nil {
				return
			}

			var name string
			name, at = readCString(buf, at)

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
		{
			if bufLen != 1+2+2 {
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

			player := wr.WavePool.SafeFindPlayer(*pd.WPId)
			if player == nil {
				return
			}

			width := binary.LittleEndian.Uint16(buf[at:])
			at += 2

			height := binary.LittleEndian.Uint16(buf[at:])
			at += 2

			width, height = clampWindowSize(width, height)

			// Lock before write window
			player.Mu.Lock()

			player.Window[0] = width
			player.Window[1] = height

			player.Mu.Unlock()
		}
	}
}
