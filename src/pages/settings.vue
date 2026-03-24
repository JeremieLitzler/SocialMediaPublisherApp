<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSnippets } from '@/composables/useSnippets'
import { useIndexedDbError } from '@/composables/useIndexedDbError'
import { sanitizeBodyHtml } from '@/utils/sanitize'
import type { SnippetKey } from '@/types/article'

// All values on this page come from IndexedDB or hardcoded defaults only.
// URL query parameters and route params are intentionally never read here
// (security-guidelines.md rule 5).

const { snippets, load, save, reset } = useSnippets()
const { setError } = useIndexedDbError()

// Local editable copies (two-way bound to inputs).
// Populated from snippets after load() resolves — not initialised to defaults
// here to avoid the flicker caused by rendering defaults then overwriting with
// persisted values once IndexedDB responds.
const local = ref({ ...snippets.value })

// True while the initial IndexedDB load is in flight.
// Sections are hidden until loading is false so inputs render only once.
const loading = ref(true)

onMounted(async () => {
  try {
    await load()
  } catch {
    setError('Snippet settings could not be loaded from browser storage. Using defaults.')
  } finally {
    // Whether load() succeeded or threw, snapshots the current snippets (IDB
    // values on success, defaults on failure) into the local editable copy.
    local.value = { ...snippets.value }
    loading.value = false
  }
})

const saving = ref(false)
const saveError = ref<string | null>(null)
const saveSuccess = ref(false)
const savedKeys = ref<Set<SnippetKey>>(new Set())

let successTimer: ReturnType<typeof setTimeout> | null = null

function showSuccess(): void {
  saveSuccess.value = true
  if (successTimer !== null) clearTimeout(successTimer)
  successTimer = setTimeout(() => {
    saveSuccess.value = false
    successTimer = null
  }, 2000)
}

async function saveAll(): Promise<void> {
  saving.value = true
  saveError.value = null
  saveSuccess.value = false
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
    showSuccess()
  } catch {
    saveError.value = 'Some values could not be saved. Please try again.'
  } finally {
    saving.value = false
  }
}

async function resetAll(): Promise<void> {
  saving.value = true
  saveError.value = null
  saveSuccess.value = false
  savedKeys.value = new Set()
  try {
    await reset()
    local.value = { ...snippets.value }
    showSuccess()
  } catch {
    saveError.value = 'Reset failed. Please try again.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="container mx-auto max-w-4xl p-6">
    <SettingsHeader :loading="loading" :saving="saving" @save="saveAll" @reset="resetAll" />

    <div v-if="saveError" class="mb-4 p-3 border border-red-400 rounded text-red-600 text-sm">
      {{ saveError }}
    </div>

    <div
      v-if="saveSuccess"
      class="mb-4 p-3 border border-green-400 rounded bg-green-50 text-green-700 text-sm"
    >
      Settings saved successfully.
    </div>

    <template v-if="!loading">
      <!-- ─── Substack section ──────────────────────────────────────────────── -->
      <SettingsSubstackSection
        v-model:EN_SUBSTACK_SHARE_BLOCK="local.EN_SUBSTACK_SHARE_BLOCK"
        v-model:FR_SUBSTACK_SHARE_BLOCK="local.FR_SUBSTACK_SHARE_BLOCK"
        v-model:EN_SUBSTACK_UTM_ANCHOR="local.EN_SUBSTACK_UTM_ANCHOR"
        v-model:FR_SUBSTACK_UTM_ANCHOR="local.FR_SUBSTACK_UTM_ANCHOR"
      />

      <!-- ─── Medium section ───────────────────────────────────────────────── -->
      <SettingsMediumSection
        v-model:EN_WHY_HEADING="local.EN_WHY_HEADING"
        v-model:EN_WHY_BODY_HTML="local.EN_WHY_BODY_HTML"
        v-model:FR_WHY_HEADING="local.FR_WHY_HEADING"
        v-model:FR_WHY_BODY_HTML="local.FR_WHY_BODY_HTML"
      />
    </template>
    <div v-else class="text-gray-400 text-sm py-4">Loading settings…</div>

    <!-- Save / Reset actions (repeated at bottom for long-form convenience) -->
    <div class="flex gap-4 mt-4">
      <Button :disabled="loading || saving" @click="saveAll">
        {{ saving ? 'Saving…' : 'Save all' }}
      </Button>
      <Button variant="outline" :disabled="loading || saving" @click="resetAll">
        Reset to defaults
      </Button>
    </div>
  </div>
</template>
