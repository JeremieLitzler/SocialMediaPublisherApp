import { describe, it, expect } from 'vitest'
import { generateUTMLink } from './utm'
import type { Platform } from '@/types/article'

describe('utm', () => {
  describe('generateUTMLink', () => {
    const baseUrl = 'https://example.com/article'
    const platforms: Platform[] = ['X', 'LinkedIn', 'Medium', 'Substack']

    describe('URL without existing query parameters', () => {
      it('should add UTM parameters with ? separator', () => {
        const result = generateUTMLink(baseUrl, 'X')
        expect(result).toBe('https://example.com/article?utm_medium=social&utm_source=X')
      })

      it('should work for X platform', () => {
        const result = generateUTMLink(baseUrl, 'X')
        expect(result).toContain('utm_medium=social')
        expect(result).toContain('utm_source=X')
      })

      it('should work for LinkedIn platform', () => {
        const result = generateUTMLink(baseUrl, 'LinkedIn')
        expect(result).toContain('utm_medium=social')
        expect(result).toContain('utm_source=LinkedIn')
      })

      it('should work for Medium platform', () => {
        const result = generateUTMLink(baseUrl, 'Medium')
        expect(result).toContain('utm_medium=social')
        expect(result).toContain('utm_source=Medium')
      })

      it('should work for Substack platform', () => {
        const result = generateUTMLink(baseUrl, 'Substack')
        expect(result).toContain('utm_medium=social')
        expect(result).toContain('utm_source=Substack')
      })
    })

    describe('URL with existing query parameters', () => {
      it('should append UTM parameters with & separator', () => {
        const urlWithParams = 'https://example.com/article?lang=en'
        const result = generateUTMLink(urlWithParams, 'X')
        expect(result).toBe('https://example.com/article?lang=en&utm_medium=social&utm_source=X')
      })

      it('should preserve existing parameters', () => {
        const urlWithParams = 'https://example.com/article?lang=en&theme=dark'
        const result = generateUTMLink(urlWithParams, 'LinkedIn')
        expect(result).toContain('lang=en')
        expect(result).toContain('theme=dark')
        expect(result).toContain('utm_medium=social')
        expect(result).toContain('utm_source=LinkedIn')
      })
    })

    describe('URL with hash fragment', () => {
      it('should preserve hash and add UTM params before it', () => {
        const urlWithHash = 'https://example.com/article#section'
        const result = generateUTMLink(urlWithHash, 'Medium')
        expect(result).toContain('utm_medium=social')
        expect(result).toContain('utm_source=Medium')
        expect(result.endsWith('#section')).toBe(true)
      })

      it('should handle hash fragment correctly', () => {
        const urlWithHash = 'https://example.com/article#introduction'
        const result = generateUTMLink(urlWithHash, 'X')
        const [urlPart, hashPart] = result.split('#')
        expect(urlPart).toContain('utm_medium=social')
        expect(urlPart).toContain('utm_source=X')
        expect(hashPart).toBe('introduction')
      })
    })

    describe('URL with both query parameters and hash', () => {
      it('should handle params and hash together', () => {
        const complexUrl = 'https://example.com/article?lang=en#section'
        const result = generateUTMLink(complexUrl, 'Substack')
        expect(result).toContain('lang=en')
        expect(result).toContain('utm_medium=social')
        expect(result).toContain('utm_source=Substack')
        expect(result.endsWith('#section')).toBe(true)
      })

      it('should preserve correct order', () => {
        const complexUrl = 'https://example.com/article?page=1&sort=date#comments'
        const result = generateUTMLink(complexUrl, 'LinkedIn')
        expect(result).toMatch(/\?page=1&sort=date&utm_medium=social&utm_source=LinkedIn#comments/)
      })
    })

    describe('UTM parameter values', () => {
      it('should always use "social" as utm_medium', () => {
        platforms.forEach((platform) => {
          const result = generateUTMLink(baseUrl, platform)
          expect(result).toContain('utm_medium=social')
        })
      })

      it('should use platform name as utm_source', () => {
        const platformTests: Record<Platform, string> = {
          X: 'utm_source=X',
          LinkedIn: 'utm_source=LinkedIn',
          Medium: 'utm_source=Medium',
          Substack: 'utm_source=Substack',
        }

        Object.entries(platformTests).forEach(([platform, expectedParam]) => {
          const result = generateUTMLink(baseUrl, platform as Platform)
          expect(result).toContain(expectedParam)
        })
      })
    })

    describe('URL structure preservation', () => {
      it('should preserve protocol', () => {
        const httpsUrl = 'https://example.com/article'
        const httpUrl = 'http://example.com/article'

        expect(generateUTMLink(httpsUrl, 'X').startsWith('https://')).toBe(true)
        expect(generateUTMLink(httpUrl, 'X').startsWith('http://')).toBe(true)
      })

      it('should preserve domain', () => {
        const url1 = 'https://blog.example.com/article'
        const url2 = 'https://example.org/post'

        expect(generateUTMLink(url1, 'X')).toContain('blog.example.com')
        expect(generateUTMLink(url2, 'X')).toContain('example.org')
      })

      it('should preserve path', () => {
        const url = 'https://example.com/blog/2024/article-title'
        const result = generateUTMLink(url, 'X')
        expect(result).toContain('/blog/2024/article-title')
      })
    })

    describe('edge cases', () => {
      it('should handle URLs with port numbers', () => {
        const urlWithPort = 'https://example.com:8080/article'
        const result = generateUTMLink(urlWithPort, 'X')
        expect(result).toContain('example.com:8080')
        expect(result).toContain('utm_medium=social')
      })

      it('should handle URLs with special characters in path', () => {
        const urlWithSpecialChars = 'https://example.com/article-with-dashes_and_underscores'
        const result = generateUTMLink(urlWithSpecialChars, 'LinkedIn')
        expect(result).toContain('article-with-dashes_and_underscores')
        expect(result).toContain('utm_medium=social')
      })

      it('should overwrite existing UTM parameters if present', () => {
        const urlWithExistingUTM = 'https://example.com/article?utm_medium=email&utm_source=newsletter'
        const result = generateUTMLink(urlWithExistingUTM, 'X')
        expect(result).toContain('utm_medium=social')
        expect(result).toContain('utm_source=X')
        expect(result).not.toContain('utm_medium=email')
        expect(result).not.toContain('utm_source=newsletter')
      })

      it('should handle invalid URLs gracefully with fallback', () => {
        // Pass an invalid URL that will cause URL constructor to fail
        // In the fallback, it should still append parameters
        const invalidUrl = 'not-a-valid-url'
        const result = generateUTMLink(invalidUrl, 'X')
        expect(result).toContain('utm_medium=social')
        expect(result).toContain('utm_source=X')
      })

      it('should use correct separator in fallback for URL without params', () => {
        const invalidUrl = 'invalid-url'
        const result = generateUTMLink(invalidUrl, 'Medium')
        expect(result).toBe('invalid-url?utm_medium=social&utm_source=Medium')
      })

      it('should use correct separator in fallback for URL with params', () => {
        const invalidUrl = 'invalid-url?existing=param'
        const result = generateUTMLink(invalidUrl, 'LinkedIn')
        expect(result).toBe('invalid-url?existing=param&utm_medium=social&utm_source=LinkedIn')
      })
    })
  })
})
