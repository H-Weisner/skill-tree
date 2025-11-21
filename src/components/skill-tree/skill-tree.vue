<script setup lang="ts">
import { ref } from 'vue'
import { Dialog, DialogScrollContent } from '../ui/dialog'
import SkillTreeCanvas from './skill-tree.canvas.vue'
import Header from './skill-tree.header/header.vue'
import SkillBar from './skill-tree.skill-bar.vue'
import SkillForm from './skill-tree.skill-form.vue'
import useDragAndDrop from './use-dnd'

const showForm = ref(false)
const { createNodeFromPendingDrop, cancelPendingDrop, getPendingDropSkillType } = useDragAndDrop()

const handleAddNode = () => {
  showForm.value = true
}

const handleNodeAdded = () => {
  showForm.value = false
}

const handleFormCancel = () => {
  cancelPendingDrop()
  showForm.value = false
}
</script>

<template>
  <div class="flex h-screen w-full bg-background text-foreground">
    <div class="flex-1 flex flex-col relative">
      <Header />
      <div class="flex-1 relative overflow-hidden">
        <SkillTreeCanvas @show-form="handleAddNode" />
      </div>
      <SkillBar />
    </div>

    <Dialog v-model:open="showForm">
      <DialogScrollContent class="max-w-md">
        <SkillForm
          @node-added="handleNodeAdded"
          @cancel="handleFormCancel"
          :create-node="createNodeFromPendingDrop"
          :default-skill-type="getPendingDropSkillType()"
        />
      </DialogScrollContent>
    </Dialog>
  </div>
</template>
