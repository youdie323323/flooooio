package collision

import (
	"sync"

	"github.com/chewxy/math32"

	"github.com/puzpuzpuz/xsync/v3"
)

// Node represents an interface entity.
type Node interface {
	GetX() float32
	GetY() float32
	GetID() uint32
	GetMagnitude() float32
	GetAngle() float32
}

func ToNodeSlice[T Node](es []T) []Node {
	nodes := make([]Node, len(es))

	for i, e := range es {
		nodes[i] = e
	}

	return nodes
}

// SpatialHash provides a thread-safe 2D spatial hashing implementation.
type SpatialHash struct {
	cellSize float32
	buckets  *xsync.MapOf[int64, *nodeSet]
}

// nodeSet is a thread-safe set implementation for Node objects.
type nodeSet struct{ items sync.Map }

// newNodeSet creates a new thread-safe node set.
func newNodeSet() *nodeSet { return new(nodeSet) }

// Add adds a node to the set.
func (s *nodeSet) Add(n Node) {
	s.items.Store(n.GetID(), n)
}

// Delete removes a node from the set.
func (s *nodeSet) Delete(n Node) {
	s.items.Delete(n.GetID())
}

// ForEach iterates over all nodes in the set.
func (s *nodeSet) ForEach(f func(Node)) {
	s.items.Range(func(_, n any) bool {
		f(n.(Node))

		return true
	})
}

// NewSpatialHash creates a new SpatialHash instance.
func NewSpatialHash(cellSize float32) *SpatialHash {
	if cellSize <= 0 {
		cellSize = 256
	}

	return &SpatialHash{
		cellSize: cellSize,
		buckets:  xsync.NewMapOf[int64, *nodeSet](),
	}
}

// pairPoint combines x,y coordinates into a single int64 key.
func (sh *SpatialHash) pairPoint(x, y int64) int64 {
	if x >= y {
		return x*x + x + y
	}

	return y*y + x
}

// Put adds a node to the spatial hash.
func (sh *SpatialHash) Put(n Node) {
	key := sh.pairPoint(
		int64(math32.Floor(n.GetX()/sh.cellSize)),
		int64(math32.Floor(n.GetY()/sh.cellSize)),
	)

	// Get or create bucket
	bucket, _ := sh.buckets.LoadOrStore(key, newNodeSet())
	bucket.Add(n)
}

// Remove removes a node from the spatial hash.
func (sh *SpatialHash) Remove(n Node) {
	key := sh.pairPoint(
		int64(math32.Floor(n.GetX()/sh.cellSize)),
		int64(math32.Floor(n.GetY()/sh.cellSize)),
	)

	if bucket, ok := sh.buckets.Load(key); ok {
		bucket.Delete(n)
	}
}

// Update updates a node's position in the spatial hash.
func (sh *SpatialHash) Update(n Node) {
	sh.Remove(n)
	sh.Put(n)
}

// Search finds all nodes within the specified radius of the target point.
func (sh *SpatialHash) Search(x, y, radius float32) *xsync.MapOf[uint32, Node] {
	result := xsync.NewMapOf[uint32, Node]()

	radiusSq := radius * radius

	minX := int64(math32.Floor((x - radius) / sh.cellSize))
	maxX := int64(math32.Floor((x + radius) / sh.cellSize))
	minY := int64(math32.Floor((y - radius) / sh.cellSize))
	maxY := int64(math32.Floor((y + radius) / sh.cellSize))

	var wg sync.WaitGroup

	for yy := minY; yy <= maxY; yy++ {
		for xx := minX; xx <= maxX; xx++ {
			key := sh.pairPoint(xx, yy)

			if bucket, ok := sh.buckets.Load(key); ok {
				wg.Add(1)

				go func(ns *nodeSet) {
					ns.ForEach(func(n Node) {
						dx := n.GetX() - x
						dy := n.GetY() - y

						if (dx*dx + dy*dy) <= radiusSq {
							result.Store(n.GetID(), n)
						}
					})

					wg.Done()
				}(bucket)
			}
		}
	}

	wg.Wait()

	return result
}

// Reset clears all nodes from the spatial hash.
func (sh *SpatialHash) Reset() {
	sh.buckets.Clear()
}
