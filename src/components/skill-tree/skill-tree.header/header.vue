<script setup lang="ts">
import WizardSvg from '@/assets/wizard.svg'
import { ThemeToggle } from '@/components/theme-toggle'
import HeaderDeleteAllButton from './header.delete-all-button.vue'
import HeaderResetButton from './header.reset-button.vue'
</script>

<template>
  <div
    class="bg-side-bar border-b border-border px-4 py-2 flex items-center justify-between shadow-sm z-10 text-card-foreground"
  >
    <div class="flex items-center gap-2">
      <h1 class="text-xl font-bold">Harry's Skill Tree</h1>
      <WizardSvg class="w-6 h-6 *:stroke-foreground" />
    </div>
    <div class="flex gap-2">
      <HeaderResetButton />
      <HeaderDeleteAllButton />
      <ThemeToggle />
    </div>
  </div>
</template>
