<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'
import { Moon, Sun } from 'lucide-vue-next'
import Button from '../button/button.vue'

const { toggleTheme } = useTheme()
</script>

<template>
  <Button
    variant="ghost"
    size="icon"
    @click="toggleTheme"
    class="relative"
    aria-label="Toggle theme"
  >
    <Sun
      class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
    />
    <Moon
      class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
    />
    <span class="sr-only">Toggle theme</span>
  </Button>
</template>
