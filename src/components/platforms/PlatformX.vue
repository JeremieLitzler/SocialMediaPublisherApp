<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useArticleState } from '@/composables/useArticleState'
import { generateXContent } from '@/utils/xContentGenerator'

const router = useRouter()
const { extractionState, resetState } = useArticleState()

const article = computed(() => extractionState.value.article)

watchEffect(() => {
  if (!article.value) router.replace('/')
})

const chunks = computed(() => {
  if (!article.value) {
    return []
  }
  return generateXContent(article.value).chunks
})

const oversizedCount = computed(() => chunks.value.filter((chunk) => chunk.oversized).length)

const chunkCountLabel = computed(() => {
  const total = chunks.value.length
  const oversized = oversizedCount.value
  const baseLabel = total === 1 ? '1 chunk to post' : `${total} chunks to post`

  if (oversized === 0) {
    return baseLabel
  }

  return `${baseLabel}, ${oversized} oversized`
})

function startOver(): void {
  resetState()
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
      <PlatformSwitcher current-platform="X" />

      <div class="header">
        <h2 class="text-2xl font-bold mb-2">X (Twitter)</h2>
        <p class="text-sm text-muted-foreground mb-4">{{ chunkCountLabel }}</p>
      </div>

      <div class="chunks space-y-4">
        <div
          v-for="(chunk, index) in chunks"
          :key="index"
          class="chunk border rounded-lg p-4"
          :class="{ 'border-orange-500': chunk.oversized }"
        >
          <pre class="whitespace-pre-wrap text-sm mb-3">{{ chunk.text }}</pre>
          <CopyButton :text="chunk.text" label="Copy chunk" />
          <p v-if="chunk.oversized" class="text-sm text-orange-600 mt-2">
            This chunk exceeds 280 characters and could not be split. Consider adapting it before posting.
          </p>
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
