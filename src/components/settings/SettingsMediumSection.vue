<script setup lang="ts">
const enWhyHeading = defineModel<string>('EN_WHY_HEADING', { required: true })
const enWhyBodyHtml = defineModel<string>('EN_WHY_BODY_HTML', { required: true })
const frWhyHeading = defineModel<string>('FR_WHY_HEADING', { required: true })
const frWhyBodyHtml = defineModel<string>('FR_WHY_BODY_HTML', { required: true })
</script>

<template>
  <section class="mb-10">
    <h2 class="text-xl font-semibold mb-4 border-b pb-2">Medium</h2>

    <!-- EN group -->
    <h3 class="text-base font-medium mb-3 mt-4">English</h3>
    <div class="space-y-6">
      <div>
        <label class="block font-medium mb-1" for="EN_WHY_HEADING"> EN — "Why" heading </label>
        <input
          id="EN_WHY_HEADING"
          v-model="enWhyHeading"
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
          v-model="enWhyBodyHtml"
          rows="10"
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
          v-model="frWhyHeading"
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
          v-model="frWhyBodyHtml"
          rows="10"
          class="w-full border rounded px-3 py-2 text-sm font-mono resize-y"
        />
      </div>
    </div>
  </section>
</template>
