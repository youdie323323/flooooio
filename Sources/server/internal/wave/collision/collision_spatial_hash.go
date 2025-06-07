package collision

import (
	"sync"

	"github.com/chewxy/math32"
	"github.com/colega/zeropool"

	"github.com/puzpuzpuz/xsync/v4"
)

// Node represents an interface entity.
type Node interface {
	GetX() float32
	GetY() float32
	GetID() uint32
	GetMagnitude() float32
	GetAngle() float32
}

func ToNodeSlice[T Node](entities []T) []Node {
	nodes := make([]Node, len(entities))

	for i, e := range entities {
		nodes[i] = e
	}

	return nodes
}

// SpatialHash provides a thread-safe 2D spatial hashing implementation.
type SpatialHash struct {
	cellSize float32
	buckets  *xsync.Map[int, *nodeSet]
}

// NewSpatialHash creates a new spatial hash.
func NewSpatialHash(cellSize float32) *SpatialHash {
	if cellSize <= 0 {
		cellSize = 1024
	}

	return &SpatialHash{
		cellSize: cellSize,
		buckets:  xsync.NewMap[int, *nodeSet](),
	}
}

// nodeSet is a thread-safe set implementation for Node objects.
type nodeSet struct{ items sync.Map }

// newNodeSet creates a new node set.
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

// pairPoint combines x,y coordinates into a single int key.
func pairPoint(x, y int) int {
	return (x << 16) ^ y
}

func (sh *SpatialHash) calculateNodeKey(n Node) int {
	return pairPoint(
		int(math32.Floor(n.GetX()/sh.cellSize)),
		int(math32.Floor(n.GetY()/sh.cellSize)),
	)
}

// Put adds a node to the spatial hash.
func (sh *SpatialHash) Put(n Node) {
	key := sh.calculateNodeKey(n)

	// Get or create bucket
	bucket, _ := sh.buckets.LoadOrStore(key, newNodeSet())
	bucket.Add(n)
}

// Remove removes a node from the spatial hash.
func (sh *SpatialHash) Remove(n Node) {
	key := sh.calculateNodeKey(n)

	if bucket, ok := sh.buckets.Load(key); ok {
		bucket.Delete(n)
	}
}

// Update updates a node's position in the spatial hash.
func (sh *SpatialHash) Update(n Node) {
	key := sh.calculateNodeKey(n)

	if bucket, ok := sh.buckets.Load(key); ok {
		bucket.Delete(n)
	}
	
    // Get or create bucket for the same key
    bucket, _ := sh.buckets.LoadOrStore(key, newNodeSet())
    bucket.Add(n)
}

// searchResultPool is shared collision searchResultPool between Search.
var searchResultPool = zeropool.New(func() []Node { return make([]Node, 64) })

// Search finds all nodes within the specified radius using optimized concurrency
func (sh *SpatialHash) Search(x, y, radius float32) []Node {
	radiusSq := radius * radius

	minX := int(math32.Floor((x - radius) / sh.cellSize))
	maxX := int(math32.Floor((x + radius) / sh.cellSize))
	minY := int(math32.Floor((y - radius) / sh.cellSize))
	maxY := int(math32.Floor((y + radius) / sh.cellSize))

	result := searchResultPool.Get()
	nodes := result[:0]

	for yy := minY; yy <= maxY; yy++ {
		for xx := minX; xx <= maxX; xx++ {
			key := pairPoint(xx, yy)

			if bucket, ok := sh.buckets.Load(key); ok {
				bucket.ForEach(func(n Node) {
					dx := n.GetX() - x
					dy := n.GetY() - y

					if (dx*dx + dy*dy) <= radiusSq {
						nodes = append(nodes, n)
					}
				})
			}
		}
	}

	finalResult := make([]Node, len(nodes))
	copy(finalResult, nodes)

	searchResultPool.Put(result)

	return finalResult
}

// SearchRect finds all nodes within the specified rectangular area centered on a player.
func (sh *SpatialHash) SearchRect(x, y, width, height float32) []Node {
	// Calculate rectangle bounds
	halfWidth := width * 0.5
	halfHeight := height * 0.5
	
	minX := int(math32.Floor((x - halfWidth) / sh.cellSize))
	maxX := int(math32.Floor((x + halfWidth) / sh.cellSize))
	minY := int(math32.Floor((y - halfHeight) / sh.cellSize))
	maxY := int(math32.Floor((y + halfHeight) / sh.cellSize))

	result := searchResultPool.Get()
	nodes := result[:0]

	for yy := minY; yy <= maxY; yy++ {
		for xx := minX; xx <= maxX; xx++ {
			key := pairPoint(xx, yy)

			if bucket, ok := sh.buckets.Load(key); ok {
				bucket.ForEach(func(n Node) {
					// Check if node is within rectangle bounds
					if n.GetX() >= x-halfWidth && 
					   n.GetX() <= x+halfWidth &&
					   n.GetY() >= y-halfHeight && 
					   n.GetY() <= y+halfHeight {
						nodes = append(nodes, n)
					}
				})
			}
		}
	}

	finalResult := make([]Node, len(nodes))
	copy(finalResult, nodes)

	searchResultPool.Put(result)

	return finalResult
}

// Reset clears all nodes from the spatial hash.
func (sh *SpatialHash) Reset() {
	sh.buckets.Clear()
}
