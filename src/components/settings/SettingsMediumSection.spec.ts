/**
 * Issue #132 — Settings UI for the Medium anchor fields.
 *
 * Covers TC-11 (the two new EN/FR anchor fields exist and show their values),
 * TC-12 (editing a field updates the bound model), and TC-13 (saved values with
 * HTML-like characters render as inert text-input values, never as markup).
 */
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SettingsMediumSection from './SettingsMediumSection.vue'

function mountSection(overrides: Record<string, string> = {}) {
  return mount(SettingsMediumSection, {
    props: {
      EN_MEDIUM_UTM_ANCHOR: 'EN anchor value',
      FR_MEDIUM_UTM_ANCHOR: 'FR anchor value',
      EN_WHY_HEADING: 'EN heading',
      EN_WHY_BODY_HTML: '<p>EN body</p>',
      FR_WHY_HEADING: 'FR heading',
      FR_WHY_BODY_HTML: '<p>FR body</p>',
      ...overrides,
    },
  })
}

describe('SettingsMediumSection — Medium anchor fields', () => {
  it('TC-11: exposes an English and a French anchor text field labelled as UTM link anchor text', () => {
    const wrapper = mountSection()

    const enInput = wrapper.find<HTMLInputElement>('#EN_MEDIUM_UTM_ANCHOR')
    const frInput = wrapper.find<HTMLInputElement>('#FR_MEDIUM_UTM_ANCHOR')
    expect(enInput.exists()).toBe(true)
    expect(frInput.exists()).toBe(true)
    expect(enInput.attributes('type')).toBe('text')
    expect(frInput.attributes('type')).toBe('text')

    const enLabel = wrapper.find('label[for="EN_MEDIUM_UTM_ANCHOR"]')
    const frLabel = wrapper.find('label[for="FR_MEDIUM_UTM_ANCHOR"]')
    expect(enLabel.text()).toContain('UTM link anchor text')
    expect(frLabel.text()).toContain('UTM link anchor text')
  })

  it('TC-11: each anchor field displays its current snippet value', () => {
    const wrapper = mountSection()
    expect(wrapper.find<HTMLInputElement>('#EN_MEDIUM_UTM_ANCHOR').element.value).toBe(
      'EN anchor value',
    )
    expect(wrapper.find<HTMLInputElement>('#FR_MEDIUM_UTM_ANCHOR').element.value).toBe(
      'FR anchor value',
    )
  })

  it('TC-12: editing the French anchor field updates its bound model, leaving English untouched', async () => {
    const wrapper = mountSection()
    await wrapper.find('#FR_MEDIUM_UTM_ANCHOR').setValue('Nouveau texte du lien')

    expect(wrapper.emitted('update:FR_MEDIUM_UTM_ANCHOR')).toBeTruthy()
    expect(wrapper.emitted('update:FR_MEDIUM_UTM_ANCHOR')?.at(-1)).toEqual([
      'Nouveau texte du lien',
    ])
    expect(wrapper.emitted('update:EN_MEDIUM_UTM_ANCHOR')).toBeFalsy()
  })

  it('TC-13: a saved value with HTML-like characters shows as an inert text-input value', () => {
    const wrapper = mountSection({ EN_MEDIUM_UTM_ANCHOR: '<b>x</b>' })

    const enInput = wrapper.find<HTMLInputElement>('#EN_MEDIUM_UTM_ANCHOR')
    // The characters appear literally in the input value, not as active DOM.
    expect(enInput.element.value).toBe('<b>x</b>')
    // No <b> element is created from the value.
    expect(wrapper.find('b').exists()).toBe(false)
  })

  it('TC-13: a script-like saved value is not executed or rendered as markup', () => {
    const wrapper = mountSection({ FR_MEDIUM_UTM_ANCHOR: '"><script>alert(1)</script>' })

    expect(wrapper.find<HTMLInputElement>('#FR_MEDIUM_UTM_ANCHOR').element.value).toBe(
      '"><script>alert(1)</script>',
    )
    expect(wrapper.find('script').exists()).toBe(false)
  })
})
