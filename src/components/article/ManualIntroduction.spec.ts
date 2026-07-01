import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import ManualIntroduction from './ManualIntroduction.vue'
import { useArticleState } from '@/composables/useArticleState'

vi.mock('@/composables/useArticleState')

const globalStubs = {
  Textarea: {
    template:
      '<textarea v-bind="$attrs" @input="$emit(\'update:modelValue\', $event.target.value)"></textarea>',
  },
  Button: {
    template: '<button v-bind="$attrs"><slot /></button>',
  },
}

// The two cause-specific messages the composable carries into missing-introduction.
const NO_HEADING_MESSAGE =
  'The source article has no <h2> section heading, so the end of the introduction cannot be located. Update the source article to use <h2> for its section headings.'
const EMPTY_INTRODUCTION_MESSAGE =
  'The source article has no introduction before its first <h2> section heading. Add an introduction to the source article, or enter one manually below.'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mountWithError(error: string): any {
  const extractionState = ref({
    status: 'missing-introduction',
    article: null,
    error,
    manualIntroduction: '',
    selectedPlatform: null,
  })
  vi.mocked(useArticleState).mockReturnValue({ extractionState, resetState: vi.fn() })
  const wrapper = mount(ManualIntroduction, { global: { stubs: globalStubs } })
  return { wrapper, extractionState }
}

describe('ManualIntroduction — issue #112 missing-introduction fallback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // TC-2 — the no-<h2> message is rendered as-is (escaped) in the fallback
  it('renders the no-<h2> cause message', () => {
    const { wrapper } = mountWithError(NO_HEADING_MESSAGE)
    const text = wrapper.text()

    expect(text).toContain('cannot be located')
    expect(text).toContain('<h2>')
    expect(text).not.toMatch(/paragraph/i)
  })

  // TC-5 — the distinct empty-introduction message is rendered in the same fallback
  it('renders the empty-introduction cause message', () => {
    const { wrapper } = mountWithError(EMPTY_INTRODUCTION_MESSAGE)
    const text = wrapper.text()

    expect(text).toContain('no introduction')
    expect(text).toContain('manually')
  })

  // TC-6 — manual entry is offered as the immediate workaround for either cause
  it('offers the manual-entry textarea and continue button as the workaround', () => {
    const { wrapper } = mountWithError(EMPTY_INTRODUCTION_MESSAGE)

    expect(wrapper.find('#manual-intro').exists()).toBe(true)
    expect(wrapper.find('button').text()).toBe('Continue with Manual Introduction')
  })

  // TC-6 — typing an introduction and confirming reaches the success state
  it('reaches the success state when the user confirms a typed introduction', async () => {
    const { wrapper, extractionState } = mountWithError(NO_HEADING_MESSAGE)
    extractionState.value.manualIntroduction = 'A manually entered introduction'
    await wrapper.vm.$nextTick()

    await wrapper.find('button').trigger('click')

    expect(extractionState.value.status).toBe('success')
  })

  // TC-6 guard — an empty manual introduction keeps the fallback (no accidental proceed)
  it('stays in the missing-introduction state when the manual field is empty', async () => {
    const { wrapper, extractionState } = mountWithError(NO_HEADING_MESSAGE)

    await wrapper.find('button').trigger('click')

    expect(extractionState.value.status).toBe('missing-introduction')
  })
})
