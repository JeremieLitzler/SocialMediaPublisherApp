<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useArticleState } from '@/composables/useArticleState'
import { generateXContent } from '@/utils/xContentGenerator'

const router = useRouter()
const { extractionState } = useArticleState()

const article = computed(() => extractionState.value.article)

const chunks = computed(() => {
  if (!article.value) {
    return []
  }
  return generateXContent(article.value).chunks
})

const chunkCountLabel = computed(() => {
  const count = chunks.value.length
  return count === 1 ? '1 chunk to post' : `${count} chunks to post`
})

function startOver(): void {
  router.push('/')
}
</script>

<template>
  <div class="platform-x">
    <div v-if="!article" class="no-article">
      <p>No article loaded.</p>
      <RouterLink to="/">Go back to home</RouterLink>
    </div>

    <div v-if="article" class="content">
      <div class="header">
        <h2 class="text-2xl font-bold mb-2">X (Twitter)</h2>
        <p class="text-sm text-muted-foreground mb-4">{{ chunkCountLabel }}</p>
      </div>

      <div class="chunks space-y-4">
        <div
          v-for="(chunk, index) in chunks"
          :key="index"
          class="chunk border rounded-lg p-4"
        >
          <pre class="whitespace-pre-wrap text-sm mb-3">{{ chunk }}</pre>
          <CopyButton :text="chunk" label="Copy chunk" />
        </div>
      </div>

      <div class="mt-6">
        <Button variant="outline" @click="startOver">Start over</Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.space-y-4 > * + * {
  margin-top: 1rem;
}
</style>
