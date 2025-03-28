package collision

import (
	"math"
	"sync"

	"github.com/puzpuzpuz/xsync/v3"
)

// Node represents an object with x,y coordinates.
type Node interface {
	GetX() float64
	GetY() float64
}

// SpatialHash provides a thread-safe 2D spatial hashing implementation.
type SpatialHash[T Node] struct {
	cellSize float64
	buckets  *xsync.MapOf[int64, *nodeSet[T]]
}

// nodeSet is a thread-safe set implementation for Node objects.
type nodeSet[T Node] struct{ items sync.Map }

// NewNodeSet creates a new thread-safe node set.
func newNodeSet[T Node]() *nodeSet[T] {
	return &nodeSet[T]{}
}

// Add adds a node to the set.
func (s *nodeSet[T]) Add(node T) {
	s.items.Store(node, struct{}{})
}

// Delete removes a node from the set.
func (s *nodeSet[T]) Delete(node T) {
	s.items.Delete(node)
}

// ForEach iterates over all nodes in the set.
func (s *nodeSet[T]) ForEach(f func(T)) {
	s.items.Range(func(key, _ any) bool {
		f(key.(T))

		return true
	})
}

// NewSpatialHash creates a new SpatialHash instance.
func NewSpatialHash[T Node](cellSize float64) *SpatialHash[T] {
	if cellSize <= 0 {
		cellSize = 256
	}

	return &SpatialHash[T]{
		cellSize: cellSize,
		buckets:  xsync.NewMapOf[int64, *nodeSet[T]](),
	}
}

// pairPoint combines x,y coordinates into a single int64 key.
func (sh *SpatialHash[T]) pairPoint(x, y int64) int64 {
	if x >= y {
		return x*x + x + y
	}

	return y*y + x
}

// Put adds a node to the spatial hash.
func (sh *SpatialHash[T]) Put(node T) {
	x := int64(math.Floor(node.GetX() / sh.cellSize))
	y := int64(math.Floor(node.GetY() / sh.cellSize))
	key := sh.pairPoint(x, y)

	// Get or create bucket
	bucket, _ := sh.buckets.LoadOrStore(key, newNodeSet[T]())
	bucket.Add(node)
}

// Remove removes a node from the spatial hash.
func (sh *SpatialHash[T]) Remove(node T) {
	x := int64(math.Floor(node.GetX() / sh.cellSize))
	y := int64(math.Floor(node.GetY() / sh.cellSize))
	key := sh.pairPoint(x, y)

	if bucket, ok := sh.buckets.Load(key); ok {
		bucket.Delete(node)
	}
}

// Update updates a node's position in the spatial hash.
func (sh *SpatialHash[T]) Update(node T) {
	sh.Remove(node)
	sh.Put(node)
}

// Search finds all nodes within the specified radius of the target point.
// TODO: sometime this returns same nodes
func (sh *SpatialHash[T]) Search(x, y, radius float64) []T {
	result := make([]T, 0)
	resultMutex := sync.Mutex{}
	radiusSquared := radius * radius

	minX := int64(math.Floor((x - radius) / sh.cellSize))
	maxX := int64(math.Floor((x + radius) / sh.cellSize))
	minY := int64(math.Floor((y - radius) / sh.cellSize))
	maxY := int64(math.Floor((y + radius) / sh.cellSize))

	var wg sync.WaitGroup

	for yy := minY; yy <= maxY; yy++ {
		for xx := minX; xx <= maxX; xx++ {
			key := sh.pairPoint(xx, yy)

			if bucket, ok := sh.buckets.Load(key); ok {
				wg.Add(1)

				go func(b *nodeSet[T]) {
					defer wg.Done()

					b.ForEach(func(node T) {
						dx := node.GetX() - x
						dy := node.GetY() - y

						if (dx*dx + dy*dy) <= radiusSquared {
							resultMutex.Lock()

							result = append(result, node)

							resultMutex.Unlock()
						}
					})
				}(bucket)
			}
		}
	}

	wg.Wait()

	return result
}

// Reset clears all nodes from the spatial hash.
func (sh *SpatialHash[T]) Reset() {
	sh.buckets.Clear()
}
