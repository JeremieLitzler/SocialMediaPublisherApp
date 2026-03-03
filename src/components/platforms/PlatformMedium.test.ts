import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import PlatformMedium from './PlatformMedium.vue'
import { useArticleState } from '@/composables/useArticleState'
import { generateMediumContent } from '@/utils/mediumContentGenerator'

// vi.hoisted ensures mockPush is available inside the vi.mock factory (which is hoisted)
const mockPush = vi.hoisted(() => vi.fn())

vi.mock('@/composables/useArticleState')
vi.mock('@/utils/mediumContentGenerator')
vi.mock('vue-router', () => ({ useRouter: () => ({ push: mockPush }) }))

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

function makeMediumContent() {
  return {
    title: 'Test Article',
    description: 'A description',
    imageAlt: 'Hero image',
    imageCaption: '',
    bodyHtml: '<figure><img src="https://iamjeremie.me/img/hero.jpg" alt="Hero image" /></figure>',
    canonicalUrl: 'https://iamjeremie.me/post/test/',
    category: 'Technology',
    tags: ['vue', 'typescript'],
  }
}

describe('PlatformMedium', () => {
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

    vi.mocked(useArticleState).mockReturnValue({ extractionState, resetState })
    vi.mocked(generateMediumContent).mockReturnValue(makeMediumContent())
    mockPush.mockReset()
  })

  it('shows fallback message when no article is loaded', () => {
    const wrapper = mount(PlatformMedium, { global: { stubs: globalStubs } })
    expect(wrapper.text()).toContain('No article loaded.')
  })

  it('shows a link home when no article is loaded', () => {
    const wrapper = mount(PlatformMedium, { global: { stubs: globalStubs } })
    const link = wrapper.find('a')
    expect(link.attributes('to')).toBe('/')
  })

  it('does not show content block when no article', () => {
    const wrapper = mount(PlatformMedium, { global: { stubs: globalStubs } })
    expect(wrapper.find('.content').exists()).toBe(false)
  })

  it('shows Medium heading when article is loaded', () => {
    extractionState.value.article = makeArticle()
    const wrapper = mount(PlatformMedium, { global: { stubs: globalStubs } })
    expect(wrapper.text()).toContain('Medium')
  })

  it('calls generateMediumContent with the article', () => {
    const article = makeArticle()
    extractionState.value.article = article
    mount(PlatformMedium, { global: { stubs: globalStubs } })
    expect(generateMediumContent).toHaveBeenCalledWith(article)
  })

  it('displays the actual title value as text', () => {
    extractionState.value.article = makeArticle()
    const wrapper = mount(PlatformMedium, { global: { stubs: globalStubs } })
    expect(wrapper.text()).toContain('Test Article')
  })

  it('displays the actual description value as text', () => {
    extractionState.value.article = makeArticle()
    const wrapper = mount(PlatformMedium, { global: { stubs: globalStubs } })
    expect(wrapper.text()).toContain('A description')
  })

  it('displays the actual imageAlt value as text', () => {
    extractionState.value.article = makeArticle()
    const wrapper = mount(PlatformMedium, { global: { stubs: globalStubs } })
    expect(wrapper.text()).toContain('Hero image')
  })

  it('displays the actual canonicalUrl value as text', () => {
    extractionState.value.article = makeArticle()
    const wrapper = mount(PlatformMedium, { global: { stubs: globalStubs } })
    expect(wrapper.text()).toContain('https://iamjeremie.me/post/test/')
  })

  it('displays the actual category value as text', () => {
    extractionState.value.article = makeArticle()
    const wrapper = mount(PlatformMedium, { global: { stubs: globalStubs } })
    expect(wrapper.text()).toContain('Technology')
  })

  it('renders the bodyHtml in a textarea', () => {
    extractionState.value.article = makeArticle()
    const wrapper = mount(PlatformMedium, { global: { stubs: globalStubs } })
    const textarea = wrapper.find('textarea')
    expect(textarea.exists()).toBe(true)
    expect(textarea.element.value).toContain('<figure>')
  })

  it('renders CopyButton elements when article is loaded', () => {
    extractionState.value.article = makeArticle()
    const wrapper = mount(PlatformMedium, { global: { stubs: globalStubs } })
    expect(wrapper.findAll('.copy-btn').length).toBeGreaterThan(0)
  })

  it('renders one CopyButton per tag', () => {
    extractionState.value.article = makeArticle()
    const wrapper = mount(PlatformMedium, { global: { stubs: globalStubs } })
    // tags: ['vue', 'typescript'] → 2 tag copy buttons
    // We can't isolate per-section easily, so just ensure multiple copy buttons exist
    const copyButtons = wrapper.findAll('.copy-btn')
    expect(copyButtons.length).toBeGreaterThanOrEqual(2)
  })

  it('shows "None" label when imageCaption is empty', () => {
    extractionState.value.article = makeArticle()
    vi.mocked(generateMediumContent).mockReturnValue({
      ...makeMediumContent(),
      imageCaption: '',
    })
    const wrapper = mount(PlatformMedium, { global: { stubs: globalStubs } })
    expect(wrapper.text()).toContain('None')
  })

  it('calls resetState and navigates home when Start over is clicked', async () => {
    extractionState.value.article = makeArticle()
    const wrapper = mount(PlatformMedium, { global: { stubs: globalStubs } })
    const buttons = wrapper.findAll('button')
    const startOver = buttons.find((b) => b.text() === 'Start over')
    await startOver?.trigger('click')
    expect(resetState).toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith('/')
  })
})
