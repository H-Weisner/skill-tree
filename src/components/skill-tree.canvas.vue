<script setup lang="ts">
import { useSkillTreeStore } from '@/stores/skill-tree.store'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import { toast } from 'vue-sonner'
import SkillNode from './skill-tree.node.vue'

const store = useSkillTreeStore()
const { onConnect, onNodeClick } = useVueFlow()

const emit = defineEmits<{
  showForm: []
}>()

// Handle node connections
onConnect((params) => {
  if (params.source && params.target) {
    const result = store.addEdge(params.source, params.target)
    if (result.success) {
      toast.success('Connection created successfully!')
    } else {
      toast.error(result.error || 'Failed to create connection')
    }
  }
})

// Handle node clicks (unlock/lock)
onNodeClick(({ node }) => {
  const nodeData = node.data as { unlocked: boolean; name: string }

  if (nodeData.unlocked) {
    store.lockNode(node.id)
    toast.success(`Locked: ${nodeData.name}`)
  } else {
    const result = store.unlockNode(node.id)
    if (result.success) {
      toast.success(`Unlocked: ${nodeData.name}!`)
    } else {
      toast.error(result.error || 'Cannot unlock: prerequisites not met')
    }
  }
})

// Handle drag and drop from sidebar
const handleDrop = (event: DragEvent) => {
  event.preventDefault()

  const data = event.dataTransfer?.getData('application/vueflow')
  if (data === 'skill-node') {
    emit('showForm')
  }
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}
</script>

<template>
  <div class="relative w-full h-full">
    <VueFlow
      :nodes="store.nodes"
      :edges="store.edges"
      :node-types="{ skill: SkillNode }"
      w
      class="bg-background [&_.vue-flow__pane]:cursor-grab [&_.vue-flow__pane.dragging]:cursor-grabbing [&_.vue-flow__node]:cursor-pointer cursor-grab-enhanced"
      @drop="handleDrop"
      @dragover="handleDragOver"
    >
      <Background pattern-color="var(--border)" :gap="16" />
      <Controls class="bg-card! border-border! text-card-foreground!" />
    </VueFlow>
  </div>
</template>
