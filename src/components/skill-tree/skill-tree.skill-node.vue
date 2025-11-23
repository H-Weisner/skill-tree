<script setup lang="ts">
import { NODE_TYPES, type NodeType } from '@/constants'
import type { SkillNodeData } from '@/stores/skill-tree.store'
import { Handle, Position, type NodeProps } from '@vue-flow/core'
import { Lock, Unlock } from 'lucide-vue-next'
import { computed } from 'vue'

interface Props extends NodeProps {
  data: SkillNodeData
}

const props = defineProps<Props>()

const handleType = computed<'input' | 'output' | 'default'>(() => {
  const nodeType = props.type as NodeType
  switch (nodeType) {
    case NODE_TYPES.START:
      return 'input'
    case NODE_TYPES.CAPSTONE:
      return 'output'
    case NODE_TYPES.REGULAR:
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
      :connectable-start="false"
      :connectable-end="true"
      :position="Position.Top"
      class="bg-green-500! border-secondary-foreground!"
    />
    <div class="flex items-center gap-2">
      <div class="flex-1">
        <h3 class="font-bold text-lg">{{ data.name }}</h3>
        <p v-if="data.description" class="text-sm mt-1">{{ data.description }}</p>
      </div>
      <component
        :is="data.unlocked ? Unlock : Lock"
        :class="['w-5 h-5 shrink-0 mt-0.5', iconClasses]"
      />
    </div>
    <Handle
      v-if="handleType !== 'output'"
      type="source"
      :connectable-start="true"
      :connectable-end="false"
      :position="Position.Bottom"
      class="bg-blue-500! border-secondary-foreground!"
    />
  </div>
</template>
