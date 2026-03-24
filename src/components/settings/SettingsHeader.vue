<script setup lang="ts">
defineProps<{ saving: boolean; loading?: boolean }>()
const emit = defineEmits<{
  save: []
  reset: []
}>()
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold mb-2">Settings</h1>
    <p class="text-gray-600 mb-6">
      Customise the text snippets used when generating platform content. Values are saved to your
      browser and survive page reloads. Clearing your browser storage resets all values to defaults.
    </p>

    <!-- Save / Reset actions -->
    <div class="flex gap-4 mb-8">
      <Button :disabled="saving || loading" @click="emit('save')">
        {{ saving ? 'Saving…' : loading ? 'Loading…' : 'Save all' }}
      </Button>
      <Button variant="outline" :disabled="saving || loading" @click="emit('reset')">
        Reset to defaults
      </Button>
    </div>
  </div>
</template>
