<template>
  <div class="manual-introduction">
    <div class="space-y-4">
      <div class="text-sm text-muted-foreground">
        <p class="font-medium text-foreground mb-2">Missing Introduction</p>
        <p>{{ extractionState.error }}</p>
        <p class="mt-2">Please add an introduction to the source article, or enter it manually below:</p>
      </div>

      <div>
        <label for="manual-intro" class="block text-sm font-medium mb-2">Manual Introduction</label>
        <Textarea
          id="manual-intro"
          v-model="extractionState.manualIntroduction"
          placeholder="Enter the article introduction here..."
          rows="6"
        />
      </div>

      <Button @click="handleContinue" :disabled="!canContinue" class="w-full">
        Continue with Manual Introduction
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useArticleState } from '@/composables/useArticleState'

const { extractionState } = useArticleState()

const canContinue = computed(() => {
  return extractionState.value.manualIntroduction.trim() !== ''
})

function handleContinue() {
  if (!canContinue.value) return

  // Update status to success and use manual introduction
  // This will be handled by platform components later
  extractionState.value.status = 'success'
}
</script>

<style scoped>
.space-y-4 > * + * {
  margin-top: 1rem;
}
</style>
