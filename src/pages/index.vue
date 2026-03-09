<template>
  <div class="container mx-auto max-w-4xl p-6">
    <h1 class="text-3xl font-bold mb-6 text-center">Social Media Sharing Assistant</h1>
    <p class="text-gray-600 mb-6">
      Paste a blog article URL to extract its content and generate ready-to-share posts for X,
      LinkedIn, Medium, and Substack — tailored for each platform.
    </p>
    <p>
      For more details on how to use this tool, see the
      <a
        href="https://github.com/JeremieLitzler/SocialMediaPublisherApp/blob/main/docs/specs/00-overview.md"
        target="_blank"
        rel="noreferrer"
        class="text-blue-500 hover:underline"
        >overview documentation</a
      >
      and
      <a
        href="https://github.com/JeremieLitzler/SocialMediaPublisherApp/blob/develop/docs/specs/01-requirements.md"
        target="_blank"
        rel="noreferrer"
        class="text-blue-500 hover:underline"
        >the intial requirements</a
      >.
    </p>
    <br class="my-4" />
    <div class="space-y-6">
      <!-- Article Input Section -->
      <div v-if="extractionState.status !== 'success'" class="border rounded-lg p-6">
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

const { extractionState, resetState } = useArticleState()

onMounted(() => {
  resetState()
})
</script>

<style scoped>
.space-y-6 > * + * {
  margin-top: 1.5rem;
}
</style>
