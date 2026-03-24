/**
 * useIndexedDbError — shared singleton for surfacing IndexedDB load failures.
 *
 * Any component that calls useSnippets().load() wraps it in a try/catch and
 * calls setError() on failure. The IndexedDbErrorToast reads this state and
 * retries load() automatically; clearError() is called on successful retry.
 */

import { ref, readonly } from 'vue'

const error = ref<string | null>(null)

export function useIndexedDbError() {
  function setError(message: string): void {
    error.value = message
  }

  function clearError(): void {
    error.value = null
  }

  return {
    /** Non-null when IndexedDB is unavailable and snippet defaults are in use. */
    error: readonly(error),
    setError,
    clearError,
  }
}
