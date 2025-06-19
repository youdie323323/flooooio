package collision

import (
	"github.com/chewxy/math32"
	"github.com/colega/zeropool"

	"github.com/puzpuzpuz/xsync/v4"
)

// Node represents an interface entity.
type Node interface {
	GetId() uint32

	GetX() float32
	GetY() float32

	SetOldPos(x, y float32)
	GetOldPos() (float32, float32)
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
	buckets  *xsync.Map[int, *bucket]
}

// NewSpatialHash creates a new spatial hash.
func NewSpatialHash(cellSize float32) *SpatialHash {
	if cellSize <= 0 {
		cellSize = 1024
	}

	return &SpatialHash{
		cellSize: cellSize,
		buckets:  xsync.NewMap[int, *bucket](),
	}
}

// bucket is a thread-safe set implementation for Node objects.
// TODO: maybe sync.Map faster than *xsync.Map[uint32, Node]? elucidate later.
type bucket struct{ nodes *xsync.Map[uint32, Node] }

// newBucket creates a new node set.
func newBucket() *bucket { return &bucket{xsync.NewMap[uint32, Node]()} }

// Add adds a node to the set.
func (s *bucket) Add(n Node) {
	s.nodes.Store(n.GetId(), n)
}

// Delete removes a node from the set.
func (s *bucket) Delete(n Node) {
	s.nodes.Delete(n.GetId())
}

// ForEach iterates over all nodes in the set.
func (s *bucket) ForEach(f func(_ uint32, n Node) bool) {
	s.nodes.Range(f)
}

// pairPoint combines x,y coordinates into a single int key.
func pairPoint(x, y int) int {
	return (x << 16) ^ y
}

func (sh *SpatialHash) calculatePositionKey(x, y float32) int {
	return pairPoint(
		int(math32.Floor(x/sh.cellSize)),
		int(math32.Floor(y/sh.cellSize)),
	)
}

// Put adds a node to the spatial hash.
func (sh *SpatialHash) Put(n Node) {
	x, y := n.GetX(), n.GetY()
	key := sh.calculatePositionKey(x, y)

	// Get or create bucket
	bucket, exists := sh.buckets.Load(key)
	if !exists {
		bucket = newBucket()

		sh.buckets.Store(key, bucket)
	}

	bucket.Add(n)
}

// Remove removes a node from the spatial hash.
func (sh *SpatialHash) Remove(n Node) {
	x, y := n.GetX(), n.GetY()
	key := sh.calculatePositionKey(x, y)

	if bucket, ok := sh.buckets.Load(key); ok {
		bucket.Delete(n)
	}
}

// Update updates a node's position in the spatial hash.
func (sh *SpatialHash) Update(n Node) {
	x, y := n.GetX(), n.GetY()
	oldX, oldY := n.GetOldPos()

	key := sh.calculatePositionKey(x, y)
	oldKey := sh.calculatePositionKey(oldX, oldY)

	if oldKey != key { // Only update if cell is different from previous update
		// Delete old node from bucket
		if bucket, ok := sh.buckets.Load(oldKey); ok {
			bucket.Delete(n)
		}

		bucket, ok := sh.buckets.Load(key)
		if !ok {
			bucket = newBucket()

			sh.buckets.Store(key, bucket)
		}

		bucket.Add(n)
	}

	// Set old position for next update
	n.SetOldPos(x, y)
}

// searchResultPool is shared collision searchResultPool between Search.
var searchResultPool = zeropool.New(func() []Node { return make([]Node, 64) })

// Search finds all nodes within the specified radius.
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
				bucket.ForEach(func(_ uint32, n Node) bool {
					dx := n.GetX() - x
					dy := n.GetY() - y

					if (dx*dx + dy*dy) <= radiusSq {
						nodes = append(nodes, n)
					}

					return true
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
func (sh *SpatialHash) SearchRect(x, y, width, height float32, filter func(n Node) bool) []Node {
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
				bucket.ForEach(func(_ uint32, n Node) bool {
					if filter(n) {
						nodes = append(nodes, n)
					}

					return true
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
