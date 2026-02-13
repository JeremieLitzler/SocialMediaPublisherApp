<template>
  <div class="article-input">
    <div class="space-y-4">
      <div>
        <label for="article-url" class="block text-sm font-medium mb-2">Article URL</label>
        <Input
          id="article-url"
          v-model="url"
          type="url"
          placeholder="https://iamjeremie.me/post/..."
          :disabled="isLoading"
        />
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">Target Platform</label>
        <div class="flex gap-4">
          <label v-for="platform in platforms" :key="platform" class="flex items-center gap-2">
            <input
              type="radio"
              :value="platform"
              v-model="selectedPlatform"
              :disabled="isLoading"
              class="cursor-pointer"
            />
            <span>{{ platform }}</span>
          </label>
        </div>
      </div>

      <Button @click="handleExtract" :disabled="!canExtract" class="w-full">
        {{ isLoading ? 'Extracting...' : 'Extract Article' }}
      </Button>

      <div v-if="extractionState.error && extractionState.status === 'error'" class="text-destructive text-sm">
        {{ extractionState.error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useArticleState } from '@/composables/useArticleState'
import { useArticleExtractor } from '@/composables/useArticleExtractor'
import type { Platform } from '@/types/article'

const platforms: Platform[] = ['X', 'LinkedIn', 'Medium', 'Substack']

const url = ref('')
const selectedPlatform = ref<Platform>('X')

const { extractionState } = useArticleState()
const { extractArticle } = useArticleExtractor()

const isLoading = computed(() => extractionState.value.status === 'loading')

const canExtract = computed(() => {
  return url.value.trim() !== '' && !isLoading.value
})

async function handleExtract() {
  if (!canExtract.value) return
  await extractArticle(url.value.trim())
}
</script>

<style scoped>
.space-y-4 > * + * {
  margin-top: 1rem;
}
</style>
