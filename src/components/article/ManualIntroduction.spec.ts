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

// The reworded issue-112 message carried into the missing-introduction state.
const MISSING_H2_MESSAGE =
  'The source article has no <h2> section heading, so the end of the introduction cannot be located. Update the source article to use <h2> for its section headings.'

describe('ManualIntroduction — issue #112 missing-introduction fallback', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let extractionState: any

  beforeEach(() => {
    extractionState = ref({
      status: 'missing-introduction',
      article: null,
      error: MISSING_H2_MESSAGE,
      manualIntroduction: '',
      selectedPlatform: null,
    })
    vi.mocked(useArticleState).mockReturnValue({ extractionState, resetState: vi.fn() })
  })

  // TC-2 — the rendered message names the <h2> cause, not a missing-paragraphs claim
  it('renders the missing-<h2> cause and no missing-paragraphs claim', () => {
    const wrapper = mount(ManualIntroduction, { global: { stubs: globalStubs } })
    const text = wrapper.text()

    expect(text).toContain('<h2>')
    expect(text).toContain('section heading')
    expect(text).not.toMatch(/paragraph/i)
  })

  // TC-4 (R3) — manual entry is offered as the immediate workaround alongside the message
  it('offers the manual-entry textarea and continue button as the workaround', () => {
    const wrapper = mount(ManualIntroduction, { global: { stubs: globalStubs } })

    expect(wrapper.find('#manual-intro').exists()).toBe(true)
    expect(wrapper.find('button').text()).toBe('Continue with Manual Introduction')
  })

  // TC-4 — typing an introduction and confirming reaches the success state
  it('reaches the success state when the user confirms a typed introduction', async () => {
    extractionState.value.manualIntroduction = 'A manually entered introduction'
    const wrapper = mount(ManualIntroduction, { global: { stubs: globalStubs } })
    await wrapper.vm.$nextTick()

    await wrapper.find('button').trigger('click')

    expect(extractionState.value.status).toBe('success')
  })

  // TC-4 guard — an empty manual introduction keeps the fallback (no accidental proceed)
  it('stays in the missing-introduction state when the manual field is empty', async () => {
    const wrapper = mount(ManualIntroduction, { global: { stubs: globalStubs } })

    await wrapper.find('button').trigger('click')

    expect(extractionState.value.status).toBe('missing-introduction')
  })
})
