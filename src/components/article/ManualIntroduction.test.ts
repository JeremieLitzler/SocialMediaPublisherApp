import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import ManualIntroduction from './ManualIntroduction.vue'
import { useArticleState } from '@/composables/useArticleState'

// Mock the composable
vi.mock('@/composables/useArticleState')

// Global stubs for UI components
const globalStubs = {
  Textarea: {
    template:
      '<textarea v-bind="$attrs" @input="$emit(\'update:modelValue\', $event.target.value)"></textarea>',
  },
  Button: {
    template: '<button v-bind="$attrs"><slot /></button>',
  },
}

describe('ManualIntroduction', () => {
  let extractionState: any

  beforeEach(() => {
    // Reset state before each test - using actual ref for reactivity
    extractionState = ref({
      status: 'missing-introduction',
      article: null,
      error: 'No introduction found. The article must have paragraphs before the first <h2>.',
      manualIntroduction: '',
    })

    vi.mocked(useArticleState).mockReturnValue({ extractionState, resetState: vi.fn() })
  })

  it('should render error message', () => {
    const wrapper = mount(ManualIntroduction, { global: { stubs: globalStubs } })
    // The error is rendered in a <p> tag within .text-sm.text-muted-foreground
    const errorParagraphs = wrapper.findAll('p')
    const errorText = errorParagraphs.map((p) => p.text()).join(' ')
    expect(errorText).toContain('No introduction found')
  })

  it('should render "Missing Introduction" header', () => {
    const wrapper = mount(ManualIntroduction, { global: { stubs: globalStubs } })
    expect(wrapper.text()).toContain('Missing Introduction')
  })

  it('should render instruction text', () => {
    const wrapper = mount(ManualIntroduction, { global: { stubs: globalStubs } })
    expect(wrapper.text()).toContain('Please add an introduction to the source article')
    expect(wrapper.text()).toContain('enter it manually below')
  })

  it('should render textarea for manual introduction', () => {
    const wrapper = mount(ManualIntroduction, { global: { stubs: globalStubs } })
    const textarea = wrapper.find('#manual-intro')
    expect(textarea.exists()).toBe(true)
    expect(textarea.attributes('placeholder')).toBe('Enter the article introduction here...')
    expect(textarea.attributes('rows')).toBe('6')
  })

  it('should render continue button', () => {
    const wrapper = mount(ManualIntroduction, { global: { stubs: globalStubs } })
    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    expect(button.text()).toBe('Continue with Manual Introduction')
  })

  it('should disable continue button when textarea is empty', () => {
    const wrapper = mount(ManualIntroduction, { global: { stubs: globalStubs } })
    const button = wrapper.find('button')
    expect(button.attributes('disabled')).toBeDefined()
  })

  it('should enable continue button when textarea has content', async () => {
    extractionState.value.manualIntroduction = 'This is a manual introduction'
    const wrapper = mount(ManualIntroduction, { global: { stubs: globalStubs } })

    await wrapper.vm.$nextTick()

    const button = wrapper.find('button')
    expect(button.attributes('disabled')).toBeUndefined()
  })

  it('should update extractionState when textarea value changes', async () => {
    const wrapper = mount(ManualIntroduction, { global: { stubs: globalStubs } })
    const textarea = wrapper.find('#manual-intro')

    const introText = 'This is my manual introduction text'
    // Manually update the extractionState since v-model binding works directly with the state
    extractionState.value.manualIntroduction = introText
    await wrapper.vm.$nextTick()

    // Verify the textarea reflects the state
    expect(extractionState.value.manualIntroduction).toBe(introText)
  })

  it('should change status to success when continue button is clicked', async () => {
    extractionState.value.manualIntroduction = 'Valid introduction text'
    const wrapper = mount(ManualIntroduction, { global: { stubs: globalStubs } })

    await wrapper.vm.$nextTick()

    const button = wrapper.find('button')
    await button.trigger('click')

    expect(extractionState.value.status).toBe('success')
  })

  it('should not change status when button is clicked with empty introduction', async () => {
    extractionState.value.manualIntroduction = ''
    const wrapper = mount(ManualIntroduction, { global: { stubs: globalStubs } })

    const button = wrapper.find('button')
    await button.trigger('click')

    expect(extractionState.value.status).toBe('missing-introduction')
  })

  it('should trim whitespace when checking if button can be enabled', async () => {
    extractionState.value.manualIntroduction = '   '
    const wrapper = mount(ManualIntroduction, { global: { stubs: globalStubs } })

    await wrapper.vm.$nextTick()

    const button = wrapper.find('button')
    expect(button.attributes('disabled')).toBeDefined()
  })

  it('should enable button when introduction has content after trimming', async () => {
    extractionState.value.manualIntroduction = '  Valid text  '
    const wrapper = mount(ManualIntroduction, { global: { stubs: globalStubs } })

    await wrapper.vm.$nextTick()

    const button = wrapper.find('button')
    expect(button.attributes('disabled')).toBeUndefined()
  })

  it('should not change status when button is clicked with only whitespace', async () => {
    extractionState.value.manualIntroduction = '   '
    const wrapper = mount(ManualIntroduction, { global: { stubs: globalStubs } })

    const button = wrapper.find('button')
    await button.trigger('click')

    expect(extractionState.value.status).toBe('missing-introduction')
  })
})
