package collision

import (
	"math"

	"github.com/colega/zeropool"
	"golang.org/x/exp/constraints"

	"github.com/puzpuzpuz/xsync/v4"
)

type Number interface {
	constraints.Integer | constraints.Float
}

// Node represents an interface entity.
type Node[Id comparable, N Number] interface {
	// GetId returns the unique identifier of the node.
	GetId() Id

	// GetX returns the current X coordinate of the node.
	GetX() N
	// GetY returns the current Y coordinate of the node.
	GetY() N

	// SetOldPos stores the previous position of the node.
	SetOldPos(x, y N)
	// GetOldPos returns the previous X,Y coordinates of the node.
	GetOldPos() (N, N)
}

// NodeSlice is slice of node.
type NodeSlice[Id comparable, N Number] = []Node[Id, N]

// ToNodeSlice converts slice of type that satisfies Node to NodeSlice.
func ToNodeSlice[T Node[Id, N], Id comparable, N Number](entities []T) NodeSlice[Id, N] {
	nodes := make(NodeSlice[Id, N], len(entities))

	for i, e := range entities {
		nodes[i] = e
	}

	return nodes
}

// SpatialHash provides a thread-safe 2D spatial hashing implementation.
type SpatialHash[Id comparable, N Number] struct {
	cellSize N
	buckets  *xsync.Map[int, *bucket[Id, N]]

	nodePool zeropool.Pool[NodeSlice[Id, N]]
}

// NewSpatialHash creates a new spatial hash.
func NewSpatialHash[Id comparable, N Number](cellSize N) *SpatialHash[Id, N] {
	return &SpatialHash[Id, N]{
		cellSize: cellSize,
		buckets:  xsync.NewMap[int, *bucket[Id, N]](),

		// TODO: automatically calculate pool size from cell size
		nodePool: zeropool.New(func() NodeSlice[Id, N] { return make(NodeSlice[Id, N], 64) }),
	}
}

// bucket is a thread-safe set implementation for Node objects.
type bucket[Id comparable, N Number] struct{ nodes *xsync.Map[Id, Node[Id, N]] }

// newBucket creates a new node set.
func newBucket[Id comparable, N Number]() *bucket[Id, N] {
	return &bucket[Id, N]{xsync.NewMap[Id, Node[Id, N]]()}
}

// Add adds a node to the set.
func (s *bucket[Id, N]) Add(n Node[Id, N]) {
	s.nodes.Store(n.GetId(), n)
}

// Delete removes a node from the set.
func (s *bucket[Id, N]) Delete(n Node[Id, N]) {
	s.nodes.Delete(n.GetId())
}

// ForEach iterates over all nodes in the set.
func (s *bucket[Id, N]) ForEach(f func(_ Id, n Node[Id, N]) bool) {
	s.nodes.Range(f)
}

// pairPoint combines x,y coordinates into a single int key.
func pairPoint(x, y int) int {
	return (x << 16) ^ y
}

func (sh *SpatialHash[Id, N]) calculatePositionKey(x, y N) int {
	return pairPoint(
		int(math.Floor(float64(x/sh.cellSize))),
		int(math.Floor(float64(y/sh.cellSize))),
	)
}

// Put adds a node to the spatial hash.
func (sh *SpatialHash[Id, N]) Put(n Node[Id, N]) {
	x, y := n.GetX(), n.GetY()
	key := sh.calculatePositionKey(x, y)

	// Get or create bucket
	bucket, exists := sh.buckets.Load(key)
	if !exists {
		bucket = newBucket[Id, N]()

		sh.buckets.Store(key, bucket)
	}

	bucket.Add(n)
}

// Remove removes a node from the spatial hash.
func (sh *SpatialHash[Id, N]) Remove(n Node[Id, N]) {
	x, y := n.GetX(), n.GetY()
	key := sh.calculatePositionKey(x, y)

	if bucket, ok := sh.buckets.Load(key); ok {
		bucket.Delete(n)
	}
}

// Update updates a node's position in the spatial hash.
func (sh *SpatialHash[Id, N]) Update(n Node[Id, N]) {
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
			bucket = newBucket[Id, N]()

			sh.buckets.Store(key, bucket)
		}

		bucket.Add(n)
	}

	// Set old position for next update
	n.SetOldPos(x, y)
}

// Search searches all nodes within the radius.
func (sh *SpatialHash[Id, N]) Search(x, y, radius N) NodeSlice[Id, N] {
	radiusSq := radius * radius

	minX := int(math.Floor(float64((x - radius) / sh.cellSize)))
	maxX := int(math.Floor(float64((x + radius) / sh.cellSize)))
	minY := int(math.Floor(float64((y - radius) / sh.cellSize)))
	maxY := int(math.Floor(float64((y + radius) / sh.cellSize)))

	result := sh.nodePool.Get()
	nodes := result[:0]

	for yy := minY; yy <= maxY; yy++ {
		for xx := minX; xx <= maxX; xx++ {
			key := pairPoint(xx, yy)

			if bucket, ok := sh.buckets.Load(key); ok {
				bucket.ForEach(func(_ Id, n Node[Id, N]) bool {
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

	finalResult := make(NodeSlice[Id, N], len(nodes))
	copy(finalResult, nodes)

	sh.nodePool.Put(result)

	return finalResult
}

// QueryRect queries all nodes within the specified rectangular area centered on a point.
func (sh *SpatialHash[Id, N]) QueryRect(x, y, width, height N, filter func(n Node[Id, N]) bool) NodeSlice[Id, N] {
	halfWidth := width / N(2)
	halfHeight := height / N(2)

	minX := int(math.Floor(float64((x - halfWidth) / sh.cellSize)))
	maxX := int(math.Floor(float64((x + halfWidth) / sh.cellSize)))
	minY := int(math.Floor(float64((y - halfHeight) / sh.cellSize)))
	maxY := int(math.Floor(float64((y + halfHeight) / sh.cellSize)))

	result := sh.nodePool.Get()
	nodes := result[:0]

	for yy := minY; yy <= maxY; yy++ {
		for xx := minX; xx <= maxX; xx++ {
			key := pairPoint(xx, yy)

			if bucket, ok := sh.buckets.Load(key); ok {
				bucket.ForEach(func(_ Id, n Node[Id, N]) bool {
					if filter(n) {
						nodes = append(nodes, n)
					}

					return true
				})
			}
		}
	}

	finalResult := make(NodeSlice[Id, N], len(nodes))
	copy(finalResult, nodes)

	sh.nodePool.Put(result)

	return finalResult
}

// Reset clears all nodes from the spatial hash.
func (sh *SpatialHash[Id, N]) Reset() {
	sh.buckets.Clear()
}
