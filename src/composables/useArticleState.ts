import { ref } from 'vue'
import type { ExtractionState } from '@/types/article'

/**
 * Module-level state - shared across all consumers (singleton pattern)
 * See ADR-002 for rationale on using singleton composable over Pinia
 */
const extractionState = ref<ExtractionState>({
  status: 'idle',
  article: null,
  error: null,
  manualIntroduction: '',
  selectedPlatform: null,
})

/**
 * Singleton composable for managing article extraction state
 *
 * This composable uses a module-level ref, making the state shared
 * across all components that call useArticleState(). Any component
 * can read or modify the extraction state without prop drilling.
 *
 * @returns Reactive extraction state object
 *
 * @example
 * ```ts
 * const { extractionState } = useArticleState()
 * extractionState.value.status = 'loading'
 * ```
 */
/**
 * Resets the singleton extraction state back to its initial values.
 * Call this before navigating away (e.g. "Start over") so that index.vue
 * renders the input form instead of a blank page.
 */
function resetState() {
  extractionState.value = {
    status: 'idle',
    article: null,
    error: null,
    manualIntroduction: '',
    selectedPlatform: null,
  }
}

export function useArticleState() {
  return {
    extractionState,
    resetState,
  }
}
