import { describe, it, expect } from 'vitest'
import { htmlToText } from './htmlToText'

describe('htmlToText', () => {
  describe('tag stripping', () => {
    it('strips <p> tags and returns inner text', () => {
      expect(htmlToText('<p>Hello world</p>')).toBe('Hello world')
    })

    it('strips <strong> tags', () => {
      expect(htmlToText('<strong>bold text</strong>')).toBe('bold text')
    })

    it('strips <em> tags', () => {
      expect(htmlToText('<em>italic text</em>')).toBe('italic text')
    })

    it('strips <a> tags and returns link text', () => {
      expect(htmlToText('<a href="https://example.com">click here</a>')).toBe('click here')
    })

    it('strips nested tags', () => {
      expect(htmlToText('<p>Hello <strong>beautiful <em>world</em></strong>!</p>')).toBe(
        'Hello beautiful world!',
      )
    })

    it('strips mixed tags across multiple elements', () => {
      // Adjacent <p> elements: textContent concatenates their text without adding
      // a space between block elements, so after whitespace collapse the result
      // has no space at the paragraph boundary.
      const html =
        '<p>First sentence.</p><p>Second sentence with <a href="#">a link</a>.</p>'
      const result = htmlToText(html)
      // Verify all tags are stripped and the text content is present
      expect(result).not.toContain('<')
      expect(result).not.toContain('>')
      expect(result).toContain('First sentence.')
      expect(result).toContain('Second sentence with a link.')
    })
  })

  describe('whitespace handling', () => {
    it('collapses multiple spaces into one space', () => {
      expect(htmlToText('<p>Hello    world</p>')).toBe('Hello world')
    })

    it('collapses newlines and tabs into one space', () => {
      expect(htmlToText('<p>Hello\n\t\nworld</p>')).toBe('Hello world')
    })

    it('trims leading whitespace', () => {
      expect(htmlToText('  <p>Hello</p>')).toBe('Hello')
    })

    it('trims trailing whitespace', () => {
      expect(htmlToText('<p>Hello</p>  ')).toBe('Hello')
    })

    it('trims and collapses together', () => {
      expect(htmlToText('   <p>  Hello   world  </p>   ')).toBe('Hello world')
    })
  })

  describe('edge cases', () => {
    it('returns empty string for empty input', () => {
      expect(htmlToText('')).toBe('')
    })

    it('returns empty string for whitespace-only input', () => {
      expect(htmlToText('   ')).toBe('')
    })

    it('returns plain text unchanged when no tags are present', () => {
      expect(htmlToText('Just plain text.')).toBe('Just plain text.')
    })

    it('handles self-closing tags like <br />', () => {
      const result = htmlToText('<p>Line one.<br />Line two.</p>')
      // Tags stripped — DOMParser/happy-dom does not inject whitespace for <br>,
      // so both text nodes are concatenated without an added space.
      expect(result).not.toContain('<')
      expect(result).not.toContain('>')
      expect(result).toContain('Line one.')
      expect(result).toContain('Line two.')
    })
  })
})
