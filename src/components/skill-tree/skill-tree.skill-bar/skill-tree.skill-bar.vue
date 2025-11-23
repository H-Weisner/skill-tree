<script setup lang="ts">
import { useMotionValue, type SpringOptions } from 'motion-v'
import useDragAndDrop from '../use-dnd'
import SkillDockItem, { type SkillItem } from './skill-tree.skill-bar-item.vue'
import { NODE_TYPES, SKILL_TYPES } from '@/constants'

const props = withDefaults(
  defineProps<{
    distance?: number
    panelHeight?: number
    baseWidth?: number
    baseHeight?: number
    magnification?: number
    spring?: SpringOptions
  }>(),
  {
    distance: 140,
    panelHeight: 80,
    baseWidth: 150,
    baseHeight: 54,
    magnification: 1.2,
    spring: () => ({ mass: 0.1, stiffness: 150, damping: 12 }),
  },
)

const { onDragStart, isDragOver } = useDragAndDrop()

const skills: SkillItem[] = [
  { id: 'start', label: SKILL_TYPES.START, type: NODE_TYPES.START },
  { id: 'regular', label: SKILL_TYPES.REGULAR, type: NODE_TYPES.REGULAR },
  { id: 'capstone', label: SKILL_TYPES.CAPSTONE, type: NODE_TYPES.CAPSTONE },
]

// Animation taken from https://vue-bits.dev/components/dock
const mouseX = useMotionValue(Infinity)

const handleMouseMove = (event: MouseEvent) => {
  mouseX.set(event.pageX)
}

const handleMouseLeave = () => {
  mouseX.set(Infinity)
}
</script>

<template>
  <div
    class="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
  >
    <div
      class="text-xs font-medium text-muted-foreground bg-background/80 px-3 py-1 rounded-full border border-border backdrop-blur-sm mb-2 shadow-sm transition-opacity duration-200"
    >
      {{ isDragOver ? 'Drop here' : 'Drag to add skills' }}
    </div>

    <div
      class="flex items-end gap-3 rounded-2xl border border-border bg-background/80 backdrop-blur-xl px-4 pb-3 pt-3 shadow-2xl"
    >
      <SkillDockItem
        v-for="skill in skills"
        :key="skill.id"
        :item="skill"
        :mouseX="mouseX"
        :spring="props.spring"
        :distance="props.distance"
        :baseWidth="props.baseWidth"
        :baseHeight="props.baseHeight"
        :magnification="props.magnification"
        :onDragStart="onDragStart"
      />
    </div>
  </div>
</template>
