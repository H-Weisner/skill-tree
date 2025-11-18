<script setup lang="ts">
import { ref } from 'vue'
import { useSkillTreeStore } from '@/stores/skill-tree.store'
import Button from './ui/button/button.vue'
import { Field, FieldLabel, FieldContent } from './ui/field'

const store = useSkillTreeStore()

const name = ref('')
const description = ref('')
const cost = ref<number | undefined>(undefined)
const level = ref<number | undefined>(undefined)

const handleReset = () => {
  name.value = ''
  description.value = ''
  cost.value = undefined
  level.value = undefined
}

const emit = defineEmits<{
  nodeAdded: [nodeId: string]
}>()

const handleSubmit = (e: Event) => {
  e.preventDefault()

  if (!name.value.trim()) {
    alert('Please enter a skill name')
    return
  }

  const nodeId = store.addNode({
    name: name.value.trim(),
    description: description.value.trim() || 'No description',
    cost: cost.value || undefined,
    level: level.value || undefined,
  })

  handleReset()

  emit('nodeAdded', nodeId)
}
</script>

<template>
  <form @submit="handleSubmit" class="space-y-4 p-4 text-foreground">
    <h2 class="text-xl font-bold mb-4">Add New Skill</h2>

    <Field>
      <FieldLabel for="name">Skill Name<span class="text-red-500">*</span> </FieldLabel>
      <FieldContent>
        <input
          id="name"
          v-model="name"
          type="text"
          required
          class="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="e.g., JavaScript Basics"
        />
      </FieldContent>
    </Field>

    <Field>
      <FieldLabel for="description">Description</FieldLabel>
      <FieldContent>
        <textarea
          id="description"
          v-model="description"
          rows="3"
          class="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Describe this skill..."
        />
      </FieldContent>
    </Field>

    <div class="grid grid-cols-2 gap-4">
      <Field>
        <FieldLabel for="cost">Cost (optional)</FieldLabel>
        <FieldContent>
          <input
            id="cost"
            v-model.number="cost"
            type="number"
            min="0"
            class="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="0"
          />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel for="level">Level (optional)</FieldLabel>
        <FieldContent>
          <input
            id="level"
            v-model.number="level"
            type="number"
            min="1"
            class="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="1"
          />
        </FieldContent>
      </Field>
    </div>

    <div class="flex gap-2 pt-4">
      <Button type="submit" class="flex-1"> Add Skill </Button>
      <Button type="button" variant="outline" @click="handleReset" class="flex-1">Reset</Button>
    </div>
  </form>
</template>
