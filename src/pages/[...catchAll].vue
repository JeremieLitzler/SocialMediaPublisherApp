<script setup lang="ts">
import AppError from '@/components/AppError.vue'

useErrorStore().setError({ error: 'Page Not Found', customCode: 404 })
</script>

<template>
  <AppError />
</template>
