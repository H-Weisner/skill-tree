<script setup lang="ts">
import { useSkillTreeStore } from '@/stores/skill-tree.store'
import { Controls } from '@vue-flow/controls'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import { toast } from 'vue-sonner'
import SkillTreeDropzone from './skill-tree.dropzone.vue'
import SkillNode from './skill-tree.skill-node.vue'
import useDragAndDrop from './use-dnd'

const store = useSkillTreeStore()

const emit = defineEmits<{
  showForm: []
}>()

// 1. Use the hook for Drag and Drop state and drop handlers
const { onDragOver, onDrop, onDragLeave, isDragOver } = useDragAndDrop(emit)

// 2. Use VueFlow directly for event listeners
const { onConnect, onNodeClick } = useVueFlow()

// Handle node connections - use store's addEdge for custom styling
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
    console.log('locked')
    toast.success(`Locked: ${nodeData.name}`)
  } else {
    const result = store.unlockNode(node.id)
    if (result.success) {
      console.log('unlocked')
      toast.success(`Unlocked: ${nodeData.name}!`)
    } else {
      toast.error(result.error || 'Cannot unlock: prerequisites not met')
    }
  }
})
</script>

<template>
  <div class="relative w-full h-full" @drop="onDrop">
    <VueFlow
      :nodes="store.nodes"
      :edges="store.edges"
      :node-types="{
        start: SkillNode,
        regular: SkillNode,
        capstone: SkillNode,
      }"
      :wrapper-style="{ width: '100%', height: '100%' }"
      class="bg-background"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
    >
      <SkillTreeDropzone
        :style="{
          backgroundColor: isDragOver ? 'hsl(var(--foreground) / 0.2)' : 'transparent',
          transition: 'background-color 0.2s ease',
        }"
      >
        <p v-if="isDragOver" class="text-lg font-semibold text-foreground">Drop here</p>
      </SkillTreeDropzone>
      <Controls class="bg-card! border-border! text-card-foreground!" />
    </VueFlow>
  </div>
</template>
