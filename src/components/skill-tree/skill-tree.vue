<script setup lang="ts">
import { ref } from 'vue'
import { Dialog, DialogScrollContent } from '@/components/ui/dialog'
import SkillTreeCanvas from './skill-tree.canvas.vue'
import Header from './skill-tree.header/header.vue'
import { SkillBar } from './skill-tree.skill-bar'
import SkillForm from './skill-tree.skill-form.vue'
import useDragAndDrop from './use-dnd'
import { useSkillTreeStore } from '@/stores/skill-tree.store'
import type { SkillTypeName } from '@/constants'
import { toast } from 'vue-sonner'

const store = useSkillTreeStore()
const { pendingDrop, cancelPendingDrop } = useDragAndDrop()
const showForm = ref(false)

const handleShowForm = () => {
  showForm.value = true
}

const handleFormSubmit = (formData: {
  name: string
  description: string
  skillType: SkillTypeName
}) => {
  if (!pendingDrop.value) return

  store.addNode(formData, pendingDrop.value.flowType, pendingDrop.value.position)

  cancelPendingDrop()
  showForm.value = false
}

const handleFormCancel = () => {
  cancelPendingDrop()
  showForm.value = false
}
// toast that warns user that dark mode is nicer because of grab cursor being hard to see in light mode
toast.info('Dark mode is recommended - the grab cursor is hard to see in light mode')
</script>

<template>
  <div class="flex h-screen w-full bg-background text-foreground">
    <div class="flex-1 flex flex-col relative">
      <Header />
      <div class="flex-1 relative overflow-hidden">
        <SkillTreeCanvas @show-form="handleShowForm" />
      </div>
      <SkillBar />
    </div>

    <Dialog v-model:open="showForm">
      <DialogScrollContent class="max-w-sm">
        <SkillForm
          v-if="pendingDrop"
          :initial-type="pendingDrop.skillType"
          @submit="handleFormSubmit"
          @cancel="handleFormCancel"
        />
      </DialogScrollContent>
    </Dialog>
  </div>
</template>
