import { useSkillTreeStore, type SkillType } from '@/stores/skill-tree.store'
import { useVueFlow } from '@vue-flow/core'
import { ref, watch, type Ref } from 'vue'

type PendingDrop = {
  position: { x: number; y: number }
  skillType: SkillType
  type: string
} | null

type State<T extends string | null> = {
  draggedType: Ref<T>
  isDragOver: Ref<boolean>
  isDragging: Ref<boolean>
  pendingDrop: Ref<PendingDrop>
}

/**
 * Global state for DnD to ensure all components share the same dragging status
 */
const state: State<string | null> = {
  draggedType: ref<string | null>(null),
  isDragOver: ref(false),
  isDragging: ref(false),
  pendingDrop: ref<PendingDrop>(null),
}

export default function useDragAndDrop(emit?: { (event: 'showForm'): void }) {
  const { draggedType, isDragOver, isDragging, pendingDrop } = state
  const store = useSkillTreeStore()

  // We only need these helpers from VueFlow, NOT the event listeners
  const { screenToFlowCoordinate, onNodesInitialized, updateNode } = useVueFlow()

  watch(isDragging, (dragging) => {
    document.body.style.userSelect = dragging ? 'none' : ''
  })

  // Map drag types to skill types (for data)
  function getSkillType(type: string): SkillType {
    switch (type) {
      case 'input':
        return 'Skill Tree Start'
      case 'output':
        return 'Capstone Skill'
      case 'default':
      default:
        return 'Regular Skill'
    }
  }

  // Map drag types to VueFlow node types
  function getVueFlowNodeType(type: string): 'start' | 'regular' | 'capstone' {
    switch (type) {
      case 'input':
        return 'start'
      case 'output':
        return 'capstone'
      case 'default':
      default:
        return 'regular'
    }
  }

  function onDragStart(event: DragEvent, type: string) {
    store.setCurrentNode({
      name: '',
      description: '',
      unlocked: false,
      skillType: getSkillType(type),
    })
    if (event.dataTransfer) {
      event.dataTransfer.setData('application/vueflow', type)
      event.dataTransfer.effectAllowed = 'move'
    }

    draggedType.value = type
    isDragging.value = true

    document.addEventListener('drop', onDragEnd)
  }

  function onDragOver(event: DragEvent) {
    event.preventDefault()

    if (draggedType.value) {
      isDragOver.value = true

      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'move'
      }
    }
  }

  function onDragLeave() {
    isDragOver.value = false
  }

  function onDragEnd() {
    isDragging.value = false
    isDragOver.value = false
    draggedType.value = null

    // If drag ended without dropping on canvas (no pending drop), clear currentNode
    if (!pendingDrop.value) {
      store.clearCurrentNode()
    }

    document.removeEventListener('drop', onDragEnd)
  }

  function onDrop(event: DragEvent) {
    event.preventDefault()

    // Get the type from draggedType or fallback to dataTransfer
    const type = draggedType.value || event.dataTransfer?.getData('application/vueflow')

    if (!type) {
      onDragEnd()
      return
    }

    // Handle the old skill-node type for showing the form
    if (type === 'skill-node') {
      if (emit) {
        emit('showForm')
      }
      onDragEnd()
      return
    }

    const position = screenToFlowCoordinate({
      x: event.clientX,
      y: event.clientY,
    })

    const skillType = getSkillType(type)

    pendingDrop.value = {
      position,
      type,
      skillType,
    }

    if (emit) {
      emit('showForm')
    }

    onDragEnd()
  }

  // Create node from pending drop data (called when form is submitted)
  function createNodeFromPendingDrop(data: {
    name: string
    description: string
    cost?: number
    level?: number
  }): string | null {
    if (!pendingDrop.value) {
      return null
    }

    const { position, skillType, type } = pendingDrop.value

    const vueFlowNodeType = getVueFlowNodeType(type)

    const nodeId = store.addNode(
      {
        ...data,
        skillType,
      },
      vueFlowNodeType,
      position,
    )

    /**
     * Align node position after drop
     */
    const { off } = onNodesInitialized(() => {
      updateNode(nodeId, (node) => ({
        position: {
          x: node.position.x - node.dimensions.width / 2,
          y: node.position.y - node.dimensions.height / 2,
        },
      }))

      off()
    })

    // Clear pending drop and currentNode
    pendingDrop.value = null
    store.clearCurrentNode()

    return nodeId
  }

  // Cancel pending drop (called when form is cancelled)
  function cancelPendingDrop() {
    pendingDrop.value = null
    store.clearCurrentNode()
  }

  // Get pending drop skill type (for form pre-population)
  const getPendingDropSkillType = (): SkillType | null => {
    return pendingDrop.value?.skillType || null
  }

  return {
    draggedType,
    isDragOver,
    isDragging,
    onDragStart,
    onDragLeave,
    onDragOver,
    onDrop,
    createNodeFromPendingDrop,
    cancelPendingDrop,
    getPendingDropSkillType,
  }
}
