<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSnippets } from '@/composables/useSnippets'
import { sanitizeBodyHtml } from '@/utils/sanitize'
import type { SnippetKey } from '@/types/article'

// All values on this page come from IndexedDB or hardcoded defaults only.
// URL query parameters and route params are intentionally never read here
// (security-guidelines.md rule 5).

const { snippets, load, save, reset } = useSnippets()

// Local editable copies (two-way bound to inputs).
// Populated from snippets after load() resolves.
const local = ref({ ...snippets.value })

onMounted(async () => {
  await load()
  local.value = { ...snippets.value }
})

const saving = ref(false)
const saveError = ref<string | null>(null)
const savedKeys = ref<Set<SnippetKey>>(new Set())

async function saveAll(): Promise<void> {
  saving.value = true
  saveError.value = null
  savedKeys.value = new Set()
  try {
    const keys = Object.keys(local.value) as SnippetKey[]
    await Promise.all(
      keys.map(async (key) => {
        // Sanitize bodyHtml keys before persisting (security-guidelines.md rule 1).
        const value =
          key === 'EN_WHY_BODY_HTML' || key === 'FR_WHY_BODY_HTML'
            ? sanitizeBodyHtml(local.value[key])
            : local.value[key]
        await save(key, value)
        savedKeys.value.add(key)
      }),
    )
  } catch {
    saveError.value = 'Some values could not be saved. Please try again.'
  } finally {
    saving.value = false
  }
}

async function resetAll(): Promise<void> {
  saving.value = true
  saveError.value = null
  savedKeys.value = new Set()
  try {
    await reset()
    local.value = { ...snippets.value }
  } catch {
    saveError.value = 'Reset failed. Please try again.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="container mx-auto max-w-4xl p-6">
    <h1 class="text-3xl font-bold mb-2">Settings</h1>
    <p class="text-gray-600 mb-6">
      Customise the text snippets used when generating platform content. Values are saved to your
      browser and survive page reloads. Clearing your browser storage resets all values to defaults.
    </p>

    <!-- Save / Reset actions -->
    <div class="flex gap-4 mb-8">
      <Button :disabled="saving" @click="saveAll">
        {{ saving ? 'Saving…' : 'Save all' }}
      </Button>
      <Button variant="outline" :disabled="saving" @click="resetAll"> Reset to defaults </Button>
    </div>

    <div v-if="saveError" class="mb-4 p-3 border border-red-400 rounded text-red-600 text-sm">
      {{ saveError }}
    </div>

    <!-- ─── Substack section ──────────────────────────────────────────────── -->
    <section class="mb-10">
      <h2 class="text-xl font-semibold mb-4 border-b pb-2">Substack</h2>

      <div class="space-y-6">
        <div>
          <label class="block font-medium mb-1" for="EN_SUBSTACK_SHARE_BLOCK">
            EN — Share block sentence
          </label>
          <input
            id="EN_SUBSTACK_SHARE_BLOCK"
            v-model="local.EN_SUBSTACK_SHARE_BLOCK"
            type="text"
            class="w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label class="block font-medium mb-1" for="FR_SUBSTACK_SHARE_BLOCK">
            FR — Share block sentence
          </label>
          <input
            id="FR_SUBSTACK_SHARE_BLOCK"
            v-model="local.FR_SUBSTACK_SHARE_BLOCK"
            type="text"
            class="w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label class="block font-medium mb-1" for="EN_SUBSTACK_UTM_ANCHOR">
            EN — UTM link anchor text
          </label>
          <input
            id="EN_SUBSTACK_UTM_ANCHOR"
            v-model="local.EN_SUBSTACK_UTM_ANCHOR"
            type="text"
            class="w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label class="block font-medium mb-1" for="FR_SUBSTACK_UTM_ANCHOR">
            FR — UTM link anchor text
          </label>
          <input
            id="FR_SUBSTACK_UTM_ANCHOR"
            v-model="local.FR_SUBSTACK_UTM_ANCHOR"
            type="text"
            class="w-full border rounded px-3 py-2 text-sm"
          />
        </div>
      </div>
    </section>

    <!-- ─── Medium section ───────────────────────────────────────────────── -->
    <section class="mb-10">
      <h2 class="text-xl font-semibold mb-4 border-b pb-2">Medium</h2>

      <!-- EN group -->
      <h3 class="text-base font-medium mb-3 mt-4">English</h3>
      <div class="space-y-6">
        <div>
          <label class="block font-medium mb-1" for="EN_WHY_HEADING"> EN — "Why" heading </label>
          <input
            id="EN_WHY_HEADING"
            v-model="local.EN_WHY_HEADING"
            type="text"
            class="w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label class="block font-medium mb-1" for="EN_WHY_BODY_HTML">
            EN — "Why" body HTML
          </label>
          <textarea
            id="EN_WHY_BODY_HTML"
            v-model="local.EN_WHY_BODY_HTML"
            rows="6"
            class="w-full border rounded px-3 py-2 text-sm font-mono resize-y"
          />
        </div>
      </div>

      <!-- FR group -->
      <h3 class="text-base font-medium mb-3 mt-6">French</h3>
      <div class="space-y-6">
        <div>
          <label class="block font-medium mb-1" for="FR_WHY_HEADING"> FR — "Why" heading </label>
          <input
            id="FR_WHY_HEADING"
            v-model="local.FR_WHY_HEADING"
            type="text"
            class="w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label class="block font-medium mb-1" for="FR_WHY_BODY_HTML">
            FR — "Why" body HTML
          </label>
          <textarea
            id="FR_WHY_BODY_HTML"
            v-model="local.FR_WHY_BODY_HTML"
            rows="6"
            class="w-full border rounded px-3 py-2 text-sm font-mono resize-y"
          />
        </div>
      </div>
    </section>

    <!-- Save / Reset actions (repeated at bottom for long-form convenience) -->
    <div class="flex gap-4 mt-4">
      <Button :disabled="saving" @click="saveAll">
        {{ saving ? 'Saving…' : 'Save all' }}
      </Button>
      <Button variant="outline" :disabled="saving" @click="resetAll"> Reset to defaults </Button>
    </div>
  </div>
</template>
