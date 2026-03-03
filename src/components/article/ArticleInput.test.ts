import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import ArticleInput from './ArticleInput.vue'
import { useArticleState } from '@/composables/useArticleState'
import { useArticleExtractor } from '@/composables/useArticleExtractor'

// Mock the composables
vi.mock('@/composables/useArticleState')
vi.mock('@/composables/useArticleExtractor')

// Global stubs for UI components
const globalStubs = {
  Input: {
    template: '<input v-bind="$attrs" @input="$emit(\'update:modelValue\', $event.target.value)" />',
  },
  Button: {
    template: '<button v-bind="$attrs"><slot /></button>',
  },
}

describe('ArticleInput', () => {
  let extractionState: any
  let extractArticle: any

  beforeEach(() => {
    // Reset state before each test - using actual ref for reactivity
    extractionState = ref({
      status: 'idle',
      article: null,
      error: null,
      manualIntroduction: '',
    })

    extractArticle = vi.fn()

    vi.mocked(useArticleState).mockReturnValue({ extractionState, resetState: vi.fn() })
    vi.mocked(useArticleExtractor).mockReturnValue({ extractArticle })
  })

  it('should render URL input field', () => {
    const wrapper = mount(ArticleInput, { global: { stubs: globalStubs } })
    const input = wrapper.find('#article-url')
    expect(input.exists()).toBe(true)
    expect(input.attributes('type')).toBe('url')
    expect(input.attributes('placeholder')).toContain('iamjeremie.me')
  })

  it('should render all platform radio buttons', () => {
    const wrapper = mount(ArticleInput, { global: { stubs: globalStubs } })
    const radios = wrapper.findAll('input[type="radio"]')
    expect(radios).toHaveLength(4)

    const platforms = ['X', 'LinkedIn', 'Medium', 'Substack']
    platforms.forEach((platform, index) => {
      expect(radios[index].attributes('value')).toBe(platform)
    })
  })

  it('should have X platform selected by default', () => {
    const wrapper = mount(ArticleInput, { global: { stubs: globalStubs } })
    const radios = wrapper.findAll('input[type="radio"]')
    const xRadio = radios.find((radio) => radio.attributes('value') === 'X')
    expect((xRadio?.element as HTMLInputElement).checked).toBe(true)
  })

  it('should disable extract button when URL is empty', () => {
    const wrapper = mount(ArticleInput, { global: { stubs: globalStubs } })
    const button = wrapper.find('button')
    expect(button.attributes('disabled')).toBeDefined()
  })

  it('should enable extract button when URL is provided', async () => {
    const wrapper = mount(ArticleInput, { global: { stubs: globalStubs } })
    const input = wrapper.find('#article-url')
    const button = wrapper.find('button')

    await input.setValue('https://iamjeremie.me/post/2026-01/test/')
    await wrapper.vm.$nextTick()

    expect(button.attributes('disabled')).toBeUndefined()
  })

  it('should call extractArticle when button is clicked with valid URL', async () => {
    const wrapper = mount(ArticleInput, { global: { stubs: globalStubs } })
    const input = wrapper.find('#article-url')
    const button = wrapper.find('button')

    const testUrl = 'https://iamjeremie.me/post/2026-01/test/'
    await input.setValue(testUrl)
    await button.trigger('click')

    expect(extractArticle).toHaveBeenCalledWith(testUrl)
  })

  it('should trim URL before calling extractArticle', async () => {
    const wrapper = mount(ArticleInput, { global: { stubs: globalStubs } })
    const input = wrapper.find('#article-url')
    const button = wrapper.find('button')

    const testUrl = '  https://iamjeremie.me/post/2026-01/test/  '
    await input.setValue(testUrl)
    await button.trigger('click')

    expect(extractArticle).toHaveBeenCalledWith(testUrl.trim())
  })

  it('should disable input and button when loading', async () => {
    extractionState.value.status = 'loading'
    const wrapper = mount(ArticleInput, { global: { stubs: globalStubs } })

    const input = wrapper.find('#article-url')
    const button = wrapper.find('button')

    expect(input.attributes('disabled')).toBeDefined()
    expect(button.attributes('disabled')).toBeDefined()
  })

  it('should show "Extracting..." text when loading', () => {
    extractionState.value.status = 'loading'
    const wrapper = mount(ArticleInput, { global: { stubs: globalStubs } })

    const button = wrapper.find('button')
    expect(button.text()).toBe('Extracting...')
  })

  it('should show "Extract Article" text when not loading', () => {
    const wrapper = mount(ArticleInput, { global: { stubs: globalStubs } })
    const button = wrapper.find('button')
    expect(button.text()).toBe('Extract Article')
  })

  it('should display error message when status is error', () => {
    extractionState.value.status = 'error'
    extractionState.value.error = 'Failed to fetch article'

    const wrapper = mount(ArticleInput, { global: { stubs: globalStubs } })

    // Find the error div and check it contains the error message
    const errorText = wrapper.text()
    expect(errorText).toContain('Failed to fetch article')
  })

  it('should not display error when status is not error', () => {
    extractionState.value.status = 'success'
    extractionState.value.error = 'Some old error'

    const wrapper = mount(ArticleInput, { global: { stubs: globalStubs } })
    const errorDiv = wrapper.find('.text-destructive')

    expect(errorDiv.exists()).toBe(false)
  })

  it('should update selected platform when radio button is clicked', async () => {
    const wrapper = mount(ArticleInput, { global: { stubs: globalStubs } })
    const radios = wrapper.findAll('input[type="radio"]')
    const linkedInRadio = radios.find((radio) => radio.attributes('value') === 'LinkedIn')

    await linkedInRadio?.setValue()
    await wrapper.vm.$nextTick()

    expect((linkedInRadio?.element as HTMLInputElement).checked).toBe(true)
  })

  it('should disable all radio buttons when loading', () => {
    extractionState.value.status = 'loading'
    const wrapper = mount(ArticleInput, { global: { stubs: globalStubs } })

    const radios = wrapper.findAll('input[type="radio"]')
    radios.forEach((radio) => {
      expect(radio.attributes('disabled')).toBeDefined()
    })
  })

  it('should not call extractArticle when button is clicked without URL', async () => {
    const wrapper = mount(ArticleInput, { global: { stubs: globalStubs } })
    const button = wrapper.find('button')

    await button.trigger('click')

    expect(extractArticle).not.toHaveBeenCalled()
  })

  it('should not call extractArticle when button is clicked during loading', async () => {
    // Set loading state before mounting
    extractionState.value.status = 'loading'

    const wrapper = mount(ArticleInput, { global: { stubs: globalStubs } })
    const input = wrapper.find('#article-url')

    // Even with a URL, button should be disabled during loading
    await input.setValue('https://iamjeremie.me/post/2026-01/test/')
    await wrapper.vm.$nextTick()

    const button = wrapper.find('button')
    expect(button.attributes('disabled')).toBeDefined()

    // Clicking disabled button should not call extractArticle
    await button.trigger('click')
    expect(extractArticle).not.toHaveBeenCalled()
  })
})
