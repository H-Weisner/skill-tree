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

  // --- Helper: Calculate Edge Style/Animation ---
  const getEdgeOptions = (sourceId: string, targetId: string) => {
    const sourceNode = nodes.value.find((n) => n.id === sourceId)
    const targetNode = nodes.value.find((n) => n.id === targetId)

    const isSourceUnlocked = sourceNode?.data.unlocked || false
    const isTargetUnlocked = targetNode?.data.unlocked || false

    let animated = false
    let color = COLOR_DULL

    if (isSourceUnlocked && !isTargetUnlocked) {
      // Case 1: Source Unlocked -> Target Locked (Path Available)
      animated = true
      color = COLOR_ACTIVE
    } else if (isSourceUnlocked && isTargetUnlocked) {
      // Case 2: Both Unlocked (Path Established)
      animated = false
      color = COLOR_ACTIVE
    } else {
      // Case 3: Source Locked (Path Locked)
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

  // --- Helper: Update Connected Edges ---
  const updateConnectedEdges = (nodeId: string) => {
    // We REPLACE the edge objects. This forces Vue Flow to redraw the lines.
    edges.value = edges.value.map((edge) => {
      if (edge.source === nodeId || edge.target === nodeId) {
        const options = getEdgeOptions(edge.source, edge.target)
        return { ...edge, ...options }
      }
      return edge
    })
  }

  const syncAllEdges = () => {
    edges.value = edges.value.map((edge) => {
      const options = getEdgeOptions(edge.source, edge.target)
      return { ...edge, ...options }
    })
  }

  // --- Persistence ---
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

  // --- Getters ---
  const unlockedNodes = computed(() => nodes.value.filter((n) => n.data.unlocked))
  const lockedNodes = computed(() => nodes.value.filter((n) => !n.data.unlocked))

  // --- Core Logic ---
  const canUnlock = (nodeId: string): boolean => {
    const node = nodes.value.find((n) => n.id === nodeId)
    if (!node) return false
    if (node.data.unlocked) return true

    const edgesPointingToNode = edges.value.filter((edge) => edge.target === nodeId)

    if (edgesPointingToNode.length === 0) {
      return node.type === NODE_TYPES.START
    }

    return edgesPointingToNode.every((edge) => {
      const sourceNode = nodes.value.find((n) => n.id === edge.source)
      return sourceNode ? sourceNode.data.unlocked : false
    })
  }

  const wouldCreateCycle = (sourceId: string, targetId: string): boolean => {
    if (sourceId === targetId) return true
    const visited = new Set<string>()
    const stack: string[] = [targetId]

    while (stack.length > 0) {
      const currentId = stack.pop()!
      if (currentId === sourceId) return true
      if (visited.has(currentId)) continue
      visited.add(currentId)

      const outgoingEdges = edges.value.filter((edge) => edge.source === currentId)
      for (const edge of outgoingEdges) {
        if (!visited.has(edge.target)) stack.push(edge.target)
      }
    }
    return false
  }

  // --- Actions ---
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
      // DIRECT MUTATION: Preserves Node Object Identity
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
      // FIX: Mutate the data property directly.
      // This allows Vue Flow to keep track of the node instance
      // while the deep watcher in Pinia still picks up the change.
      node.data.unlocked = true

      // Update Edges immediately
      updateConnectedEdges(nodeId)

      return { success: true }
    }
    return { success: false, error: 'Node not found' }
  }

  const lockNode = (nodeId: string) => {
    // Use a stack to find the node and all its descendants (Breadth-First/Depth-First traversal)
    const stack = [nodeId]
    const nodesToLock = new Set<string>()

    while (stack.length > 0) {
      const currentId = stack.pop()!

      // Avoid processing the same node twice (though acyclic check prevents this usually)
      if (nodesToLock.has(currentId)) continue

      nodesToLock.add(currentId)

      // Find all edges where the current node is the source (outgoing connections)
      const childrenIds = edges.value
        .filter((edge) => edge.source === currentId)
        .map((edge) => edge.target)

      stack.push(...childrenIds)
    }

    // Batch update: Set all found nodes to locked
    nodesToLock.forEach((id) => {
      const node = nodes.value.find((n) => n.id === id)
      if (node) {
        node.data.unlocked = false
      }
    })

    // Refresh visual styles for all edges since multiple nodes changed state
    syncAllEdges()
  }

  const resetAll = () => {
    // Mutate nodes in place
    nodes.value.forEach((node) => (node.data.unlocked = false))

    // Replace edges to force visual update
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
