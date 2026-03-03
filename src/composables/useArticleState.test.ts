import { describe, it, expect, beforeEach } from 'vitest'
import { useArticleState } from './useArticleState'
import type { Article } from '@/types/article'

describe('useArticleState', () => {
  // Reset state before each test by setting it back to initial values
  beforeEach(() => {
    const { extractionState } = useArticleState()
    extractionState.value = {
      status: 'idle',
      article: null,
      error: null,
      manualIntroduction: '',
      selectedPlatform: null,
    }
  })

  it('should initialize with correct default state', () => {
    const { extractionState } = useArticleState()

    expect(extractionState.value).toEqual({
      status: 'idle',
      article: null,
      error: null,
      manualIntroduction: '',
      selectedPlatform: null,
    })
  })

  it('should be reactive when status changes', () => {
    const { extractionState } = useArticleState()

    extractionState.value.status = 'loading'
    expect(extractionState.value.status).toBe('loading')

    extractionState.value.status = 'success'
    expect(extractionState.value.status).toBe('success')

    extractionState.value.status = 'error'
    expect(extractionState.value.status).toBe('error')

    extractionState.value.status = 'missing-introduction'
    expect(extractionState.value.status).toBe('missing-introduction')
  })

  it('should be reactive when article is set', () => {
    const { extractionState } = useArticleState()

    const mockArticle: Article = {
      url: 'https://example.com/article',
      blog: 'english',
      title: 'Test Article',
      description: 'Test description',
      imageUrl: 'https://example.com/image.jpg',
      imageAlt: 'Test image',
      imageCaption: 'Test caption',
      introduction: '<p>Test introduction</p>',
      category: 'Technology',
      tags: ['vue', 'testing'],
      followMeSnippet: '<p>Follow me snippet</p>',
      imageCreditSnippet: 'Photo by Test',
    }

    extractionState.value.article = mockArticle
    expect(extractionState.value.article).toEqual(mockArticle)
    expect(extractionState.value.article?.title).toBe('Test Article')
  })

  it('should be reactive when error is set', () => {
    const { extractionState } = useArticleState()

    extractionState.value.error = 'Failed to fetch article'
    expect(extractionState.value.error).toBe('Failed to fetch article')

    extractionState.value.error = null
    expect(extractionState.value.error).toBeNull()
  })

  it('should be reactive when manualIntroduction changes', () => {
    const { extractionState } = useArticleState()

    extractionState.value.manualIntroduction = 'User-provided introduction'
    expect(extractionState.value.manualIntroduction).toBe('User-provided introduction')
  })

  it('should follow singleton pattern - multiple calls share same state', () => {
    const instance1 = useArticleState()
    const instance2 = useArticleState()

    // Modify state through instance1
    instance1.extractionState.value.status = 'loading'
    instance1.extractionState.value.manualIntroduction = 'Shared state test'

    // Verify instance2 sees the same changes
    expect(instance2.extractionState.value.status).toBe('loading')
    expect(instance2.extractionState.value.manualIntroduction).toBe('Shared state test')

    // Both instances should reference the same object
    expect(instance1.extractionState).toBe(instance2.extractionState)
  })

  it('should persist state across multiple composable calls', () => {
    // First call - set some state
    const { extractionState: state1 } = useArticleState()
    state1.value.status = 'success'
    state1.value.error = 'Some error'

    // Second call - should see persisted state
    const { extractionState: state2 } = useArticleState()
    expect(state2.value.status).toBe('success')
    expect(state2.value.error).toBe('Some error')
  })

  it('should handle complex state updates', () => {
    const { extractionState } = useArticleState()

    // Simulate a complete extraction flow
    extractionState.value.status = 'loading'
    expect(extractionState.value.status).toBe('loading')

    const mockArticle: Article = {
      url: 'https://jeremielitzler.fr/article',
      blog: 'french',
      title: 'Article en français',
      description: 'Une description',
      imageUrl: 'https://example.com/image.jpg',
      imageAlt: 'Image test',
      imageCaption: null,
      introduction: '<p>Introduction</p>',
      category: 'Technologie',
      tags: ['vue', 'test'],
      followMeSnippet: '<p>Snippet</p>',
      imageCreditSnippet: null,
    }

    extractionState.value = {
      status: 'success',
      article: mockArticle,
      error: null,
      manualIntroduction: '',
      selectedPlatform: null,
    }

    expect(extractionState.value.status).toBe('success')
    expect(extractionState.value.article?.blog).toBe('french')
    expect(extractionState.value.error).toBeNull()
  })

  it('should handle missing-introduction scenario', () => {
    const { extractionState } = useArticleState()

    extractionState.value.status = 'missing-introduction'
    extractionState.value.manualIntroduction = 'User typed this introduction manually'

    expect(extractionState.value.status).toBe('missing-introduction')
    expect(extractionState.value.manualIntroduction).toBe('User typed this introduction manually')
  })
})
