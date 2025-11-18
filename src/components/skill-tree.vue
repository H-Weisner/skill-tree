<script setup lang="ts">
import { useSkillTreeStore } from '@/stores/skill-tree.store'
import { RotateCcw, Save, Trash2 } from 'lucide-vue-next'
import { ref } from 'vue'
import SkillTreeCanvas from './skill-tree.canvas.vue'
import SkillForm from './skill-tree.node.form.vue'
import SkillSidebar from './skill-tree.side-bar.vue'
import Button from './ui/button/button.vue'
import { Dialog, DialogScrollContent } from './ui/dialog'
import { ThemeToggle } from './ui/theme-toggle'

const store = useSkillTreeStore()
const showForm = ref(false)

const handleAddNode = () => {
  showForm.value = true
}

const handleNodeAdded = () => {
  showForm.value = false
}

const handleReset = () => {
  if (confirm('Are you sure you want to reset all unlocked skills?')) {
    store.resetAll()
  }
}

const handleDeleteAll = () => {
  if (confirm('Are you sure you want to delete all skills from the tree?')) {
    store.deleteAllNodes()
  }
}
</script>

<template>
  <div class="flex h-screen w-full bg-background text-foreground">
    <SkillSidebar @add-node="handleAddNode" />
    <div class="flex-1 flex flex-col relative">
      <div
        class="bg-card border-b border-border px-4 py-2 flex items-center justify-between shadow-sm z-10 text-card-foreground"
      >
        <h1 class="text-xl font-bold">Wizard Skill Tree</h1>
        <div class="flex gap-2">
          <Button variant="outline" size="sm" @click="handleDeleteAll">
            <Trash2 class="w-4 h-4" />
            Delete All
          </Button>
          <Button variant="outline" size="sm" @click="handleReset">
            <RotateCcw class="w-4 h-4" />
            Reset All
          </Button>
          <Button variant="outline" size="sm" @click="store.saveToLocalStorage">
            <Save class="w-4 h-4" />
            Save
          </Button>
          <ThemeToggle />
        </div>
      </div>

      <div class="flex-1 relative overflow-hidden">
        <SkillTreeCanvas @show-form="handleAddNode" />
      </div>
    </div>

    <Dialog v-model:open="showForm">
      <DialogScrollContent class="max-w-md">
        <SkillForm @node-added="handleNodeAdded" />
      </DialogScrollContent>
    </Dialog>
  </div>
</template>
