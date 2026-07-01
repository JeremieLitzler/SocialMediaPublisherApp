<template>
  <div class="manual-introduction">
    <div class="space-y-4">
      <div class="text-sm text-muted-foreground">
        <p class="font-medium text-foreground mb-2">Introduction Not Detected</p>
        <p>{{ extractionState.error }}</p>
      </div>

      <template v-if="canEnterManually">
        <p class="text-sm text-muted-foreground">
          The rest of the article was read. Enter the introduction below to continue, or add one to
          the source before the first &lt;h2&gt;.
        </p>

        <div>
          <label for="manual-intro" class="block text-sm font-medium mb-2">
            Manual Introduction
          </label>
          <textarea
            id="manual-intro"
            v-model="extractionState.manualIntroduction"
            placeholder="Enter the article introduction here..."
            rows="6"
            :maxlength="MAX_MANUAL_INTRODUCTION_LENGTH"
            class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <Button @click="handleContinue" :disabled="!canContinue" class="w-full">
          Continue with Manual Introduction
        </Button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useArticleState } from '@/composables/useArticleState'
import type { Article, Platform } from '@/types/article'
import { RouterPathEnum } from '@/types/RouterPathEnum'
import {
  MAX_MANUAL_INTRODUCTION_LENGTH,
  hasVisibleCharacter,
  toIntroductionHtml,
} from '@/utils/manualIntroduction'

const router = useRouter()
const { extractionState } = useArticleState()

const platformRoutes: Record<Platform, string> = {
  X: RouterPathEnum.X,
  LinkedIn: RouterPathEnum.LinkedIn,
  Medium: RouterPathEnum.Medium,
  Substack: RouterPathEnum.Substack,
}

// EMPTY retains the article, so manual entry is offered (R3). NO_HEADING
// discards it (article === null), so only the source-fix instruction shows (R4).
const canEnterManually = computed(() => extractionState.value.article !== null)

const canContinue = computed(
  () => canEnterManually.value && hasVisibleCharacter(extractionState.value.manualIntroduction),
)

function completeRetainedArticle(article: Article): void {
  article.introduction = toIntroductionHtml(extractionState.value.manualIntroduction)
  extractionState.value.status = 'success'
}

function openSelectedPlatform(): void {
  const platform = extractionState.value.selectedPlatform ?? 'X'
  router.push(platformRoutes[platform])
}

function handleContinue(): void {
  if (!canContinue.value) return
  const article = extractionState.value.article
  if (!article) return
  completeRetainedArticle(article)
  openSelectedPlatform()
}
</script>

<style scoped>
.space-y-4 > * + * {
  margin-top: 1rem;
}
</style>
