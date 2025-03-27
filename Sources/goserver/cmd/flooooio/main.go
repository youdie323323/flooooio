package main

import (
	"fmt"
	"log"
	"log/slog"
	"net/http"
	"slices"

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

var wrService = wave.NewWaveRoomService()

func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		slog.Error("Websocket upgrade failed", "reason", err)

		return
	}

	defer func() {
		wave.ConnManager.RemoveUser(conn)
		conn.Close()
	}()

	// Init user data
	pd := &wave.PlayerData{
		WrPId: nil,
		WPId:  nil,

		Sp: wave.StaticPlayer{
			Name: "mesamura",
			StaticPlayerPetalSlots: wave.StaticPlayerPetalSlots{
				Surface: []wave.Slot{},
				Bottom:  []wave.Slot{},
			},
			Conn: conn,
		},
	}

	wave.ConnManager.AddUser(conn, pd)

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

func readString(buf []byte, at int) (string, int) {
	end := at
	for end < len(buf) && buf[end] != 0 {
		end++
	}

	return string(buf[at:end]), end + 1
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

			wr := wrService.FindPlayerRoom(*pd.WrPId)
			if wr == nil {
				return
			}

			player := wr.WavePool.SafeFindPlayer(*pd.WPId)
			if player == nil || player.IsDead {
				return
			}

			angle := message[at]
			at++

			magnitude := message[at]
			at++

			player.UpdateMovement(angle, magnitude)
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

			id := wrService.NewPublicWaveRoom(pd, biome)

			pd.AssignWaveRoomPlayerId(id)
		}

	case network.ServerboundWaveRoomJoin:
		{
			if msgLen < 2 {
				return
			}

			var maybeCode string
			maybeCode, at = readString(message, at)
			if !wave.IsWaveRoomCode(maybeCode) {
				return
			}

			code := wave.WaveRoomCode(maybeCode)

			id := wrService.JoinWaveRoom(pd, code)

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

			id := wrService.JoinPublicWaveRoom(pd, biome)
			if id == nil {
				// If public wave room not found, make new public wave room
				id = wrService.NewPublicWaveRoom(pd, biome)
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

			wr := wrService.FindPlayerRoom(*pd.WrPId)
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

			wr := wrService.FindPlayerRoom(*pd.WrPId)
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
			name, at = readString(message, at)

			wr := wrService.FindPlayerRoom(*pd.WrPId)
			if wr == nil {
				return
			}

			wr.UpdatePlayerName(*pd.WrPId, name)
		}

	case network.ServerboundWaveRoomLeave:
		{
			ok := wrService.LeaveCurrentWaveRoom(pd)
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

	// Host all files under ../../build/statics
	http.Handle("/", http.FileServer(http.Dir("../../build/statics")))

	// WebSocket endpoint
	http.HandleFunc("/ws", handleWebSocket)

	const PORT = 8080

	slog.Info("Server running", "port", PORT)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", PORT), nil))
}
