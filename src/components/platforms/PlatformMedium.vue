<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useArticleState } from '@/composables/useArticleState'
import { generateMediumContent } from '@/utils/mediumContentGenerator'

const router = useRouter()
const { extractionState, resetState } = useArticleState()

const article = computed(() => extractionState.value.article)

const content = computed(() => {
  if (!article.value) return null
  return generateMediumContent(article.value)
})

function startOver(): void {
  resetState()
  router.push('/')
}
</script>

<template>
  <div class="platform-medium">
    <div v-if="!article" class="no-article">
      <p>No article loaded.</p>
      <RouterLink to="/">Go back to home</RouterLink>
    </div>

    <div v-if="article && content" class="content">
      <div class="header">
        <h2 class="text-2xl font-bold mb-4">Medium</h2>
      </div>

      <div class="fields space-y-4">
        <div class="field-row">
          <p class="font-semibold mb-1">Title</p>
          <CopyButton :text="content.title" label="Copy title" />
        </div>

        <div class="field-row">
          <p class="font-semibold mb-1">Description</p>
          <CopyButton :text="content.description" label="Copy description" />
        </div>

        <div class="field-row">
          <p class="font-semibold mb-1">Image alt text</p>
          <CopyButton :text="content.imageAlt" label="Copy image alt" />
        </div>

        <div class="field-row">
          <p class="font-semibold mb-1">Image caption</p>
          <span v-if="!content.imageCaption" class="text-muted-foreground text-sm">None</span>
          <CopyButton v-else :text="content.imageCaption" label="Copy caption" />
        </div>

        <div class="field-row">
          <p class="font-semibold mb-1">Canonical URL</p>
          <CopyButton :text="content.canonicalUrl" label="Copy canonical URL" />
        </div>

        <div class="field-row">
          <p class="font-semibold mb-1">Category</p>
          <CopyButton :text="content.category" label="Copy category" />
        </div>

        <div class="field-row">
          <p class="font-semibold mb-1">Tags</p>
          <div class="flex flex-wrap gap-2">
            <CopyButton v-for="tag in content.tags" :key="tag" :text="tag" :label="tag" />
          </div>
        </div>

        <div class="field-row">
          <p class="font-semibold mb-1">Body HTML</p>
          <textarea
            class="w-full h-64 text-sm font-mono border rounded p-2 resize-y"
          >{{ content.bodyHtml }}</textarea>
          <CopyButton :text="content.bodyHtml" label="Copy body HTML" />
        </div>
      </div>

      <div class="mt-6">
        <Button variant="outline" @click="startOver">Start over</Button>
      </div>
    </div>
  </div>
</template>
