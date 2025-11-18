<script setup lang="ts">
import SkillTreeBuilder from './components/skill-tree.vue'
import { Toaster } from './components/ui/toast'
import { useTheme } from './composables/useTheme'

useTheme()
</script>

<template>
  <div>
    <main class="w-full h-full">
      <Toaster />
    </main>
    <SkillTreeBuilder />
  </div>
</template>
