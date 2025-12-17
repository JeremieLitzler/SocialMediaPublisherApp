<script setup lang="ts">
const router = useRouter()

const { activeError, isCustomError } = useErrorStore()

const error = ref(activeError)
console.log('AppError', { ...activeError })
const message = ref('')
const customCode = ref(0)
const details = ref('')
const code = ref<string | undefined>(undefined)
const hint = ref('')
const statusCode = ref(0)
const nextPage = ref<string | undefined>(undefined)

if (error.value && !('code' in error.value)) {
  message.value = error.value.message
  customCode.value = error.value.customCode ?? 0
}
if (error.value && 'nextPage' in error.value) {
  console.log('nextPage = ', error.value.nextPage)
  nextPage.value = error.value.nextPage
}

const ErrorTemplate = import.meta.env.DEV
  ? defineAsyncComponent(() => import('./AppErrorDev.vue'))
  : defineAsyncComponent(() => import('./AppErrorProd.vue'))

router.afterEach(() => {
  useErrorStore().clearError()
})
</script>

<template>
  <section class="error">
    <ErrorTemplate :message :customCode :code :statusCode :hint :details :isCustomError :nextPage />
  </section>
</template>

<style scoped>
@reference "@/assets/index.css";

.error {
  @apply mx-auto flex justify-center items-center flex-1 p-10 text-center -mt-20 min-h-[90vh];
}
:deep(.error__icon) {
  @apply text-7xl text-destructive;
}

:deep(.error__code) {
  @apply font-extrabold text-7xl text-secondary;
}

:deep(.error__msg) {
  @apply text-3xl font-extrabold text-primary;
}

:deep(.error__btn) {
  @apply max-w-36;
}

:deep(.error-footer) {
  @apply flex flex-col items-center justify-center gap-5 mt-6 font-light;
}

:deep(.error-footer__text) {
  @apply text-lg text-muted-foreground;
}

:deep(p) {
  @apply my-2;
}
</style>
