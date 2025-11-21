<script setup lang="ts">
import useDragAndDrop from './use-dnd'

const { onDragStart } = useDragAndDrop()
</script>

<template>
  <aside
    class="text-white font-bold border-gray-200 text-xs bg-sidebar-primary/80 backdrop-blur-md shadow-md shadow-black/30 sm:min-w-[25%] max-w-lg mx-auto absolute bottom-0 right-0 left-0 rounded-t-lg"
  >
    <div class="max-w-md p-4 mx-auto">
      <div class="mb-2 w-full text-center">You can drag these nodes to the pane.</div>

      <div class="nodes grid grid-cols-2 gap-2">
        <div
          class="cursor-grab px-4 py-3 rounded-lg border-2 shadow-lg min-w-[200px] transition-all bg-card text-card-foreground border-border"
          draggable="true"
          @dragstart="onDragStart($event, 'input')"
        >
          Skill Tree Start
        </div>

        <div
          class="cursor-grab px-4 py-3 rounded-lg border-2 shadow-lg min-w-[200px] transition-all bg-card text-card-foreground border-border"
          draggable="true"
          @dragstart="onDragStart($event, 'default')"
        >
          Regular Skill
        </div>

        <div
          class="cursor-grab px-4 py-3 rounded-lg border-2 shadow-lg min-w-[200px] transition-all bg-card text-card-foreground border-border col-span-2 justify-self-center"
          draggable="true"
          @dragstart="onDragStart($event, 'output')"
        >
          Capstone Skill
        </div>
      </div>
    </div>
  </aside>
</template>
