import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach } from 'vitest'
import { useSkillTreeStore } from './skill-tree.store'
import { NODE_TYPES, SKILL_TYPES } from '@/constants'

// Mock crypto.randomUUID for the environment
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => Math.random().toString(36).substring(7),
  },
})

// Mock LocalStorage to prevent persistence side effects during tests
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    clear: () => {
      store = {}
    },
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('Skill Tree Store', () => {
  let store: ReturnType<typeof useSkillTreeStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useSkillTreeStore()
    window.localStorage.clear()
  })

  describe('Node Management', () => {
    it('can add a node', () => {
      const id = store.addNode(
        { name: 'Fireball', description: '', skillType: SKILL_TYPES.REGULAR },
        NODE_TYPES.REGULAR,
        { x: 0, y: 0 },
      )

      expect(store.nodes).toHaveLength(1)
      const node = store.nodes[0]
      expect(node).toBeDefined()
      expect(node?.id).toBe(id)
      expect(node?.data.unlocked).toBe(false)
    })
  })

  describe('Graph Logic & Cycles', () => {
    it('prevents circular dependencies', () => {
      // Create A -> B
      const nodeA = store.addNode(
        { name: 'A', description: '', skillType: SKILL_TYPES.START },
        NODE_TYPES.START,
        { x: 0, y: 0 },
      )
      const nodeB = store.addNode(
        { name: 'B', description: '', skillType: SKILL_TYPES.REGULAR },
        NODE_TYPES.REGULAR,
        { x: 0, y: 0 },
      )

      store.addEdge(nodeA, nodeB)

      // Attempt B -> A (Cycle)
      const result = store.addEdge(nodeB, nodeA)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Circular dependency')
      expect(store.edges).toHaveLength(1)
    })
  })

  describe('Unlock Logic', () => {
    it('allows unlocking a start node with no parents', () => {
      const startId = store.addNode(
        { name: 'Start', description: '', skillType: SKILL_TYPES.START },
        NODE_TYPES.START,
        { x: 0, y: 0 },
      )

      const result = store.unlockNode(startId)
      expect(result.success).toBe(true)
      const node = store.nodes[0]
      expect(node).toBeDefined()
      expect(node?.data.unlocked).toBe(true)
    })

    it('prevents unlocking a node if parent is locked', () => {
      // A (Locked) -> B (Locked)
      const nodeA = store.addNode(
        { name: 'A', description: '', skillType: SKILL_TYPES.START },
        NODE_TYPES.START,
        { x: 0, y: 0 },
      )
      const nodeB = store.addNode(
        { name: 'B', description: '', skillType: SKILL_TYPES.REGULAR },
        NODE_TYPES.REGULAR,
        { x: 0, y: 0 },
      )
      store.addEdge(nodeA, nodeB)

      // Try unlocking B directly
      const result = store.unlockNode(nodeB)

      expect(result.success).toBe(false)
      expect(store.nodes.find((n) => n.id === nodeB)?.data.unlocked).toBe(false)
    })

    it('allows unlocking a node if parent is unlocked', () => {
      // A (Unlocked) -> B (Locked)
      const nodeA = store.addNode(
        { name: 'A', description: '', skillType: SKILL_TYPES.START },
        NODE_TYPES.START,
        { x: 0, y: 0 },
      )
      const nodeB = store.addNode(
        { name: 'B', description: '', skillType: SKILL_TYPES.REGULAR },
        NODE_TYPES.REGULAR,
        { x: 0, y: 0 },
      )
      store.addEdge(nodeA, nodeB)

      store.unlockNode(nodeA)

      const result = store.unlockNode(nodeB)
      expect(result.success).toBe(true)
    })
  })

  describe('Cascading Lock', () => {
    it('recursively locks children when a parent is locked', () => {
      // Setup Chain: A -> B -> C
      const nodeA = store.addNode(
        { name: 'A', description: '', skillType: SKILL_TYPES.START },
        NODE_TYPES.START,
        { x: 0, y: 0 },
      )
      const nodeB = store.addNode(
        { name: 'B', description: '', skillType: SKILL_TYPES.REGULAR },
        NODE_TYPES.REGULAR,
        { x: 0, y: 0 },
      )
      const nodeC = store.addNode(
        { name: 'C', description: '', skillType: SKILL_TYPES.REGULAR },
        NODE_TYPES.REGULAR,
        { x: 0, y: 0 },
      )

      store.addEdge(nodeA, nodeB)
      store.addEdge(nodeB, nodeC)

      // Unlock everything first
      store.unlockNode(nodeA)
      store.unlockNode(nodeB)
      store.unlockNode(nodeC)

      expect(store.unlockedNodes).toHaveLength(3)

      // Action: Lock the top node (A)
      store.lockNode(nodeA)

      // Expectation: A, B, and C should all be locked
      const getNode = (id: string) => store.nodes.find((n) => n.id === id)

      expect(getNode(nodeA)?.data.unlocked).toBe(false)
      expect(getNode(nodeB)?.data.unlocked).toBe(false)
      expect(getNode(nodeC)?.data.unlocked).toBe(false)
    })

    it('recursively locks branching paths', () => {
      // A -> B
      // A -> C
      const nodeA = store.addNode(
        { name: 'A', description: '', skillType: SKILL_TYPES.START },
        NODE_TYPES.START,
        { x: 0, y: 0 },
      )
      const nodeB = store.addNode(
        { name: 'B', description: '', skillType: SKILL_TYPES.REGULAR },
        NODE_TYPES.REGULAR,
        { x: 0, y: 0 },
      )
      const nodeC = store.addNode(
        { name: 'C', description: '', skillType: SKILL_TYPES.REGULAR },
        NODE_TYPES.REGULAR,
        { x: 0, y: 0 },
      )

      store.addEdge(nodeA, nodeB)
      store.addEdge(nodeA, nodeC)

      store.unlockNode(nodeA)
      store.unlockNode(nodeB)
      store.unlockNode(nodeC)

      store.lockNode(nodeA)

      expect(store.unlockedNodes).toHaveLength(0)
    })
  })
})
