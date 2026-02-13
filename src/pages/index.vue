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

      <!-- Success State (Platform content will be shown here in next task) -->
      <div v-if="extractionState.status === 'success'" class="space-y-4">
        <div class="border rounded-lg p-6 bg-green-50">
          <p class="text-green-700 font-medium">✓ Article extracted successfully!</p>
          <p class="text-sm text-green-600 mt-2">{{ extractionState.article?.title }}</p>
        </div>

        <!-- Platform-specific content will be added in next task -->
        <p class="text-sm text-muted-foreground text-center">
          Platform content generation coming in next task...
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useArticleState } from '@/composables/useArticleState'
import ArticleInput from '@/components/article/ArticleInput.vue'
import ManualIntroduction from '@/components/article/ManualIntroduction.vue'

const { extractionState } = useArticleState()
</script>

<style scoped>
.space-y-6 > * + * {
  margin-top: 1.5rem;
}

.space-y-4 > * + * {
  margin-top: 1rem;
}
</style>
