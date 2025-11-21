<script setup lang="ts">
import { useSkillTreeStore } from '@/stores/skill-tree.store'
import { Trash2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

const store = useSkillTreeStore()
const handleDeleteAll = () => {
  if (confirm('Are you sure you want to delete all skills from the tree?')) {
    store.deleteAllNodes()
  }
}
</script>

<template>
  <Button variant="ghost" size="sm" :disabled="store.nodes.length === 0" @click="handleDeleteAll">
    <Trash2 class="w-4 h-4" />
    Delete All
  </Button>
</template>
