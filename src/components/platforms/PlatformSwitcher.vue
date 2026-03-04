<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useArticleState } from '@/composables/useArticleState'
import type { Platform } from '@/types/article'
import { RouterPathEnum } from '@/types/RouterPathEnum'

const props = defineProps<{
  currentPlatform: Platform
}>()

const router = useRouter()
const { extractionState } = useArticleState()

const platformRoutes: Record<Platform, RouterPathEnum> = {
  X: RouterPathEnum.X,
  LinkedIn: RouterPathEnum.LinkedIn,
  Medium: RouterPathEnum.Medium,
  Substack: RouterPathEnum.Substack,
}

const allPlatforms: Platform[] = ['X', 'LinkedIn', 'Medium', 'Substack']

const otherPlatforms = computed(() =>
  allPlatforms.filter((platform) => platform !== props.currentPlatform),
)

function switchToPlatform(platform: Platform): void {
  extractionState.value.selectedPlatform = platform
  router.push(platformRoutes[platform])
}
</script>

<template>
  <div v-if="extractionState.article" class="platform-switcher mb-6">
    <h2 class="text-2xl font-bold mb-2">Share with another platform</h2>
    <div class="flex gap-2">
    <Button
      v-for="platform in otherPlatforms"
      :key="platform"
      variant="outline"
      @click="switchToPlatform(platform)"
    >
      {{ platform }}
    </Button>
    </div>
  </div>
</template>
