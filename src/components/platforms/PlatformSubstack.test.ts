import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import PlatformSubstack from './PlatformSubstack.vue'
import { useArticleState } from '@/composables/useArticleState'
import { generateSubstackContent } from '@/utils/substackContentGenerator'

// vi.hoisted ensures mocks are available inside the vi.mock factory (which is hoisted)
const mockPush = vi.hoisted(() => vi.fn())
const mockReplace = vi.hoisted(() => vi.fn())

vi.mock('@/composables/useArticleState')
vi.mock('@/utils/substackContentGenerator')
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
    imageUrl: 'https://iamjeremie.me/img/hero.jpg',
    imageAlt: 'Hero image',
    imageCaption: null,
    introduction: '<p>Intro paragraph.</p>',
    category: 'Technology',
    tags: ['vue', 'typescript'],
    followMeSnippet: '<p>Follow me.</p>',
    imageCreditSnippet: null,
  }
}

function makeSubstackContent() {
  return {
    title: 'Test Article',
    description: 'A description',
    bodyHtml: '<figure><img src="https://iamjeremie.me/img/hero.jpg" alt="Hero image" /></figure>',
    category: 'Technology',
    tags: ['vue', 'typescript'],
  }
}

describe('PlatformSubstack', () => {
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
    vi.mocked(generateSubstackContent).mockReturnValue(makeSubstackContent())
    mockPush.mockReset()
    mockReplace.mockReset()
  })

  it('redirects to home when no article is loaded', () => {
    mount(PlatformSubstack, { global: { stubs: globalStubs } })
    expect(mockReplace).toHaveBeenCalledWith('/')
  })

  it('shows Substack heading when article is loaded', () => {
    extractionState.value.article = makeArticle()
    const wrapper = mount(PlatformSubstack, { global: { stubs: globalStubs } })
    expect(wrapper.text()).toContain('Substack')
  })

  it('calls generateSubstackContent with the article', () => {
    const article = makeArticle()
    extractionState.value.article = article
    mount(PlatformSubstack, { global: { stubs: globalStubs } })
    expect(generateSubstackContent).toHaveBeenCalledWith(article)
  })

  it('displays the actual title value as text', () => {
    extractionState.value.article = makeArticle()
    const wrapper = mount(PlatformSubstack, { global: { stubs: globalStubs } })
    expect(wrapper.text()).toContain('Test Article')
  })

  it('displays the actual description value as text', () => {
    extractionState.value.article = makeArticle()
    const wrapper = mount(PlatformSubstack, { global: { stubs: globalStubs } })
    expect(wrapper.text()).toContain('A description')
  })

  it('displays the actual category value as text', () => {
    extractionState.value.article = makeArticle()
    const wrapper = mount(PlatformSubstack, { global: { stubs: globalStubs } })
    expect(wrapper.text()).toContain('Technology')
  })

  it('renders the bodyHtml in a textarea', () => {
    extractionState.value.article = makeArticle()
    const wrapper = mount(PlatformSubstack, { global: { stubs: globalStubs } })
    const textarea = wrapper.find('textarea')
    expect(textarea.exists()).toBe(true)
    expect(textarea.element.value).toContain('<figure>')
  })

  it('renders a live HTML preview below the textarea', () => {
    extractionState.value.article = makeArticle()
    const wrapper = mount(PlatformSubstack, { global: { stubs: globalStubs } })
    expect(wrapper.find('.body-preview').exists()).toBe(true)
  })

  it('preview contains sanitized rendered HTML from the textarea', () => {
    extractionState.value.article = makeArticle()
    const wrapper = mount(PlatformSubstack, { global: { stubs: globalStubs } })
    const preview = wrapper.find('.body-preview')
    expect(preview.html()).toContain('<figure>')
  })

  it('preview strips script tags from user input', async () => {
    extractionState.value.article = makeArticle()
    const wrapper = mount(PlatformSubstack, { global: { stubs: globalStubs } })
    const textarea = wrapper.find('textarea')
    await textarea.setValue('<p>Safe</p><script>alert(1)<\/script>')
    await wrapper.vm.$nextTick()
    const preview = wrapper.find('.body-preview')
    expect(preview.html()).not.toContain('<script>')
    expect(preview.html()).toContain('<p>Safe</p>')
  })

  it('renders CopyButton elements when article is loaded', () => {
    extractionState.value.article = makeArticle()
    const wrapper = mount(PlatformSubstack, { global: { stubs: globalStubs } })
    expect(wrapper.findAll('.copy-btn').length).toBeGreaterThan(0)
  })

  it('renders one CopyButton per tag', () => {
    extractionState.value.article = makeArticle()
    const wrapper = mount(PlatformSubstack, { global: { stubs: globalStubs } })
    // tags: ['vue', 'typescript'] → at least 2 tag copy buttons
    const copyButtons = wrapper.findAll('.copy-btn')
    expect(copyButtons.length).toBeGreaterThanOrEqual(2)
  })

  it('calls resetState and navigates home when Start over is clicked', async () => {
    extractionState.value.article = makeArticle()
    const wrapper = mount(PlatformSubstack, { global: { stubs: globalStubs } })
    const buttons = wrapper.findAll('button')
    const startOver = buttons.find((b) => b.text() === 'Start over')
    await startOver?.trigger('click')
    expect(resetState).toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith('/')
  })
})
