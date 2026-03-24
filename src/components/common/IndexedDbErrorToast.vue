<script setup lang="ts">
import { useIndexedDbError } from '@/composables/useIndexedDbError'

const { error } = useIndexedDbError()
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 translate-x-8"
    enter-to-class="opacity-100 translate-x-0"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="opacity-100 translate-x-0"
    leave-to-class="opacity-0 translate-x-8"
  >
    <div
      v-if="error"
      role="alert"
      aria-live="assertive"
      class="fixed top-4 right-4 z-50 w-96 rounded-xl border-2 border-red-800 bg-red-600 p-5 shadow-2xl text-white"
    >
      <div class="flex items-start gap-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="mt-0.5 h-7 w-7 shrink-0 text-white"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
            clip-rule="evenodd"
          />
        </svg>

        <div class="min-w-0 flex-1">
          <p class="text-lg font-bold leading-tight">Settings unavailable</p>
          <p class="mt-1.5 text-sm leading-relaxed text-red-100">
            Your snippet settings could not be loaded from browser storage. Default values are in
            use.
          </p>
          <p class="mt-2 text-xs italic text-red-200">
            Please reload the page to retry.
          </p>
        </div>
      </div>
    </div>
  </Transition>
</template>
