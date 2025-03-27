package network

import (
	"github.com/gorilla/websocket"
	"github.com/puzpuzpuz/xsync/v3"
)

// ConnectionManager manages the mapping between connections and user data
type ConnectionManager[T any] struct {
	users *xsync.MapOf[*websocket.Conn, T]
}

func NewConnectionManager[T any]() *ConnectionManager[T] {
	return &ConnectionManager[T]{
		users: xsync.NewMapOf[*websocket.Conn, T](),
	}
}

func (cm *ConnectionManager[T]) AddUser(conn *websocket.Conn, data T) {
	cm.users.Store(conn, data)
}

func (cm *ConnectionManager[T]) RemoveUser(conn *websocket.Conn) {
	cm.users.Delete(conn)
}

func (cm *ConnectionManager[T]) GetUser(conn *websocket.Conn) (T, bool) {
	userData, ok := cm.users.Load(conn)

	return userData, ok
}