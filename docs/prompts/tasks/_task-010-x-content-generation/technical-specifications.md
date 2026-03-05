# Technical Specifications — Task-010: X Content Generation

## Files Modified

| File | Change |
|------|--------|
| `src/types/article.ts` | Added `selectedPlatform: Platform | null` field to `ExtractionState` interface |
| `src/composables/useArticleState.ts` | Added `selectedPlatform: null` to the module-level initial state object |
| `src/composables/useArticleExtractor.ts` | Added `selectedPlatform: null` to all three state reset assignments (loading, success, missing-introduction, and error paths) |
| `src/components/article/ArticleInput.vue` | Added post-extraction navigation: sets `extractionState.selectedPlatform`, then calls `router.push()` to the platform route on success |
| `src/pages/index.vue` | Removed the success-state `<div>` (green banner + placeholder text); removed `.space-y-4` dead style rule; removed explicit component imports that are already auto-imported |
| `src/composables/useArticleExtractor.test.ts` | Added `selectedPlatform: null` to state fixture objects to satisfy the updated `ExtractionState` type |
| `src/composables/useArticleState.test.ts` | Added `selectedPlatform: null` to state fixture objects and the `toEqual` assertion to satisfy the updated `ExtractionState` type |

## Files Created

| File | Description |
|------|-------------|
| `src/utils/htmlToText.ts` | Pure utility that uses browser `DOMParser` to strip HTML tags and collapse whitespace into plain text |
| `src/utils/xContentGenerator.ts` | Generates `XContent` by converting introduction HTML to plain text, splitting into sentences, accumulating into 280-char chunks, and appending visual separators and a UTM link |
| `src/components/ui/CopyButton.vue` | Reusable copy-to-clipboard button built on the existing `Button` component; uses `useClipboard` from `@vueuse/core` with a 1.5-second "Copied!" feedback state |
| `src/components/platforms/PlatformX.vue` | Display component that reads article state, generates X chunks, renders each in a `<pre>` with a `CopyButton`, shows chunk count, and provides a "Start over" navigation |
| `src/pages/x.vue` | Thin file-based route page at `/x` that delegates entirely to `PlatformX.vue` |

## Non-trivial Technical Choices

**Sentence splitting without regex**
`splitIntoSentences` uses `String.indexOf` in a loop rather than a `RegExp.split` call. This approach keeps the punctuation attached to its sentence (e.g., `"Hello."` not `"Hello"`) by slicing at `splitAt + 1`, and avoids the ambiguity of look-ahead regex splits that behave differently across engines.

**`selectedPlatform` set after `extractArticle` resolves, not inside the composable**
The composable resets `selectedPlatform: null` on every call so the X page cannot accidentally display stale data from a previous extraction. The caller (`ArticleInput.vue`) stamps the chosen platform only when `status === 'success'`, which makes the assignment a single authoritative write rather than threading the platform value through the async extraction chain.

**`CopyButton` placed in `src/components/ui/`**
Following the existing shadcn-vue convention, shared UI primitives live in `ui/`. Platform-specific layout components live in `src/components/platforms/`. This keeps the copy button reusable for LinkedIn, Medium, and Substack tasks without moving it later.

status: ready
