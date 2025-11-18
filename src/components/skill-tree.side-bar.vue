<script setup lang="ts">
import { Plus } from 'lucide-vue-next'
import { ref } from 'vue'

const isDragging = ref(false)

const handleDragStart = (e: DragEvent) => {
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('application/vueflow', 'skill-node')
    isDragging.value = true
  }
}

const handleDragEnd = () => {
  isDragging.value = false
}
</script>

<template>
  <div
    class="w-64 bg-card border-r border-border p-4 flex flex-col gap-4 h-full overflow-y-auto text-card-foreground"
  >
    <div class="flex items-center justify-between mb-2">
      <h2 class="text-lg font-bold">Skill Tree</h2>
    </div>

    <div class="space-y-2">
      <div
        draggable="true"
        @dragstart="handleDragStart"
        @dragend="handleDragEnd"
        :class="[
          'p-3 bg-background border-2 border-dashed border-border rounded-lg cursor-move transition-all hover:border-primary hover:bg-primary/10',
          isDragging && 'opacity-50',
        ]"
      >
        <div class="flex items-center gap-2 text-foreground">
          <Plus class="w-5 h-5" />
          <span class="font-medium">Drag to add skill</span>
        </div>
        <p class="text-xs text-muted-foreground mt-1">Drop on canvas to create a new skill node</p>
      </div>
    </div>

    <div class="mt-4 pt-4 border-t border-border">
      <h3 class="text-sm font-semibold mb-2">Instructions</h3>
      <ul class="text-xs text-muted-foreground space-y-1">
        <li>• Drag "Drag to add skill" to canvas</li>
        <li>• Connect nodes to create prerequisites</li>
        <li>• Click nodes to unlock (if prerequisites met)</li>
        <li>• Green = unlocked, Gray = locked</li>
      </ul>
    </div>
  </div>
</template>
