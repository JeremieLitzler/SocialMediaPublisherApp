<script setup lang="ts">
const enShareBlock = defineModel<string>('EN_SUBSTACK_SHARE_BLOCK', { required: true })
const frShareBlock = defineModel<string>('FR_SUBSTACK_SHARE_BLOCK', { required: true })
const enUtmAnchor = defineModel<string>('EN_SUBSTACK_UTM_ANCHOR', { required: true })
const frUtmAnchor = defineModel<string>('FR_SUBSTACK_UTM_ANCHOR', { required: true })
</script>

<template>
  <section class="mb-10">
    <h2 class="text-xl font-semibold mb-4 border-b pb-2">Substack</h2>

    <div class="space-y-6">
      <div>
        <label class="block font-medium mb-1" for="EN_SUBSTACK_SHARE_BLOCK">
          EN — Share block sentence
        </label>
        <input
          id="EN_SUBSTACK_SHARE_BLOCK"
          v-model="enShareBlock"
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
          v-model="frShareBlock"
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
          v-model="enUtmAnchor"
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
          v-model="frUtmAnchor"
          type="text"
          class="w-full border rounded px-3 py-2 text-sm"
        />
      </div>
    </div>
  </section>
</template>
