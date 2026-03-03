<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import DOMPurify from 'dompurify'
import { useArticleState } from '@/composables/useArticleState'
import { generateMediumContent } from '@/utils/mediumContentGenerator'

const router = useRouter()
const { extractionState, resetState } = useArticleState()

const article = computed(() => extractionState.value.article)

const content = computed(() => {
  if (!article.value) return null
  return generateMediumContent(article.value)
})

const rawBodyHtml = ref('')

watch(
  () => content.value?.bodyHtml,
  (html) => { rawBodyHtml.value = html ?? '' },
  { immediate: true },
)

const sanitizedBodyHtml = computed(() => DOMPurify.sanitize(rawBodyHtml.value))

const renderedCopied = ref(false)

async function writeHtmlToClipboard(html: string): Promise<void> {
  const blob = new Blob([html], { type: 'text/html' })
  await navigator.clipboard.write([new ClipboardItem({ 'text/html': blob })])
}

async function markCopied(): Promise<void> {
  renderedCopied.value = true
  setTimeout(() => { renderedCopied.value = false }, 2000)
}

async function copyRenderedHtml(): Promise<void> {
  try {
    await writeHtmlToClipboard(sanitizedBodyHtml.value)
  } catch {
    await navigator.clipboard.writeText(sanitizedBodyHtml.value)
  }
  await markCopied()
}

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
          <p class="text-sm mb-2">{{ content.title }}</p>
          <CopyButton :text="content.title" label="Copy" />
        </div>

        <div class="field-row">
          <p class="font-semibold mb-1">Description</p>
          <p class="text-sm mb-2">{{ content.description }}</p>
          <CopyButton :text="content.description" label="Copy" />
        </div>

        <div class="field-row">
          <p class="font-semibold mb-1">Image alt text</p>
          <p class="text-sm mb-2">{{ content.imageAlt }}</p>
          <CopyButton :text="content.imageAlt" label="Copy" />
        </div>

        <div class="field-row">
          <p class="font-semibold mb-1">Image caption</p>
          <span v-if="!content.imageCaption" class="text-muted-foreground text-sm">None</span>
          <template v-else>
            <p class="text-sm mb-2">{{ content.imageCaption }}</p>
            <CopyButton :text="content.imageCaption" label="Copy" />
          </template>
        </div>

        <div class="field-row">
          <p class="font-semibold mb-1">Canonical URL</p>
          <p class="text-sm mb-2">{{ content.canonicalUrl }}</p>
          <CopyButton :text="content.canonicalUrl" label="Copy" />
        </div>

        <div class="field-row">
          <p class="font-semibold mb-1">Category</p>
          <p class="text-sm mb-2">{{ content.category }}</p>
          <CopyButton :text="content.category" label="Copy" />
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
            v-model="rawBodyHtml"
            class="w-full h-64 text-sm font-mono border rounded p-2 resize-y"
          />
          <div
            v-html="sanitizedBodyHtml"
            class="body-preview border rounded p-4 mt-2 prose max-w-none text-sm"
          />
          <Button @click="copyRenderedHtml">{{ renderedCopied ? 'Copied!' : 'Copy' }}</Button>
        </div>
      </div>

      <div class="mt-6">
        <Button variant="outline" @click="startOver">Start over</Button>
      </div>
    </div>
  </div>
</template>
