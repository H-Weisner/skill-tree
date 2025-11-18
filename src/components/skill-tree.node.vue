<script setup lang="ts">
import { computed } from 'vue'
import { Handle, Position, type NodeProps } from '@vue-flow/core'
import type { SkillNodeData } from '@/stores/skill-tree.store'
import { Lock, Unlock } from 'lucide-vue-next'

interface Props extends NodeProps {
  data: SkillNodeData
}

const props = defineProps<Props>()

const nodeClasses = computed(() => {
  const base =
    'px-4 py-3 rounded-lg border-2 shadow-lg min-w-[200px] transition-all bg-card text-card-foreground'
  if (props.data.unlocked) {
    return `${base} border-secondary bg-secondary/20 text-secondary-foreground`
  }
  return `${base} border-border bg-muted text-muted-foreground opacity-90`
})

const iconClasses = computed(() => {
  return props.data.unlocked ? 'text-secondary-foreground' : 'text-muted-foreground'
})
</script>

<template>
  <div :class="nodeClasses">
    <Handle type="target" :position="Position.Top" class="bg-blue-500!" />

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

    <Handle type="source" :position="Position.Bottom" class="bg-blue-500!" />
  </div>
</template>
