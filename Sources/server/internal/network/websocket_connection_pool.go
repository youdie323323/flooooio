package network

import (
	"github.com/gorilla/websocket"
	"github.com/puzpuzpuz/xsync/v3"
)

// ConnectionPool manages the mapping between connections and user data.
type ConnectionPool[T any] struct {
	users *xsync.MapOf[*websocket.Conn, T]
}

func NewConnectionPool[T any]() *ConnectionPool[T] {
	return &ConnectionPool[T]{xsync.NewMapOf[*websocket.Conn, T]()}
}

func (cm *ConnectionPool[T]) AddUser(conn *websocket.Conn, data T) {
	cm.users.Store(conn, data)
}

func (cm *ConnectionPool[T]) RemoveUser(conn *websocket.Conn) {
	cm.users.Delete(conn)
}

func (cm *ConnectionPool[T]) GetUser(conn *websocket.Conn) (T, bool) {
	return cm.users.Load(conn)
}
