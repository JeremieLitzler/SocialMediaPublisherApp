import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import ArticleInput from './ArticleInput.vue'
import { useArticleState } from '@/composables/useArticleState'

// Hoisted spies shared with the hoisted vi.mock factories below.
const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  extractArticle: vi.fn(),
}))

vi.mock('vue-router', () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock('@/composables/useArticleState')
vi.mock('@/composables/useArticleExtractor', () => ({
  useArticleExtractor: () => ({ extractArticle: mocks.extractArticle }),
}))

const globalStubs = {
  Input: {
    props: ['modelValue'],
    template:
      '<input v-bind="$attrs" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
  },
  Button: { template: '<button v-bind="$attrs"><slot /></button>' },
}

 
let extractionState: any

function mountInput() {
  extractionState = ref({
    status: 'idle',
    article: null,
    error: null,
    manualIntroduction: '',
    selectedPlatform: null,
  })
  vi.mocked(useArticleState).mockReturnValue({ extractionState, resetState: vi.fn() })
  return mount(ArticleInput, { global: { stubs: globalStubs } })
}

async function submitWithUrl(wrapper: ReturnType<typeof mountInput>) {
  await wrapper.find('#article-url').setValue('https://iamjeremie.me/post/test/')
  await wrapper.find('button').trigger('click')
  await wrapper.vm.$nextTick()
}

describe('ArticleInput — issue #125 platform routing', () => {
  beforeEach(() => {
    mocks.push.mockReset()
    mocks.extractArticle.mockReset()
  })

  // TC-13 / R6 — on success the selected platform is remembered and opened
  it('TC-13: remembers the default platform and navigates to it on success', async () => {
    const wrapper = mountInput()
    mocks.extractArticle.mockImplementation(async () => {
      extractionState.value.status = 'success'
    })

    await submitWithUrl(wrapper)

    expect(extractionState.value.selectedPlatform).toBe('X')
    expect(mocks.push).toHaveBeenCalledWith('/x')
  })

  // R6 — a non-default selection is the one remembered and opened
  it('R6: remembers a non-default selected platform on success', async () => {
    const wrapper = mountInput()
    mocks.extractArticle.mockImplementation(async () => {
      extractionState.value.status = 'success'
    })

    await wrapper.find('input[value="LinkedIn"]').setValue()
    await submitWithUrl(wrapper)

    expect(extractionState.value.selectedPlatform).toBe('LinkedIn')
    expect(mocks.push).toHaveBeenCalledWith('/linkedin')
  })

  // TC-2 / R2 — on a missing introduction the platform is remembered but no navigation happens
  it('TC-2: remembers the platform but does not navigate on a missing introduction', async () => {
    const wrapper = mountInput()
    mocks.extractArticle.mockImplementation(async () => {
      extractionState.value.status = 'missing-introduction'
    })

    await submitWithUrl(wrapper)

    expect(extractionState.value.selectedPlatform).toBe('X')
    expect(mocks.push).not.toHaveBeenCalled()
  })
})
