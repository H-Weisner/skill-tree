<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useSpring, useTransform, type SpringOptions } from 'motion-v'
import type { MotionValue } from 'motion-v'
import type { NodeType } from '@/constants'

export type SkillItem = {
  id: string
  label: string
  type: NodeType
}

const props = defineProps<{
  item: SkillItem
  mouseX: MotionValue<number>
  spring: SpringOptions
  distance: number
  baseWidth: number
  baseHeight: number
  magnification: number
  onDragStart: (e: DragEvent, type: SkillItem['type']) => void
}>()

const itemRef = ref<HTMLDivElement>()

// Animation taken from https://vue-bits.dev/components/dock
const mouseDistance = useTransform(props.mouseX, (val: number) => {
  const rect = itemRef.value?.getBoundingClientRect() ?? { x: 0, width: props.baseWidth }
  return val - rect.x - props.baseWidth / 2
})

const scaleLevel = useTransform(
  mouseDistance,
  [-props.distance, 0, props.distance],
  [1, props.magnification, 1],
)

const scale = useSpring(scaleLevel, props.spring)
const width = useTransform(scale, (s) => props.baseWidth * s)
const height = useTransform(scale, (s) => props.baseHeight * s)

const currentWidth = ref(props.baseWidth)
const currentHeight = ref(props.baseHeight)
const currentScale = ref(1)

let unsubWidth: () => void, unsubHeight: () => void, unsubScale: () => void

// Annoying vue thing to keep track of vars on mount and unmount
onMounted(() => {
  unsubWidth = width.on('change', (v) => (currentWidth.value = v))
  unsubHeight = height.on('change', (v) => (currentHeight.value = v))
  unsubScale = scale.on('change', (v) => (currentScale.value = v))
})

onUnmounted(() => {
  unsubWidth?.()
  unsubHeight?.()
  unsubScale?.()
})

const handleMouseDown = (e: MouseEvent) => {
  // To prevent parent mousemove from interfering with drag
  e.stopPropagation()
}

const handleDragStart = (e: DragEvent) => {
  props.onDragStart(e, props.item.type)
}
</script>

<template>
  <div
    ref="itemRef"
    :draggable="true"
    @mousedown="handleMouseDown"
    @dragstart="handleDragStart"
    class="relative flex flex-col items-center justify-center shrink-0 cursor-grab active:cursor-grabbing rounded-lg border-2 border-border bg-card text-card-foreground shadow-lg transition-colors hover:border-primary/50 overflow-hidden select-none bg-clip-padding"
    :style="{
      width: `${currentWidth}px`,
      height: `${currentHeight}px`,
    }"
  >
    <div
      v-if="item.type !== 'start'"
      class="absolute top-0 w-6 h-1 rounded-b-sm bg-chart-5 opacity-80"
    />

    <span
      :style="{
        fontSize: `${Math.max(0.75, currentScale * 0.75)}rem`,
      }"
      class="font-bold z-10 px-2 text-center leading-none"
    >
      {{ item.label }}
    </span>
    <div
      v-if="item.type !== 'capstone'"
      class="absolute bottom-0 w-6 h-1 rounded-t-sm bg-chart-5 opacity-80"
    />
  </div>
</template>
