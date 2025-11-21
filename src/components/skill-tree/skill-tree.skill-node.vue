<script setup lang="ts">
import type { SkillNodeData } from '@/stores/skill-tree.store'
import { Handle, Position, type NodeProps } from '@vue-flow/core'
import { Lock, Unlock } from 'lucide-vue-next'
import { computed } from 'vue'

interface Props extends NodeProps {
  data: SkillNodeData
}

const props = defineProps<Props>()

// Map VueFlow node type to handle behavior
// VueFlow node type comes from props.type (set when node is created)
// 'start' -> 'input' behavior (no target handle)
// 'capstone' -> 'output' behavior (no source handle)
// 'regular' -> 'default' behavior (both handles)
const handleType = computed<'input' | 'output' | 'default'>(() => {
  // Use the VueFlow node type (props.type) which is 'start', 'regular', or 'capstone'
  const nodeType = props.type as 'start' | 'regular' | 'capstone'
  switch (nodeType) {
    case 'start':
      return 'input'
    case 'capstone':
      return 'output'
    case 'regular':
    default:
      return 'default'
  }
})

const nodeClasses = computed(() => {
  const base =
    'px-4 py-3 rounded-lg border-2 shadow-lg min-w-[200px] transition-all bg-card text-card-foreground'
  if (props.data.unlocked) {
    return `${base} border-secondary bg-secondary text-secondary-foreground`
  }
  return `${base} border-border bg-muted text-muted-foreground opacity-50`
})

const iconClasses = computed(() => {
  return props.data.unlocked ? 'text-secondary-foreground' : 'text-muted-foreground'
})
</script>

<template>
  <div :class="nodeClasses">
    <Handle
      v-if="handleType !== 'input'"
      type="target"
      :position="Position.Top"
      class="bg-green-500!"
    />

    <div class="flex items-start gap-2">
      <component
        :is="data.unlocked ? Unlock : Lock"
        :class="['w-5 h-5 shrink-0 mt-0.5', iconClasses]"
      />
      <div class="flex-1">
        <h3 class="font-bold text-lg mb-1">{{ data.name }}</h3>
        <p class="text-sm mb-2">{{ data.description }}</p>
        <div v-if="data.cost || data.level" class="flex gap-3 text-xs text-foreground/80">
          <span v-if="data.cost" class="font-semibold">Cost: {{ data.cost }}</span>
          <span v-if="data.level" class="font-semibold">Level: {{ data.level }}</span>
        </div>
      </div>
    </div>

    <Handle
      v-if="handleType !== 'output'"
      type="source"
      :position="Position.Bottom"
      class="bg-blue-500!"
    />
  </div>
</template>
