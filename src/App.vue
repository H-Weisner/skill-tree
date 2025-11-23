<script setup lang="ts">
import { useColorMode } from '@vueuse/core'
import { SkillTree } from '@/components/skill-tree'
import { Toaster } from '@/components/ui/toast'

useColorMode({
  selector: 'html',
  attribute: 'class',
  modes: {
    light: 'light',
    dark: 'dark',
    auto: 'auto',
  },
})
</script>

<template>
  <div class="w-full h-screen">
    <Toaster />
    <SkillTree />
  </div>
</template>
