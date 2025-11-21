<script setup lang="ts">
import { useColorMode } from '@vueuse/core'
import { SkillTree } from '@/components/skill-tree'
import { Toaster } from './components/ui/toast'

// Initialize color mode early to prevent flash
useColorMode({
  selector: 'html',
  attribute: 'class',
  modes: {
    light: '',
    dark: 'dark',
    auto: '',
  },
})
</script>

<template>
  <div>
    <main class="w-full h-full">
      <Toaster />
    </main>
    <SkillTree />
  </div>
</template>
