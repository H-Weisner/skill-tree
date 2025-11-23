<script setup lang="ts">
import { markRaw } from 'vue'
import { useSkillTreeStore } from '@/stores/skill-tree.store'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { toast } from 'vue-sonner'
import SkillNode from './skill-tree.skill-node.vue'
import useDragAndDrop from './use-dnd'
import { NODE_TYPES } from '@/constants'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

// Mark component as non-reactive to prevent unnecessary re-renders (AI told me to do this as it was firing off a lot of re-renders)
const SkillNodeComponent = markRaw(SkillNode)

const store = useSkillTreeStore()
const emit = defineEmits<{ showForm: [] }>()

const { onDragOver, onDrop, onDragLeave } = useDragAndDrop(emit)

const { onConnect, onNodeClick, onPaneReady, onMoveEnd, viewport } = useVueFlow()

// Restore Viewport when VueFlow is fully initialized - doesn't seem to work
// TODO: Investigate way to ensure viewport is always consistent
onPaneReady((instance) => {
  if (store.viewport) {
    instance.setViewport(store.viewport)
  }
})

// Save viewport state when user finishes moving/zooming
onMoveEnd(() => {
  if (viewport.value) {
    store.setViewport({
      x: viewport.value.x,
      y: viewport.value.y,
      zoom: viewport.value.zoom,
    })
  }
})

// Handle connections
onConnect((params) => {
  if (params.source && params.target) {
    const result = store.addEdge(params.source, params.target)
    if (result.success) toast.success('Connected!')
    else toast.error(result.error || 'Failed to connect skills')
  }
})

// Unlock/Lock nodes
onNodeClick(({ node }) => {
  if (node.data.unlocked) {
    store.lockNode(node.id)
    toast.success(`Locked: ${node.data.name}`)
  } else {
    const result = store.unlockNode(node.id)
    if (result.success) toast.success(`Unlocked: ${node.data.name}!`)
    else toast.error(result.error || 'Failed to unlock skill')
  }
})
</script>

<template>
  <div class="relative w-full h-full" @drop="onDrop">
    <VueFlow
      :nodes="store.nodes"
      :edges="store.edges"
      :node-types="{
        [NODE_TYPES.START]: SkillNodeComponent,
        [NODE_TYPES.REGULAR]: SkillNodeComponent,
        [NODE_TYPES.CAPSTONE]: SkillNodeComponent,
      }"
      class="bg-background"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
    >
      <Background :size="2" :gap="20" pattern-color="var(--border)" />
      <Controls class="bg-card! border-border! text-card-foreground!" />
    </VueFlow>
  </div>
</template>
