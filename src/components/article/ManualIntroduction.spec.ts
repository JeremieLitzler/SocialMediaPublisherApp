import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import ManualIntroduction from './ManualIntroduction.vue'
import { useArticleState } from '@/composables/useArticleState'
import type { ExtractionState } from '@/types/article'

// vi.hoisted makes the router spy available inside the hoisted vi.mock factory.
const mockPush = vi.hoisted(() => vi.fn())

vi.mock('@/composables/useArticleState')
vi.mock('vue-router', () => ({ useRouter: () => ({ push: mockPush }) }))

const globalStubs = {
  Button: { template: '<button v-bind="$attrs"><slot /></button>' },
}

const EMPTY_MESSAGE =
  'The source article has no introduction before its first <h2> section heading. Add an introduction to the source article, or enter one manually below.'
const NO_HEADING_MESSAGE =
  'The source article has no <h2> section heading, so the end of the introduction cannot be located. Update the source article to use <h2> for its section headings.'

// A retained article (EMPTY case) — its presence is what enables manual entry.
function makeArticle() {
  return {
    url: 'https://iamjeremie.me/post/test/',
    blog: 'english' as const,
    title: 'CSS Variables',
    description: '',
    imageUrl: '',
    imageAlt: '',
    imageCaption: null,
    introduction: '',
    category: 'web-fundamentals',
    tags: ['CSS'],
    followMeSnippet: '',
    imageCreditSnippet: null,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mountFallback(overrides: Record<string, any>) {
  const extractionState = ref<ExtractionState>({
    status: 'missing-introduction',
    article: null,
    error: NO_HEADING_MESSAGE,
    manualIntroduction: '',
    selectedPlatform: null,
    ...overrides,
  })
  vi.mocked(useArticleState).mockReturnValue({ extractionState, resetState: vi.fn() })
  const wrapper = mount(ManualIntroduction, { global: { stubs: globalStubs } })
  return { wrapper, extractionState }
}

describe('ManualIntroduction — issue #125 missing-introduction fallback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPush.mockReset()
  })

  // TC-2 — EMPTY: the cause message, a manual-entry input and the continue button are shown
  it('TC-2: EMPTY shows the cause message, an introduction input and the continue button', () => {
    const { wrapper } = mountFallback({
      article: makeArticle(),
      error: EMPTY_MESSAGE,
      selectedPlatform: 'LinkedIn',
    })

    expect(wrapper.text()).toContain('no introduction')
    expect(wrapper.find('#manual-intro').exists()).toBe(true)
    expect(wrapper.find('button').text()).toBe('Continue with Manual Introduction')
  })

  // TC-3 — NO_HEADING: the source-fix instruction is shown and no manual-entry input is offered
  it('TC-3: NO_HEADING shows the source-fix instruction and offers no manual entry', () => {
    const { wrapper } = mountFallback({ article: null, error: NO_HEADING_MESSAGE })

    expect(wrapper.text()).toContain('<h2>')
    expect(wrapper.text()).toContain('cannot be located')
    expect(wrapper.find('#manual-intro').exists()).toBe(false)
    expect(wrapper.find('button').exists()).toBe(false)
  })

  // TC-4 — a supplied introduction completes the article and opens the chosen platform
  it('TC-4: a supplied introduction completes the article and opens the chosen platform', async () => {
    const { wrapper, extractionState } = mountFallback({
      article: makeArticle(),
      error: EMPTY_MESSAGE,
      selectedPlatform: 'LinkedIn',
    })

    extractionState.value.manualIntroduction = 'A typed introduction'
    await wrapper.vm.$nextTick()
    await wrapper.find('button').trigger('click')

    expect(extractionState.value.status).toBe('success')
    expect(extractionState.value.article?.introduction).toContain('A typed introduction')
    expect(mockPush).toHaveBeenCalledWith('/linkedin')
  })

  // TC-5 — the remembered platform (X), not a default, is opened
  it('TC-5: opens the remembered platform, not a default', async () => {
    const { wrapper, extractionState } = mountFallback({
      article: makeArticle(),
      error: EMPTY_MESSAGE,
      selectedPlatform: 'X',
    })

    extractionState.value.manualIntroduction = 'Intro text'
    await wrapper.vm.$nextTick()
    await wrapper.find('button').trigger('click')

    expect(mockPush).toHaveBeenCalledWith('/x')
  })

  // TC-6 — a blank/whitespace introduction cannot proceed
  it('TC-6: a whitespace-only introduction cannot proceed', async () => {
    const { wrapper, extractionState } = mountFallback({
      article: makeArticle(),
      error: EMPTY_MESSAGE,
      selectedPlatform: 'X',
      manualIntroduction: '   ',
    })

    await wrapper.vm.$nextTick()
    const button = wrapper.find('button')
    expect(button.attributes('disabled')).toBeDefined()

    await button.trigger('click')
    expect(extractionState.value.status).toBe('missing-introduction')
    expect(mockPush).not.toHaveBeenCalled()
  })

  // TC-7 — completing the introduction makes no fetch / network call
  it('TC-7: completing the introduction triggers no network request', async () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)

    const { wrapper, extractionState } = mountFallback({
      article: makeArticle(),
      error: EMPTY_MESSAGE,
      selectedPlatform: 'LinkedIn',
    })

    extractionState.value.manualIntroduction = 'Intro text'
    await wrapper.vm.$nextTick()
    await wrapper.find('button').trigger('click')

    expect(fetchSpy).not.toHaveBeenCalled()
    vi.unstubAllGlobals()
  })
})
