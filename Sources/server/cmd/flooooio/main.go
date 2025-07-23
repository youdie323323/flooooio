package main

import (
	"fmt"
	"log"
	"log/slog"
	"net/http"
	"slices"
	"sync"

	"flooooio/internal/wave"
	"flooooio/internal/wave/florr/native"
	"flooooio/internal/wave/kernel"

	"github.com/gorilla/websocket"
	"github.com/joho/godotenv"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	WriteBufferPool: &sync.Pool{},
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

		StaticPlayer: &wave.StaticPlayer[wave.StaticPetalSlots]{
			Name: "pdfodwahfioahwfwapihugwaiugaifuwafgwailfgalifaguagtwaiufgwa",
			Slots: wave.StaticPetalSlots{
				Surface: slices.Repeat([]wave.StaticPetalData{
					{
						Type:   native.PetalTypeMissile,
						Rarity: native.RarityUltra,
					},
				}, 200),
				Bottom: []wave.StaticPetalData{
					{
						Type:   native.PetalTypeWeb,
						Rarity: native.RarityUltra,
					},
					{
						Type:   native.PetalTypeEggBeetle,
						Rarity: native.RarityUltra,
					},
					{
						Type:   native.PetalTypeEggBeetle,
						Rarity: native.RarityUltra,
					},
					{
						Type:   native.PetalTypeEggBeetle,
						Rarity: native.RarityUltra,
					},
					{
						Type:   native.PetalTypeEggBeetle,
						Rarity: native.RarityUltra,
					},
					{
						Type:   native.PetalTypeEggBeetle,
						Rarity: native.RarityUltra,
					},
					{
						Type:   native.PetalTypeEggBeetle,
						Rarity: native.RarityUltra,
					},
					{
						Type:   native.PetalTypeEggBeetle,
						Rarity: native.RarityUltra,
					},
					{
						Type:   native.PetalTypeEggBeetle,
						Rarity: native.RarityUltra,
					},
					{
						Type:   native.PetalTypeEggBeetle,
						Rarity: native.RarityUltra,
					},
				},
			},
			Conn: conn,
		},
	}

	wave.ConnPool.Store(conn, pd)

	// On closed
	defer func() {
		wave.ConnPool.Delete(conn)
		_ = conn.Close()

		kernel.WrService.RemovePlayer(pd)
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

		kernel.HandleMessage(pd, message)
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
