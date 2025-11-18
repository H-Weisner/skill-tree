import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Node, Edge } from '@vue-flow/core'

export interface SkillNodeData {
  name: string
  description: string
  cost?: number
  level?: number
  unlocked: boolean
}

export interface SkillNode extends Node {
  data: SkillNodeData
}

const STORAGE_KEY = 'skill-tree-data'

export const useSkillTreeStore = defineStore('skillTree', () => {
  const nodes = ref<Node[]>([])
  const edges = ref<Edge[]>([])
  const nextNodeId = ref(1)

  const unlockedNodes = computed(() =>
    nodes.value.filter((node) => (node.data as SkillNodeData).unlocked),
  )

  const lockedNodes = computed(() =>
    nodes.value.filter((node) => !(node.data as SkillNodeData).unlocked),
  )

  // Check if a node can be unlocked (all prerequisites are unlocked)
  const canUnlock = (nodeId: string): boolean => {
    const node = nodes.value.find((n) => n.id === nodeId)
    if (!node) return false

    const nodeData = node.data as SkillNodeData
    if (nodeData.unlocked) return true

    // Find all prerequisite nodes (nodes that have edges pointing to this node)
    const prerequisiteEdges = edges.value.filter((edge) => edge.target === nodeId)

    if (prerequisiteEdges.length === 0) return true // No prerequisites

    // Check if all prerequisites are unlocked
    return prerequisiteEdges.every((edge) => {
      const sourceNode = nodes.value.find((n) => n.id === edge.source)
      return sourceNode ? (sourceNode.data as SkillNodeData).unlocked : false
    })
  }

  // Check if adding an edge would create a cycle
  const wouldCreateCycle = (sourceId: string, targetId: string): boolean => {
    // If source and target are the same, it's a self-loop (cycle)
    if (sourceId === targetId) return true

    // Use DFS to check if target can reach source (which would create a cycle)
    const visited = new Set<string>()
    const stack: string[] = [targetId]

    while (stack.length > 0) {
      const currentId = stack.pop()!

      if (currentId === sourceId) {
        return true // Cycle detected
      }

      if (visited.has(currentId)) continue
      visited.add(currentId)

      // Find all nodes that current node points to
      const outgoingEdges = edges.value.filter((edge) => edge.source === currentId)
      for (const edge of outgoingEdges) {
        if (!visited.has(edge.target)) {
          stack.push(edge.target)
        }
      }
    }

    return false
  }

  // Actions
  const addNode = (data: Omit<SkillNodeData, 'unlocked'>) => {
    const newNode: Node = {
      id: `skill-${nextNodeId.value++}`,
      type: 'skill',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        ...data,
        unlocked: false,
      },
    }
    nodes.value.push(newNode)
    saveToLocalStorage()
    return newNode.id
  }

  const updateNode = (nodeId: string, updates: Partial<SkillNodeData>) => {
    const node = nodes.value.find((n) => n.id === nodeId)
    if (node) {
      node.data = { ...node.data, ...updates }
      saveToLocalStorage()
    }
  }

  const deleteNode = (nodeId: string) => {
    nodes.value = nodes.value.filter((n) => n.id !== nodeId)
    // Remove all edges connected to this node
    edges.value = edges.value.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
    saveToLocalStorage()
  }

  const deleteAllNodes = () => {
    nodes.value = []
    edges.value = []
    nextNodeId.value = 1
    saveToLocalStorage()
  }

  const addEdge = (sourceId: string, targetId: string): { success: boolean; error?: string } => {
    // Check if edge already exists
    const edgeExists = edges.value.some(
      (edge) => edge.source === sourceId && edge.target === targetId,
    )
    if (edgeExists) {
      return { success: false, error: 'Edge already exists' }
    }

    // Check for cycles
    if (wouldCreateCycle(sourceId, targetId)) {
      return { success: false, error: 'This connection would create a circular dependency' }
    }

    const newEdge: Edge = {
      id: `edge-${sourceId}-${targetId}`,
      source: sourceId,
      target: targetId,
      type: 'smoothstep',
      animated: false,
    }
    edges.value.push(newEdge)
    saveToLocalStorage()
    return { success: true }
  }

  const deleteEdge = (edgeId: string) => {
    edges.value = edges.value.filter((e) => e.id !== edgeId)
    saveToLocalStorage()
  }

  const unlockNode = (nodeId: string): { success: boolean; error?: string } => {
    if (!canUnlock(nodeId)) {
      return { success: false, error: 'Prerequisites not met' }
    }

    const node = nodes.value.find((n) => n.id === nodeId)
    if (node) {
      const nodeData = node.data as SkillNodeData
      if (!nodeData.unlocked) {
        nodeData.unlocked = true
        saveToLocalStorage()
        return { success: true }
      }
    }
    return { success: false, error: 'Node not found' }
  }

  const lockNode = (nodeId: string) => {
    const node = nodes.value.find((n) => n.id === nodeId)
    if (node) {
      const nodeData = node.data as SkillNodeData
      nodeData.unlocked = false
      saveToLocalStorage()
    }
  }

  const resetAll = () => {
    nodes.value.forEach((node) => {
      const nodeData = node.data as SkillNodeData
      nodeData.unlocked = false
    })
    saveToLocalStorage()
  }

  // Persistence
  const saveToLocalStorage = () => {
    try {
      const data = {
        nodes: nodes.value,
        edges: edges.value,
        nextNodeId: nextNodeId.value,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  }

  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        nodes.value = data.nodes || []
        edges.value = data.edges || []
        nextNodeId.value = data.nextNodeId || 1
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error)
    }
  }

  // Initialize
  loadFromLocalStorage()

  return {
    // State
    nodes,
    edges,
    // Computed
    unlockedNodes,
    lockedNodes,
    // Methods
    canUnlock,
    wouldCreateCycle,
    addNode,
    updateNode,
    deleteNode,
    addEdge,
    deleteEdge,
    unlockNode,
    lockNode,
    resetAll,
    deleteAllNodes,
    saveToLocalStorage,
    loadFromLocalStorage,
  }
})
