import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import PlatformSwitcher from './PlatformSwitcher.vue'
import { useArticleState } from '@/composables/useArticleState'

// vi.hoisted ensures mockPush is available inside the vi.mock factory (which is hoisted)
const mockPush = vi.hoisted(() => vi.fn())

vi.mock('@/composables/useArticleState')
vi.mock('vue-router', () => ({ useRouter: () => ({ push: mockPush }) }))

const globalStubs = {
  Button: { template: '<button v-bind="$attrs" @click="$emit(\'click\')"><slot /></button>' },
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

describe('PlatformSwitcher', () => {
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
    mockPush.mockReset()
  })

  // AC-6: No switcher rendered when article is null
  it('renders nothing when article is null', () => {
    const wrapper = mount(PlatformSwitcher, {
      props: { currentPlatform: 'X' },
      global: { stubs: globalStubs },
    })
    expect(wrapper.find('.platform-switcher').exists()).toBe(false)
  })

  // AC-1: Renders buttons for all platforms except the current one
  it('renders three buttons when article is loaded and current platform is X', () => {
    extractionState.value.article = makeArticle()
    const wrapper = mount(PlatformSwitcher, {
      props: { currentPlatform: 'X' },
      global: { stubs: globalStubs },
    })
    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(3)
  })

  it('renders buttons for LinkedIn, Medium, Substack when current platform is X', () => {
    extractionState.value.article = makeArticle()
    const wrapper = mount(PlatformSwitcher, {
      props: { currentPlatform: 'X' },
      global: { stubs: globalStubs },
    })
    const text = wrapper.text()
    expect(text).toContain('LinkedIn')
    expect(text).toContain('Medium')
    expect(text).toContain('Substack')
  })

  it('renders buttons for X, Medium, Substack when current platform is LinkedIn', () => {
    extractionState.value.article = makeArticle()
    const wrapper = mount(PlatformSwitcher, {
      props: { currentPlatform: 'LinkedIn' },
      global: { stubs: globalStubs },
    })
    const text = wrapper.text()
    expect(text).toContain('X')
    expect(text).toContain('Medium')
    expect(text).toContain('Substack')
  })

  it('renders buttons for X, LinkedIn, Substack when current platform is Medium', () => {
    extractionState.value.article = makeArticle()
    const wrapper = mount(PlatformSwitcher, {
      props: { currentPlatform: 'Medium' },
      global: { stubs: globalStubs },
    })
    const text = wrapper.text()
    expect(text).toContain('X')
    expect(text).toContain('LinkedIn')
    expect(text).toContain('Substack')
  })

  it('renders buttons for X, LinkedIn, Medium when current platform is Substack', () => {
    extractionState.value.article = makeArticle()
    const wrapper = mount(PlatformSwitcher, {
      props: { currentPlatform: 'Substack' },
      global: { stubs: globalStubs },
    })
    const text = wrapper.text()
    expect(text).toContain('X')
    expect(text).toContain('LinkedIn')
    expect(text).toContain('Medium')
  })

  // AC-3: The active platform's button is not rendered
  it('does not render a button for X when current platform is X', () => {
    extractionState.value.article = makeArticle()
    const wrapper = mount(PlatformSwitcher, {
      props: { currentPlatform: 'X' },
      global: { stubs: globalStubs },
    })
    const buttons = wrapper.findAll('button')
    const buttonTexts = buttons.map((b) => b.text())
    expect(buttonTexts).not.toContain('X')
  })

  it('does not render a button for LinkedIn when current platform is LinkedIn', () => {
    extractionState.value.article = makeArticle()
    const wrapper = mount(PlatformSwitcher, {
      props: { currentPlatform: 'LinkedIn' },
      global: { stubs: globalStubs },
    })
    const buttons = wrapper.findAll('button')
    const buttonTexts = buttons.map((b) => b.text())
    expect(buttonTexts).not.toContain('LinkedIn')
  })

  it('does not render a button for Medium when current platform is Medium', () => {
    extractionState.value.article = makeArticle()
    const wrapper = mount(PlatformSwitcher, {
      props: { currentPlatform: 'Medium' },
      global: { stubs: globalStubs },
    })
    const buttons = wrapper.findAll('button')
    const buttonTexts = buttons.map((b) => b.text())
    expect(buttonTexts).not.toContain('Medium')
  })

  it('does not render a button for Substack when current platform is Substack', () => {
    extractionState.value.article = makeArticle()
    const wrapper = mount(PlatformSwitcher, {
      props: { currentPlatform: 'Substack' },
      global: { stubs: globalStubs },
    })
    const buttons = wrapper.findAll('button')
    const buttonTexts = buttons.map((b) => b.text())
    expect(buttonTexts).not.toContain('Substack')
  })

  // AC-2: Clicking a button calls router.push to the correct route (no network fetch)
  it('calls router.push("/linkedin") when LinkedIn button is clicked from X', async () => {
    extractionState.value.article = makeArticle()
    const wrapper = mount(PlatformSwitcher, {
      props: { currentPlatform: 'X' },
      global: { stubs: globalStubs },
    })
    const buttons = wrapper.findAll('button')
    const linkedInBtn = buttons.find((b) => b.text() === 'LinkedIn')
    await linkedInBtn?.trigger('click')
    expect(mockPush).toHaveBeenCalledWith('/linkedin')
  })

  it('calls router.push("/medium") when Medium button is clicked from X', async () => {
    extractionState.value.article = makeArticle()
    const wrapper = mount(PlatformSwitcher, {
      props: { currentPlatform: 'X' },
      global: { stubs: globalStubs },
    })
    const buttons = wrapper.findAll('button')
    const mediumBtn = buttons.find((b) => b.text() === 'Medium')
    await mediumBtn?.trigger('click')
    expect(mockPush).toHaveBeenCalledWith('/medium')
  })

  it('calls router.push("/substack") when Substack button is clicked from X', async () => {
    extractionState.value.article = makeArticle()
    const wrapper = mount(PlatformSwitcher, {
      props: { currentPlatform: 'X' },
      global: { stubs: globalStubs },
    })
    const buttons = wrapper.findAll('button')
    const substackBtn = buttons.find((b) => b.text() === 'Substack')
    await substackBtn?.trigger('click')
    expect(mockPush).toHaveBeenCalledWith('/substack')
  })

  it('calls router.push("/x") when X button is clicked from LinkedIn', async () => {
    extractionState.value.article = makeArticle()
    const wrapper = mount(PlatformSwitcher, {
      props: { currentPlatform: 'LinkedIn' },
      global: { stubs: globalStubs },
    })
    const buttons = wrapper.findAll('button')
    const xBtn = buttons.find((b) => b.text() === 'X')
    await xBtn?.trigger('click')
    expect(mockPush).toHaveBeenCalledWith('/x')
  })

  // AC-4: Article state is unchanged after navigation (selectedPlatform updated, article preserved)
  it('updates selectedPlatform to LinkedIn when LinkedIn button is clicked', async () => {
    extractionState.value.article = makeArticle()
    extractionState.value.selectedPlatform = 'X'
    const wrapper = mount(PlatformSwitcher, {
      props: { currentPlatform: 'X' },
      global: { stubs: globalStubs },
    })
    const buttons = wrapper.findAll('button')
    const linkedInBtn = buttons.find((b) => b.text() === 'LinkedIn')
    await linkedInBtn?.trigger('click')
    expect(extractionState.value.selectedPlatform).toBe('LinkedIn')
  })

  it('preserves article data after platform switch', async () => {
    const article = makeArticle()
    extractionState.value.article = article
    extractionState.value.selectedPlatform = 'X'
    const wrapper = mount(PlatformSwitcher, {
      props: { currentPlatform: 'X' },
      global: { stubs: globalStubs },
    })
    const buttons = wrapper.findAll('button')
    const mediumBtn = buttons.find((b) => b.text() === 'Medium')
    await mediumBtn?.trigger('click')
    // Article data must be identical after switch — no re-fetch, no mutation
    expect(extractionState.value.article).toStrictEqual(article)
    expect(extractionState.value.article?.title).toBe('Test Article')
    expect(extractionState.value.article?.url).toBe('https://iamjeremie.me/post/test/')
  })

  it('does not invoke resetState when switching platforms', async () => {
    extractionState.value.article = makeArticle()
    const wrapper = mount(PlatformSwitcher, {
      props: { currentPlatform: 'X' },
      global: { stubs: globalStubs },
    })
    const buttons = wrapper.findAll('button')
    const linkedInBtn = buttons.find((b) => b.text() === 'LinkedIn')
    await linkedInBtn?.trigger('click')
    expect(resetState).not.toHaveBeenCalled()
  })

  // Switcher renders the heading "Share with another platform"
  it('renders the switcher heading when article is loaded', () => {
    extractionState.value.article = makeArticle()
    const wrapper = mount(PlatformSwitcher, {
      props: { currentPlatform: 'X' },
      global: { stubs: globalStubs },
    })
    expect(wrapper.text()).toContain('Share with another platform')
  })
})
