<script setup lang="ts">
import { reactive, watch } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Field, FieldContent, FieldLabel } from '@/components/ui/field'
import type { SkillTypeName } from '@/constants'
import { toast } from 'vue-sonner'

const props = defineProps<{
  initialType: SkillTypeName | null
}>()

const emit = defineEmits<{
  submit: [data: { name: string; description: string; skillType: SkillTypeName }]
  cancel: []
}>()

const formData = reactive({
  name: '',
  description: '',
  skillType: 'Regular Skill' as SkillTypeName,
})

// Reset form when initialType changes (dialog opens)
watch(
  () => props.initialType,
  (newType) => {
    if (newType) {
      formData.skillType = newType
      formData.name = ''
      formData.description = ''
    }
  },
  { immediate: true },
)

const handleSubmit = (e: Event) => {
  e.preventDefault()
  if (!formData.name.trim()) {
    toast.error('Please enter a skill name')
    return
  }

  emit('submit', {
    name: formData.name.trim(),
    description: formData.description.trim() || '',
    skillType: formData.skillType,
  })
}
</script>

<template>
  <Badge variant="outline">{{ formData.skillType }}</Badge>
  <DialogTitle>Add New Skill</DialogTitle>
  <DialogDescription>Fill in the details for your new skill.</DialogDescription>

  <form @submit="handleSubmit" class="space-y-4 mt-4 text-foreground">
    <Field>
      <FieldLabel for="name">Skill Name<span class="text-red-500">*</span></FieldLabel>
      <FieldContent>
        <input
          id="name"
          v-model="formData.name"
          type="text"
          required
          class="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="e.g., Fire Ball"
        />
      </FieldContent>
    </Field>

    <Field>
      <FieldLabel for="description">Description</FieldLabel>
      <FieldContent>
        <textarea
          id="description"
          v-model="formData.description"
          rows="3"
          class="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Describe this skill..."
        />
      </FieldContent>
    </Field>

    <div class="flex gap-2 pt-4">
      <Button type="submit" class="flex-1">Add Skill</Button>
      <Button type="button" variant="outline" @click="emit('cancel')" class="flex-1">Cancel</Button>
    </div>
  </form>
</template>
