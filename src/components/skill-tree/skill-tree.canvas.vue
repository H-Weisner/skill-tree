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

// Mark component as non-reactive
const SkillNodeComponent = markRaw(SkillNode)

const store = useSkillTreeStore()
const emit = defineEmits<{ showForm: [] }>()

// DnD Hooks
const { onDragOver, onDrop, onDragLeave } = useDragAndDrop(emit)

// VueFlow Hooks
// We use onMoveEnd instead of watching 'viewport' for better performance (only saves when drag stops)
const { onConnect, onNodeClick, onPaneReady, onMoveEnd, viewport } = useVueFlow()

// 1. Restore Viewport cleanly when VueFlow is fully initialized
onPaneReady((instance) => {
  if (store.viewport) {
    instance.setViewport(store.viewport)
  }
})

// 2. Save viewport state when user finishes moving/zooming
onMoveEnd(() => {
  if (viewport.value) {
    store.setViewport({
      x: viewport.value.x,
      y: viewport.value.y,
      zoom: viewport.value.zoom,
    })
  }
})

// 3. Handle Connections
onConnect((params) => {
  if (params.source && params.target) {
    const result = store.addEdge(params.source, params.target)
    if (result.success) toast.success('Connected!')
    else toast.error(result.error || 'Failed to connect skills')
  }
})

// 4. Handle Clicks
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
