<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { useSkillTreeStore } from '@/stores/skill-tree.store'
import { RotateCcw } from 'lucide-vue-next'

const store = useSkillTreeStore()
const handleReset = () => {
  console.log('help')
  console.log('help getting unlocked nodes', store.unlockedNodes.length)
  if (confirm('Are you sure you want to reset all unlocked skills?')) {
    store.resetAll()
  }
}
</script>

<template>
  <Button
    variant="ghost"
    :disabled="store.unlockedNodes.length === 0"
    size="sm"
    @click="handleReset"
  >
    <RotateCcw class="w-4 h-4" />
    Reset All
  </Button>
</template>
