package main

import (
	"bytes"
	"fmt"
	"log"
	"log/slog"
	"net/http"
	"slices"
	"unsafe"

	"flooooio/internal/native"
	"flooooio/internal/network"
	"flooooio/internal/wave"

	"github.com/gorilla/websocket"
	"github.com/joho/godotenv"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		slog.Error("Websocket upgrade failed", "reason", err)

		return
	}

	// Init user data
	pd := &wave.PlayerData{
		WrPId: nil,
		WPId:  nil,

		Sp: &wave.StaticPlayer[wave.StaticPetalSlots]{
			Name: "Mankoblablatrix",
			Slots: wave.StaticPetalSlots{
				Surface: []wave.StaticPetalData{
					{
						Type:   native.PetalTypeStinger,
						Rarity: native.RarityUltra,
					},
					{
						Type:   native.PetalTypeClaw,
						Rarity: native.RarityUltra,
					},
					{
						Type:   native.PetalTypeStinger,
						Rarity: native.RarityUltra,
					},
					{
						Type:   native.PetalTypeClaw,
						Rarity: native.RarityUltra,
					},
					{
						Type:   native.PetalTypeStinger,
						Rarity: native.RarityUltra,
					},
					{
						Type:   native.PetalTypeClaw,
						Rarity: native.RarityUltra,
					},
					{
						Type:   native.PetalTypeStinger,
						Rarity: native.RarityUltra,
					},
					{
						Type:   native.PetalTypeClaw,
						Rarity: native.RarityUltra,
					},
					{
						Type:   native.PetalTypeFaster,
						Rarity: native.RarityUltra,
					},
					{
						Type:   native.PetalTypeClaw,
						Rarity: native.RarityUltra,
					},
					{
						Type:   native.PetalTypeWing,
						Rarity: native.RarityUltra,
					},
					{
						Type:   native.PetalTypeWing,
						Rarity: native.RarityUltra,
					},
					{
						Type:   native.PetalTypeWing,
						Rarity: native.RarityUltra,
					},
				},
				Bottom: []wave.StaticPetalData{
					{
						Type:   native.PetalTypeWeb,
						Rarity: native.RarityUltra,
					},
					{
						Type:   native.PetalTypeMysteriousStick,
						Rarity: native.RarityUltra,
					},
					{
						Type:   native.PetalTypeMysteriousStick,
						Rarity: native.RarityUltra,
					},
					{
						Type:   native.PetalTypeMysteriousStick,
						Rarity: native.RarityUltra,
					},
					{
						Type:   native.PetalTypeMysteriousStick,
						Rarity: native.RarityUltra,
					},
					{
						Type:   native.PetalTypeMysteriousStick,
						Rarity: native.RarityUltra,
					},
					{
						Type:   native.PetalTypeMysteriousStick,
						Rarity: native.RarityUltra,
					},
					{
						Type:   native.PetalTypeMysteriousStick,
						Rarity: native.RarityUltra,
					},
					{
						Type:   native.PetalTypeMysteriousStick,
						Rarity: native.RarityUltra,
					},
					{
						Type:   native.PetalTypeMysteriousStick,
						Rarity: native.RarityUltra,
					},
				},
			},
			Conn: conn,
		},
	}

	wave.ConnPool.AddUser(conn, pd)

	// On close
	defer func() {
		wave.ConnPool.RemoveUser(conn)
		_ = conn.Close()

		wave.RemovePlayerFromService(pd)
	}()

	for {
		messageType, message, err := conn.ReadMessage()
		if err != nil {
			// Most of error of cannot read message because ws is closed
			// slog.Error("Message read failed", "reason", err)

			break
		}

		if messageType != websocket.BinaryMessage {
			continue
		}

		handleMessage(pd, message)
	}
}

func readCString(buf []byte, at int) (string, int) {
	end := at + bytes.IndexByte(buf[at:], 0)
	if end < at {
		end = len(buf)
	}

	return unsafe.String(&buf[at], end-at), end + 1
}

func handleMessage(pd *wave.PlayerData, message []byte) {
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
	}
}

func main() {
	err := godotenv.Load("../../.env")
	if err != nil {
		slog.Error("Error loading .env file", "reason", err)

		return
	}

	// Host all files under ./static
	http.Handle("/", http.FileServer(http.Dir("./static")))

	// WebSocket endpoint
	http.HandleFunc("/ws", handleWebSocket)

	const PORT = 8080

	slog.Info("Server running", "port", PORT)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", PORT), nil))
}
