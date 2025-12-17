import type { ErrorExtended } from '@/types/ErrorExtended'

export const useErrorStore = defineStore('error-store', () => {
  const activeError = ref<null | ErrorExtended>(null)
  const isCustomError = ref(false)
  const setError = ({
    error,
    customCode,
    nextPage,
  }: {
    error: string | Error
    customCode?: number
    nextPage?: string
  }) => {
    const errorIsString = typeof error === 'string'
    if (errorIsString) isCustomError.value = true
    if (errorIsString || error instanceof Error) {
      console.log('Received a string error', error)
      activeError.value = errorIsString ? Error(error) : error
      activeError.value.customCode = customCode || 500
      if (nextPage) activeError.value.nextPage = nextPage
      return
    }

    // if (!errorIsString && error instanceof AuthError) {

    // }
    console.log('Received a PostgrestError error')
    activeError.value = error
  }

  const clearError = () => {
    activeError.value = null
    isCustomError.value = false
  }

  return {
    activeError,
    isCustomError,
    setError,
    clearError,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePageStore, import.meta.hot))
}
