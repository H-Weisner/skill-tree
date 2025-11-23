import { type Edge, type Node, MarkerType } from '@vue-flow/core'
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { type SkillTypeName, NODE_TYPES } from '@/constants'

export interface SkillNodeData {
  name: string
  description: string
  cost?: number
  maxLevel?: number
  icon?: string
  unlocked: boolean
  skillType: SkillTypeName
}

export interface SkillNode extends Node {
  data: SkillNodeData
  type: string
}

const STORAGE_KEY = 'skill-tree-data'

// --- Configuration ---
const COLOR_ACTIVE = 'var(--foreground)'
const COLOR_DULL = 'var(--muted)'

interface StoredData {
  nodes: SkillNode[]
  edges: Edge[]
  viewport?: { x: number; y: number; zoom: number }
}

export const useSkillTreeStore = defineStore('skillTree', () => {
  const nodes = ref<SkillNode[]>([])
  const edges = ref<Edge[]>([])
  const viewport = ref<{ x: number; y: number; zoom: number } | null>(null)

  // Calculate Edge Style/Animation
  // 1. Animated (Moving dots) = "You can unlock this next"
  // 2. Solid Color = "You have unlocked this path"
  // 3. Dull/Grey = "Locked"
  const getEdgeOptions = (sourceId: string, targetId: string) => {
    const sourceNode = nodes.value.find((n) => n.id === sourceId)
    const targetNode = nodes.value.find((n) => n.id === targetId)

    const isSourceUnlocked = sourceNode?.data.unlocked || false
    const isTargetUnlocked = targetNode?.data.unlocked || false

    let animated = false
    let color = COLOR_DULL

    if (isSourceUnlocked && !isTargetUnlocked) {
      animated = true
      color = COLOR_ACTIVE
    } else if (isSourceUnlocked && isTargetUnlocked) {
      animated = false
      color = COLOR_ACTIVE
    } else {
      animated = false
      color = COLOR_DULL
    }

    return {
      animated,
      style: { strokeWidth: 2, stroke: color },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: color,
      },
    }
  }

  const updateConnectedEdges = (nodeId: string) => {
    // Vue Flow doesn't seem to care if you change a property inside an edge
    // Replace the whole edge object so the graph redraws the colors
    edges.value = edges.value.map((edge) => {
      if (edge.source === nodeId || edge.target === nodeId) {
        const options = getEdgeOptions(edge.source, edge.target)
        return { ...edge, ...options }
      }
      return edge
    })
  }

  // We sync all edges to ensure the colors are correct when we unlock/lock a node
  const syncAllEdges = () => {
    edges.value = edges.value.map((edge) => {
      const options = getEdgeOptions(edge.source, edge.target)
      return { ...edge, ...options }
    })
  }

  // When you refresh the page/come back, we load in all the stuff
  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data: StoredData = JSON.parse(stored)
        nodes.value = data.nodes || []
        edges.value = data.edges || []
        viewport.value = data.viewport || null
        syncAllEdges()
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error)
    }
  }

  loadFromLocalStorage()

  // Main thing is Autosave: '{ deep: true }'
  // It ensures we save even if a nested property (like node.data.unlocked) changes,
  // not just when the array itself is replaced. Similar issue to updating connected edges
  watch(
    [nodes, edges, viewport],
    () => {
      const data: StoredData = {
        nodes: nodes.value,
        edges: edges.value,
        viewport: viewport.value || undefined,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    },
    { deep: true },
  )

  const unlockedNodes = computed(() => nodes.value.filter((n) => n.data.unlocked))
  const lockedNodes = computed(() => nodes.value.filter((n) => !n.data.unlocked))

  const canUnlock = (nodeId: string): boolean => {
    const node = nodes.value.find((n) => n.id === nodeId)
    if (!node) return false
    if (node.data.unlocked) return true

    const edgesPointingToNode = edges.value.filter((edge) => edge.target === nodeId)

    // If no arrows point to this, it must be a 'Start' node to be unlockable
    if (edgesPointingToNode.length === 0) {
      return node.type === NODE_TYPES.START
    }

    // Otherwise, ALL parents (skills pointing to this one) must be unlocked first
    return edgesPointingToNode.every((edge) => {
      const sourceNode = nodes.value.find((n) => n.id === edge.source)
      return sourceNode ? sourceNode.data.unlocked : false
    })
  }

  // "Infinite Loop" checker.
  const wouldCreateCycle = (sourceId: string, targetId: string): boolean => {
    if (sourceId === targetId) return true // Can't connect to self
    const visited = new Set<string>()
    const stack: string[] = [targetId]

    while (stack.length > 0) {
      const currentId = stack.pop()!
      if (currentId === sourceId) return true // Found a path back to start! Cycle detected.
      if (visited.has(currentId)) continue
      visited.add(currentId)

      // Check all children of this node
      const outgoingEdges = edges.value.filter((edge) => edge.source === currentId)
      for (const edge of outgoingEdges) {
        if (!visited.has(edge.target)) stack.push(edge.target)
      }
    }
    return false
  }

  const setViewport = (vp: { x: number; y: number; zoom: number }) => {
    viewport.value = vp
  }

  const addNode = (
    data: Omit<SkillNodeData, 'unlocked'>,
    type: string,
    position: { x: number; y: number },
  ) => {
    const newNode: SkillNode = {
      id: crypto.randomUUID(),
      type,
      position,
      data: { ...data, unlocked: false },
    }
    nodes.value.push(newNode)
    return newNode.id
  }

  const updateNode = (nodeId: string, updates: Partial<SkillNodeData>) => {
    const node = nodes.value.find((n) => n.id === nodeId)
    if (node) {
      // Update 'node.data' directly instead of replacing the whole node object
      // Replacing the obj caused flickering
      Object.assign(node.data, updates)

      if (updates.unlocked !== undefined) {
        updateConnectedEdges(nodeId)
      }
    }
  }

  const deleteNode = (nodeId: string) => {
    nodes.value = nodes.value.filter((n) => n.id !== nodeId)
    edges.value = edges.value.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
  }

  const deleteAllNodes = () => {
    nodes.value = []
    edges.value = []
  }

  const addEdge = (sourceId: string, targetId: string): { success: boolean; error?: string } => {
    if (edges.value.some((e) => e.source === sourceId && e.target === targetId)) {
      return { success: false, error: 'Edge already exists' }
    }
    if (wouldCreateCycle(sourceId, targetId)) {
      return { success: false, error: 'Circular dependency detected' }
    }

    const options = getEdgeOptions(sourceId, targetId)

    edges.value.push({
      id: `edge-${sourceId}-${targetId}`,
      source: sourceId,
      target: targetId,
      type: 'smoothstep',
      ...options,
    })
    return { success: true }
  }

  const deleteEdge = (edgeId: string) => {
    edges.value = edges.value.filter((e) => e.id !== edgeId)
  }

  const unlockNode = (nodeId: string): { success: boolean; error?: string } => {
    if (!canUnlock(nodeId)) return { success: false, error: 'Prerequisites not met' }

    const node = nodes.value.find((n) => n.id === nodeId)
    if (node) {
      node.data.unlocked = true
      updateConnectedEdges(nodeId)
      return { success: true }
    }
    return { success: false, error: 'Node not found' }
  }

  // If we lock a skill, we must also lock every skill that depends on it
  const lockNode = (nodeId: string) => {
    const stack = [nodeId]
    const nodesToLock = new Set<string>()

    // Find all nodes that depend on the node we're locking
    while (stack.length > 0) {
      const currentId = stack.pop()!

      if (nodesToLock.has(currentId)) continue
      nodesToLock.add(currentId)

      const childrenIds = edges.value
        .filter((edge) => edge.source === currentId)
        .map((edge) => edge.target)

      stack.push(...childrenIds)
    }

    // Lock every node we find
    nodesToLock.forEach((id) => {
      const node = nodes.value.find((n) => n.id === id)
      if (node) {
        node.data.unlocked = false
      }
    })

    syncAllEdges()
  }

  // Resets all nodes and edges to locked state
  const resetAll = () => {
    nodes.value.forEach((node) => (node.data.unlocked = false))

    edges.value = edges.value.map((edge) => ({
      ...edge,
      animated: false,
      style: { strokeWidth: 2, stroke: COLOR_DULL },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: COLOR_DULL,
      },
    }))
  }

  return {
    nodes,
    edges,
    viewport,
    setViewport,
    unlockedNodes,
    lockedNodes,
    canUnlock,
    addNode,
    updateNode,
    deleteNode,
    deleteAllNodes,
    wouldCreateCycle,
    addEdge,
    deleteEdge,
    unlockNode,
    lockNode,
    resetAll,
  }
})
