<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Field, FieldContent, FieldLabel } from '@/components/ui/field'
import { Badge } from '@/components/ui/badge'
import { useSkillTreeStore, type SkillType } from '@/stores/skill-tree.store'

const props = defineProps<{
  createNode?: (data: {
    name: string
    description: string
    cost?: number
    level?: number
    skillType: SkillType
  }) => string | null
}>()

const store = useSkillTreeStore()

const emit = defineEmits<{
  nodeAdded: [nodeId: string]
  cancel: []
}>()

// Computed properties to safely access currentNode (form should only show when currentNode exists)
const currentNode = computed(() => {
  if (!store.currentNode) {
    // Return default values if currentNode is null (shouldn't happen when form is shown)
    return {
      name: '',
      description: '',
      cost: undefined,
      level: undefined,
      skillType: 'regular' as SkillType,
      unlocked: false,
    }
  }
  return store.currentNode
})

const handleSubmit = (e: Event) => {
  e.preventDefault()

  if (!currentNode.value.name.trim()) {
    alert('Please enter a skill name')
    return
  }

  // Use createNodeFromPendingDrop if available (from drag and drop), otherwise use store
  let nodeId: string | null = null

  if (props.createNode) {
    nodeId = props.createNode({
      name: currentNode.value.name.trim(),
      description: currentNode.value.description.trim() || 'No description',
      cost: currentNode.value.cost || undefined,
      level: currentNode.value.level || undefined,
      skillType: currentNode.value.skillType,
    })
  }

  if (nodeId) {
    emit('nodeAdded', nodeId)
  }
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<template>
  <form v-if="currentNode" @submit="handleSubmit" class="space-y-4 p-4 text-foreground">
    <Badge variant="outline">{{ currentNode.skillType }}</Badge>
    <h2 class="text-xl font-bold mb-4">Add New Skill</h2>
    <Field>
      <FieldLabel for="name">Skill Name<span class="text-red-500">*</span> </FieldLabel>
      <FieldContent>
        <input
          id="name"
          v-model="currentNode.name"
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
          v-model="currentNode.description"
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
            v-model.number="currentNode.cost"
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
            v-model.number="currentNode.level"
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
      <Button type="button" variant="outline" @click="handleCancel" class="flex-1">Cancel</Button>
    </div>
  </form>
</template>
