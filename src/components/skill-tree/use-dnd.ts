import { ref, watch } from 'vue'
import { useVueFlow } from '@vue-flow/core'
import { getFlowTypeFromDragType, getSkillLabelFromType, type SkillTypeName } from '@/constants'

export type PendingDrop = {
  position: { x: number; y: number }
  skillType: SkillTypeName // "Regular Skill"
  flowType: string // "regular"
} | null

// Global DnD state
const state = {
  draggedType: ref<string | null>(null),
  isDragOver: ref(false),
  isDragging: ref(false),
  pendingDrop: ref<PendingDrop>(null),
}

export default function useDragAndDrop(emit?: { (event: 'showForm'): void }) {
  const { draggedType, isDragOver, isDragging, pendingDrop } = state
  const { screenToFlowCoordinate } = useVueFlow()
  let dragLeaveTimeout: ReturnType<typeof setTimeout> | null = null

  watch(isDragging, (dragging) => {
    document.body.style.userSelect = dragging ? 'none' : ''
  })

  function onDragStart(event: DragEvent, type: string) {
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
    if (dragLeaveTimeout) {
      clearTimeout(dragLeaveTimeout)
      dragLeaveTimeout = null
    }
    if (draggedType.value) {
      isDragOver.value = true
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
    }
  }

  function onDragLeave() {
    if (dragLeaveTimeout) clearTimeout(dragLeaveTimeout)
    dragLeaveTimeout = setTimeout(() => {
      isDragOver.value = false
      dragLeaveTimeout = null
    }, 100)
  }

  function onDragEnd() {
    if (dragLeaveTimeout) clearTimeout(dragLeaveTimeout)
    isDragging.value = false
    isDragOver.value = false
    draggedType.value = null
    document.removeEventListener('drop', onDragEnd)
  }

  function onDrop(event: DragEvent) {
    event.preventDefault()
    const type = draggedType.value || event.dataTransfer?.getData('application/vueflow')

    if (!type) {
      onDragEnd()
      return
    }

    const position = screenToFlowCoordinate({ x: event.clientX, y: event.clientY })

    pendingDrop.value = {
      position,
      skillType: getSkillLabelFromType(type),
      flowType: getFlowTypeFromDragType(type),
    }

    if (emit) emit('showForm')
    onDragEnd()
  }

  function cancelPendingDrop() {
    pendingDrop.value = null
  }

  return {
    draggedType,
    isDragOver,
    isDragging,
    pendingDrop,
    onDragStart,
    onDragLeave,
    onDragOver,
    onDrop,
    cancelPendingDrop,
  }
}
