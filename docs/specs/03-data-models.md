# Data Models

## Core Types

### ArticleURL

The raw input from the user.

```ts
type ArticleURL = string
```

### Blog

Represents the source blog language/origin.

```ts
type Blog = 'english' | 'french'
```

### Platform

The supported social media platforms.

```ts
type Platform = 'X' | 'LinkedIn' | 'Medium' | 'Substack'
```

### Article

The extracted data from a source blog article.

```ts
// See FR-2 for CSS selector on properties below except url and blog
interface Article {
  url: string // Original URL without UTM tags
  blog: Blog // Detected from URL domain
  title: string
  description: string
  imageUrl: string
  imageAlt: string
  imageCaption: string | null // Optional caption under featured image
  introduction: string
  category: string
  tags: string[]
  followMeSnippet: string
  imageCreditSnippet: string | null
```

### ExtractionState

Represents the state of the article extraction process.

```ts
type ExtractionStatus = 'idle' | 'loading' | 'missing-introduction' | 'success' | 'error'

interface ExtractionState {
  status: ExtractionStatus
  article: Article | null
  error: string | null
  // Used when status is 'missing-introduction'
  // User can type the introduction manually in a texarea
  manualIntroduction: string
}
```

### PlatformContent

The generated output for a given platform, ready to copy.

```ts
interface XContent {
  chunks: string[] // 280-char chunks, each copyable individually
}

interface LinkedInContent {
  body: string // Introduction + arrow + UTM link
}

interface MediumContent {
  title: string
  description: string
  imageAlt: string
  imageCaption: string
  bodyHtml: string // Full HTML body ready to paste
  canonicalUrl: string // Without UTM tags
  category: string
  tags: string[]
}

interface SubstackContent {
  title: string
  description: string
  bodyHtml: string // Full HTML body ready to paste, including image, alt text and its caption, when applicable
  category: string
  tags: string[]
}
```

## UTM Link Shape

```ts
interface UTMParams {
  url: string // Base article URL
  medium: 'social' // Always 'social'
  source: Platform // Platform name
}
```

## Configurable Snippets Shape

```ts
// src/config/snippets.ts
interface Snippets {
  mediumNoFullArticle: string // "Why I don't share full article" text
  substackShareArticle: string
}
```

## Notes

- `introduction` is stored as HTML to preserve paragraph structure
  when injected into Medium and Substack body HTML
- `followMeSnippet` and `imageCreditSnippet` are extracted as raw HTML
  from the last two children of `<section class="article-content">`
- `blog` language detection is based on URL domain:
  - English blog: `iamjeremie.me`
  - French blog: `jeremielitzler.fr`
- Image alt text source to be confirmed during implementation
  (og:image has no alt — may need to extract from first `<img>` in article body)
