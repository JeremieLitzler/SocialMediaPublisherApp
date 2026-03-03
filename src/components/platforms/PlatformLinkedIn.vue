<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useArticleState } from '@/composables/useArticleState'
import { generateLinkedInContent } from '@/utils/linkedInContentGenerator'

const router = useRouter()
const { extractionState, resetState } = useArticleState()

const article = computed(() => extractionState.value.article)

const body = computed(() => {
  if (!article.value) {
    return ''
  }
  return generateLinkedInContent(article.value).body
})

function startOver(): void {
  resetState()
  router.push('/')
}
</script>

<template>
  <div class="platform-linkedin">
    <div v-if="!article" class="no-article">
      <p>No article loaded.</p>
      <RouterLink to="/">Go back to home</RouterLink>
    </div>

    <div v-if="article" class="content">
      <div class="header">
        <h2 class="text-2xl font-bold mb-2">LinkedIn</h2>
      </div>

      <div class="body-block border rounded-lg p-4">
        <pre class="whitespace-pre-wrap text-sm mb-3">{{ body }}</pre>
        <CopyButton :text="body" label="Copy" />
      </div>

      <div class="mt-6">
        <Button variant="outline" @click="startOver">Start over</Button>
      </div>
    </div>
  </div>
</template>
