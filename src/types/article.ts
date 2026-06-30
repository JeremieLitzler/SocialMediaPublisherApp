/**
 * Core type definitions for article extraction and platform content generation
 */

/**
 * Raw article URL input from user
 */
export type ArticleURL = string

/**
 * Source blog language/origin
 * - 'english': iamjeremie.me
 * - 'french': jeremielitzler.fr
 */
export type Blog = 'english' | 'french'

/**
 * Supported social media platforms for content generation
 */
export type Platform = 'X' | 'LinkedIn' | 'Medium' | 'Substack'

/**
 * Extracted data from a source blog article
 * See FR-2 in requirements for CSS selector details
 */
export interface Article {
  /** Original URL without UTM tags */
  url: string
  /** Detected from URL domain */
  blog: Blog
  /** Article title (from og:title or .article-title a) */
  title: string
  /** Article description (from og:description or .article-subtitle) */
  description: string
  /** Featured image URL (from og:image or .article-image a img) */
  imageUrl: string
  /** Alt text for featured image */
  imageAlt: string
  /** Optional caption under featured image */
  imageCaption: string | null
  /** Introduction text (all <p> tags before first <h2>) - stored as HTML */
  introduction: string
  /** Category (from <header class="article-category"> <a> elements) */
  category: string
  /** Tags (from <section class="article-tags"> <a> elements) */
  tags: string[]
  /** Follow-me snippet extracted from article-content */
  followMeSnippet: string
  /** Image credit text if present (last <p> starting with "Photo by"/"Photo de"), otherwise null */
  imageCreditSnippet: string | null
}

/**
 * Status of the article extraction process
 */
export type ExtractionStatus = 'idle' | 'loading' | 'missing-introduction' | 'success' | 'error'

/**
 * State tracking for article extraction
 */
export interface ExtractionState {
  /** Current extraction status */
  status: ExtractionStatus
  /** Extracted article data, null until successful extraction */
  article: Article | null
  /** Error message if extraction failed */
  error: string | null
  /** Manual introduction input when status is 'missing-introduction' */
  manualIntroduction: string
  /** Platform selected by the user at extraction time */
  selectedPlatform: Platform | null
}

/**
 * A single rendered introduction block (paragraph, unordered/ordered list,
 * blockquote, or code block) converted to plain text for LinkedIn/X.
 *
 * `text` already carries the per-type formatting (bullets, numbering, quote
 * prefixes, code fences) with list items / quote lines joined by `\n`.
 * `isParagraph` is true only for paragraphs — the sentence-splittable blocks;
 * every other block type is atomic (`false`) and never split or merged.
 */
export interface IntroductionBlock {
  /** Rendered plain text for this block, formatted per its source type */
  text: string
  /** True for paragraphs (sentence-splittable); false for atomic blocks */
  isParagraph: boolean
}

/**
 * A single X (Twitter) chunk with optional oversized warning flag.
 * The `text` field holds the fully formatted chunk (with arrow/UTM suffix).
 * The `oversized` flag is true when the source paragraph exceeds 280 characters
 * and contains no sentence boundary that would allow splitting.
 */
export interface XChunk {
  /** Fully formatted chunk text including arrow/UTM suffix */
  text: string
  /** True when paragraph exceeded 280 chars with no sentence boundary */
  oversized?: boolean
}

/**
 * Generated content for X (Twitter)
 * Introduction split into 280-character chunks
 */
export interface XContent {
  /** Array of chunk objects, each with formatted text and optional oversized flag */
  chunks: XChunk[]
}

/**
 * Generated content for LinkedIn
 */
export interface LinkedInContent {
  /** Introduction text + arrow + UTM link */
  body: string
}

/**
 * Generated content for Medium
 */
export interface MediumContent {
  /** Article title */
  title: string
  /** Article subtitle/description */
  description: string
  /** Alt text for featured image */
  imageAlt: string
  /** Caption for featured image */
  imageCaption: string
  /** Full HTML body ready to paste (includes image, intro, link, snippets) */
  bodyHtml: string
  /** Canonical URL without UTM tags for SEO settings */
  canonicalUrl: string
  /** Category for tagging */
  category: string
  /** Tags for article */
  tags: string[]
}

/**
 * Generated content for Substack
 */
export interface SubstackContent {
  /** Article title */
  title: string
  /** Article subtitle/description */
  description: string
  /** Full HTML body ready to paste (includes image with alt/caption, intro, link, attribution) */
  bodyHtml: string
  /** Category for tagging */
  category: string
  /** Tags for article */
  tags: string[]
}

/**
 * Parameters for UTM link generation
 */
export interface UTMParams {
  /** Base article URL */
  url: string
  /** Always 'social' for social media sharing */
  medium: 'social'
  /** Platform name for tracking */
  source: Platform
}

/**
 * All user-editable snippet keys used across platform content generators.
 * Keys map 1-to-1 to the constants in src/config/snippets.ts.
 */
export type SnippetKey =
  | 'EN_SUBSTACK_SHARE_BLOCK'
  | 'FR_SUBSTACK_SHARE_BLOCK'
  | 'EN_SUBSTACK_UTM_ANCHOR'
  | 'FR_SUBSTACK_UTM_ANCHOR'
  | 'EN_WHY_HEADING'
  | 'FR_WHY_HEADING'
  | 'EN_WHY_BODY_HTML'
  | 'FR_WHY_BODY_HTML'

/**
 * Map of all editable snippet values.
 * Used by useSnippets composable and settings page.
 */
export type SnippetMap = Record<SnippetKey, string>
