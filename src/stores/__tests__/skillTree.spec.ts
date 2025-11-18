import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSkillTreeStore } from '../skillTree'
import type { Node, Edge } from '@vue-flow/core'

// Mock localStorage for jsdom environment
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

// Set up localStorage mock for both window and global
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  })
}
if (typeof global !== 'undefined') {
  Object.defineProperty(global, 'localStorage', {
    value: localStorageMock,
    writable: true,
  })
}

describe('SkillTreeStore', () => {
  beforeEach(() => {
    // Create a fresh pinia instance for each test
    setActivePinia(createPinia())
    // Clear localStorage
    localStorageMock.clear()
  })

  describe('addNode', () => {
    it('should add a new node with correct data', () => {
      const store = useSkillTreeStore()

      const nodeId = store.addNode({
        name: 'Test Skill',
        description: 'Test Description',
        cost: 10,
        level: 1,
      })

      expect(nodeId).toBe('skill-1')
      expect(store.nodes).toHaveLength(1)
      expect(store.nodes[0].data).toMatchObject({
        name: 'Test Skill',
        description: 'Test Description',
        cost: 10,
        level: 1,
        unlocked: false,
      })
    })

    it('should increment node ID for each new node', () => {
      const store = useSkillTreeStore()

      const id1 = store.addNode({ name: 'Skill 1', description: 'Desc 1' })
      const id2 = store.addNode({ name: 'Skill 2', description: 'Desc 2' })

      expect(id1).toBe('skill-1')
      expect(id2).toBe('skill-2')
    })
  })

  describe('canUnlock', () => {
    it('should return true for node with no prerequisites', () => {
      const store = useSkillTreeStore()
      const nodeId = store.addNode({ name: 'Skill', description: 'Desc' })

      expect(store.canUnlock(nodeId)).toBe(true)
    })

    it('should return true when all prerequisites are unlocked', () => {
      const store = useSkillTreeStore()
      const skill1Id = store.addNode({ name: 'Skill 1', description: 'Desc' })
      const skill2Id = store.addNode({ name: 'Skill 2', description: 'Desc' })

      store.addEdge(skill1Id, skill2Id)
      store.unlockNode(skill1Id)

      expect(store.canUnlock(skill2Id)).toBe(true)
    })

    it('should return false when prerequisites are not met', () => {
      const store = useSkillTreeStore()
      const skill1Id = store.addNode({ name: 'Skill 1', description: 'Desc' })
      const skill2Id = store.addNode({ name: 'Skill 2', description: 'Desc' })

      store.addEdge(skill1Id, skill2Id)

      expect(store.canUnlock(skill2Id)).toBe(false)
    })
  })

  describe('wouldCreateCycle', () => {
    it('should detect self-loop as cycle', () => {
      const store = useSkillTreeStore()
      const nodeId = store.addNode({ name: 'Skill', description: 'Desc' })

      expect(store.wouldCreateCycle(nodeId, nodeId)).toBe(true)
    })

    it('should detect simple cycle', () => {
      const store = useSkillTreeStore()
      const skill1Id = store.addNode({ name: 'Skill 1', description: 'Desc' })
      const skill2Id = store.addNode({ name: 'Skill 2', description: 'Desc' })

      store.addEdge(skill1Id, skill2Id)

      // Adding edge from skill2 to skill1 would create a cycle
      expect(store.wouldCreateCycle(skill2Id, skill1Id)).toBe(true)
    })

    it('should not detect cycle for valid edge', () => {
      const store = useSkillTreeStore()
      const skill1Id = store.addNode({ name: 'Skill 1', description: 'Desc' })
      const skill2Id = store.addNode({ name: 'Skill 2', description: 'Desc' })

      expect(store.wouldCreateCycle(skill1Id, skill2Id)).toBe(false)
    })

    it('should detect longer cycles', () => {
      const store = useSkillTreeStore()
      const skill1Id = store.addNode({ name: 'Skill 1', description: 'Desc' })
      const skill2Id = store.addNode({ name: 'Skill 2', description: 'Desc' })
      const skill3Id = store.addNode({ name: 'Skill 3', description: 'Desc' })

      store.addEdge(skill1Id, skill2Id)
      store.addEdge(skill2Id, skill3Id)

      // Adding edge from skill3 to skill1 would create a cycle
      expect(store.wouldCreateCycle(skill3Id, skill1Id)).toBe(true)
    })
  })

  describe('addEdge', () => {
    it('should add edge successfully', () => {
      const store = useSkillTreeStore()
      const skill1Id = store.addNode({ name: 'Skill 1', description: 'Desc' })
      const skill2Id = store.addNode({ name: 'Skill 2', description: 'Desc' })

      const result = store.addEdge(skill1Id, skill2Id)

      expect(result.success).toBe(true)
      expect(store.edges).toHaveLength(1)
      expect(store.edges[0].source).toBe(skill1Id)
      expect(store.edges[0].target).toBe(skill2Id)
    })

    it('should prevent duplicate edges', () => {
      const store = useSkillTreeStore()
      const skill1Id = store.addNode({ name: 'Skill 1', description: 'Desc' })
      const skill2Id = store.addNode({ name: 'Skill 2', description: 'Desc' })

      store.addEdge(skill1Id, skill2Id)
      const result = store.addEdge(skill1Id, skill2Id)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Edge already exists')
      expect(store.edges).toHaveLength(1)
    })

    it('should prevent cycles', () => {
      const store = useSkillTreeStore()
      const skill1Id = store.addNode({ name: 'Skill 1', description: 'Desc' })
      const skill2Id = store.addNode({ name: 'Skill 2', description: 'Desc' })

      store.addEdge(skill1Id, skill2Id)
      const result = store.addEdge(skill2Id, skill1Id)

      expect(result.success).toBe(false)
      expect(result.error).toBe('This connection would create a circular dependency')
    })
  })

  describe('unlockNode', () => {
    it('should unlock node with no prerequisites', () => {
      const store = useSkillTreeStore()
      const nodeId = store.addNode({ name: 'Skill', description: 'Desc' })

      const result = store.unlockNode(nodeId)

      expect(result.success).toBe(true)
      expect((store.nodes[0].data as any).unlocked).toBe(true)
    })

    it('should unlock node when prerequisites are met', () => {
      const store = useSkillTreeStore()
      const skill1Id = store.addNode({ name: 'Skill 1', description: 'Desc' })
      const skill2Id = store.addNode({ name: 'Skill 2', description: 'Desc' })

      store.addEdge(skill1Id, skill2Id)
      store.unlockNode(skill1Id)
      const result = store.unlockNode(skill2Id)

      expect(result.success).toBe(true)
      expect((store.nodes[1].data as any).unlocked).toBe(true)
    })

    it('should not unlock node when prerequisites are not met', () => {
      const store = useSkillTreeStore()
      const skill1Id = store.addNode({ name: 'Skill 1', description: 'Desc' })
      const skill2Id = store.addNode({ name: 'Skill 2', description: 'Desc' })

      store.addEdge(skill1Id, skill2Id)
      const result = store.unlockNode(skill2Id)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Prerequisites not met')
      expect((store.nodes[1].data as any).unlocked).toBe(false)
    })
  })

  describe('lockNode', () => {
    it('should lock an unlocked node', () => {
      const store = useSkillTreeStore()
      const nodeId = store.addNode({ name: 'Skill', description: 'Desc' })

      store.unlockNode(nodeId)
      expect((store.nodes[0].data as any).unlocked).toBe(true)

      store.lockNode(nodeId)
      expect((store.nodes[0].data as any).unlocked).toBe(false)
    })
  })

  describe('deleteNode', () => {
    it('should delete node and connected edges', () => {
      const store = useSkillTreeStore()
      const skill1Id = store.addNode({ name: 'Skill 1', description: 'Desc' })
      const skill2Id = store.addNode({ name: 'Skill 2', description: 'Desc' })

      store.addEdge(skill1Id, skill2Id)
      expect(store.edges).toHaveLength(1)

      store.deleteNode(skill1Id)

      expect(store.nodes).toHaveLength(1)
      expect(store.edges).toHaveLength(0)
    })
  })

  describe('resetAll', () => {
    it('should lock all nodes', () => {
      const store = useSkillTreeStore()
      const skill1Id = store.addNode({ name: 'Skill 1', description: 'Desc' })
      const skill2Id = store.addNode({ name: 'Skill 2', description: 'Desc' })

      store.unlockNode(skill1Id)
      store.unlockNode(skill2Id)

      store.resetAll()

      expect((store.nodes[0].data as any).unlocked).toBe(false)
      expect((store.nodes[1].data as any).unlocked).toBe(false)
    })
  })

  describe('localStorage persistence', () => {
    it('should save to localStorage', () => {
      const store = useSkillTreeStore()
      store.addNode({ name: 'Skill', description: 'Desc' })

      const stored = localStorage.getItem('skill-tree-data')
      expect(stored).toBeTruthy()

      const data = JSON.parse(stored!)
      expect(data.nodes).toHaveLength(1)
    })

    it('should load from localStorage', () => {
      const store1 = useSkillTreeStore()
      store1.addNode({ name: 'Skill', description: 'Desc' })

      // Create a new store instance (simulating page reload)
      setActivePinia(createPinia())
      const store2 = useSkillTreeStore()

      expect(store2.nodes).toHaveLength(1)
      expect(store2.nodes[0].data.name).toBe('Skill')
    })
  })
})
