import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import PlatformLinkedIn from './PlatformLinkedIn.vue'
import { useArticleState } from '@/composables/useArticleState'
import { generateLinkedInContent } from '@/utils/linkedInContentGenerator'

// vi.hoisted ensures mocks are available inside the vi.mock factory (which is hoisted)
const mockPush = vi.hoisted(() => vi.fn())
const mockReplace = vi.hoisted(() => vi.fn())

vi.mock('@/composables/useArticleState')
vi.mock('@/utils/linkedInContentGenerator')
vi.mock('vue-router', () => ({ useRouter: () => ({ push: mockPush, replace: mockReplace }) }))

const globalStubs = {
  CopyButton: { template: '<button class="copy-btn" v-bind="$attrs"><slot /></button>' },
  Button: { template: '<button v-bind="$attrs"><slot /></button>' },
  RouterLink: { template: '<a v-bind="$attrs"><slot /></a>' },
}

function makeArticle() {
  return {
    url: 'https://iamjeremie.me/post/test/',
    blog: 'english' as const,
    title: 'Test Article',
    description: 'A description',
    imageUrl: '',
    imageAlt: '',
    imageCaption: null,
    introduction: '<p>Intro paragraph.</p>',
    category: 'tech',
    tags: ['vue'],
    followMeSnippet: '',
    imageCreditSnippet: null,
  }
}

describe('PlatformLinkedIn', () => {
  let extractionState: any
  let resetState: () => void

  beforeEach(() => {
    extractionState = ref({
      status: 'idle',
      article: null,
      error: null,
      manualIntroduction: '',
      selectedPlatform: null,
    })
    resetState = vi.fn() as unknown as () => void

    // resetState must always be included alongside extractionState.
    // Omitting it causes TS2345: the return type of useArticleState() requires both.
    vi.mocked(useArticleState).mockReturnValue({ extractionState, resetState })
    vi.mocked(generateLinkedInContent).mockReturnValue({
      body: 'Intro paragraph.\n\n⬇️⬇️⬇️\nhttps://iamjeremie.me/post/test/?utm_medium=social&utm_source=LinkedIn',
    })
    mockPush.mockReset()
    mockReplace.mockReset()
  })

  it('redirects to home when no article is loaded', () => {
    mount(PlatformLinkedIn, { global: { stubs: globalStubs } })
    expect(mockReplace).toHaveBeenCalledWith('/')
  })

  it('shows LinkedIn heading when article is loaded', () => {
    extractionState.value.article = makeArticle()
    const wrapper = mount(PlatformLinkedIn, { global: { stubs: globalStubs } })
    expect(wrapper.text()).toContain('LinkedIn')
  })

  it('calls generateLinkedInContent with the article', () => {
    const article = makeArticle()
    extractionState.value.article = article
    mount(PlatformLinkedIn, { global: { stubs: globalStubs } })
    expect(generateLinkedInContent).toHaveBeenCalledWith(article)
  })

  it('renders the body in a pre element', () => {
    extractionState.value.article = makeArticle()
    const wrapper = mount(PlatformLinkedIn, { global: { stubs: globalStubs } })
    const pre = wrapper.find('pre')
    expect(pre.exists()).toBe(true)
    expect(pre.text()).toContain('Intro paragraph.')
  })

  it('renders a CopyButton when article is loaded', () => {
    extractionState.value.article = makeArticle()
    const wrapper = mount(PlatformLinkedIn, { global: { stubs: globalStubs } })
    expect(wrapper.find('.copy-btn').exists()).toBe(true)
  })

  it('calls resetState and navigates home when Start over is clicked', async () => {
    extractionState.value.article = makeArticle()
    const wrapper = mount(PlatformLinkedIn, { global: { stubs: globalStubs } })
    const buttons = wrapper.findAll('button')
    const startOver = buttons.find((b) => b.text() === 'Start over')
    await startOver?.trigger('click')
    expect(resetState).toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith('/')
  })
})
