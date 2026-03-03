<template>
  <div class="container mx-auto max-w-4xl p-6">
    <h1 class="text-3xl font-bold mb-6">Social Media Sharing Assistant</h1>

    <div class="space-y-6">
      <!-- Article Input Section -->
      <div v-if="extractionState.status !== 'success'" class="border rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4">Extract Article Content</h2>
        <ArticleInput />
      </div>

      <!-- Manual Introduction Section -->
      <div
        v-if="extractionState.status === 'missing-introduction'"
        class="border border-yellow-500 rounded-lg p-6"
      >
        <ManualIntroduction />
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { useArticleState } from '@/composables/useArticleState'

const { extractionState } = useArticleState()
</script>

<style scoped>
.space-y-6 > * + * {
  margin-top: 1.5rem;
}
</style>
