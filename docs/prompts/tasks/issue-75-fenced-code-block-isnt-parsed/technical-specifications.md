# Technical Specifications — Issue #75: Fenced Code Block Isn't Parsed

## Files Changed

### `src/utils/htmlExtractor.ts`

- Added module-level `INTRODUCTION_ELEMENT_TAGS` constant (`Set<string>`) containing `'P'`, `'PRE'`, `'UL'`, `'BLOCKQUOTE'` — the complete set of tag names retained from the introduction area.
- Extracted `isIntroductionElement(element: Element): boolean` — single-responsibility predicate that delegates the tag membership check to `INTRODUCTION_ELEMENT_TAGS.has`.
- Extracted `collectIntroductionElements(articleContent: Element, firstH2: Element): string[]` — sibling traversal that accumulates `outerHTML` of every element satisfying `isIntroductionElement` before `firstH2`.
- Updated `extractIntroduction` to delegate the collection loop to `collectIntroductionElements`, reducing the public function to a guard + delegate + join (3 effective lines).
- Updated the file-level JSDoc header to replace `` all `<p>` tags `` with `` all `<p>`, `<pre>`, `<ul>`, `<blockquote>` tags ``.

**Why these decisions:**
- A `Set` over an array for `INTRODUCTION_ELEMENT_TAGS` gives O(1) membership testing and makes the allowlist explicit and easy to audit. An array `.includes` call would work but communicates less intent.
- Extracting `isIntroductionElement` and `collectIntroductionElements` into named helpers satisfies Object Calisthenics rules 1 (one level of indentation per method) and 7 (no method longer than 5 lines) without introducing any class or extra state.
- `outerHTML` is used unchanged (same as the original `<p>` handling), satisfying security guideline 8: the string is treated as opaque and is never decoded or re-interpolated before it reaches DOMPurify.
- No new npm packages are introduced; the fix relies exclusively on the existing `Element` DOM API, satisfying security guideline 6.

### `docs/specs/01-requirements.md`

- Updated FR-2 acceptance criterion for introduction extraction from `all <p> tags before first <h2>` to `all <p>, <pre>, <ul>, and <blockquote> tags before first <h2>, preserved in source order`.

### `CLAUDE.md`

- Updated the "Introduction" bullet in the HTML Extraction Selectors section to list all four retained element types and note that source order is preserved.

---

## Self-Code Review

Three potential bugs or bottlenecks identified and addressed:

1. **Nested `<h2>` structural invariant (bug risk):** `querySelector('h2')` finds the first `<h2>` anywhere inside `.article-content`, including inside a `<pre>` or `<blockquote>` child. The sibling traversal loop exits when `current === firstH2`. If the `<h2>` is not a direct child, `current` never equals `firstH2` and the loop runs over every direct child — incorrectly collecting body content as introduction. The fix adds an explicit comment documenting this as a known structural invariant of the target blog HTML; no defensive change is made because altering the query would diverge from the original contract and from the spec.

2. **`tagName` case in non-HTML parse contexts (low risk):** `Element.tagName` is uppercase for elements produced by an HTML-mode `DOMParser`, but is lowercase in XML/SVG contexts. All callers in this codebase pass a `Document` obtained from `DOMParser` with `text/html`, so uppercase is guaranteed. The `Set` members are uppercase strings accordingly. Documented as an assumption; no code change needed.

3. **`collectIntroductionElements` loop body density (readability/maintainability):** The `if` and sibling advance are on adjacent lines, keeping the loop at exactly five statements. To stay within Object Calisthenics rule 7 (methods ≤ 5 lines) while keeping one level of indentation (rule 1), the condition check is already delegated to `isIntroductionElement`. No further refactoring is needed.

---

## Object Calisthenics Compliance

| Rule | Status | Notes |
|---|---|---|
| 1. One level of indentation per method | Compliant | Each helper has at most one loop or one condition, not nested |
| 2. No else keyword | Compliant | All guards use early return |
| 3. Wrap primitives | Partial exception | Tag names remain plain strings; wrapping each in a domain type would be over-engineering for a `Set.has` check — documented exception |
| 4. First-class collections | Compliant | `collected: string[]` encapsulates the result list; `INTRODUCTION_ELEMENT_TAGS` is a first-class `Set` |
| 5. One dot per line | Compliant | No chained calls |
| 6. No abbreviations | Compliant | All identifiers are fully spelled out |
| 7. Entities ≤ 5 lines | Compliant | `isIntroductionElement` = 1 line; `collectIntroductionElements` = 5 lines; `extractIntroduction` = 3 effective lines |
| 8. No class with > 2 instance variables | N/A | No classes introduced |
| 9. No getters/setters | N/A | No classes introduced |

---

### ADR Required

**ADR-007 already covers this change.** ADR-007 (dated 2026-03-03) explicitly lists `<pre>`, `<blockquote>`, and `<span>` in its tag inventory and states:

> "Default configuration requires no custom allowlist — all safe tags used in bodyHtml are preserved automatically, including `<pre>`, `<blockquote>`, and `<span>` added in issue #75"

No new ADR or amendment is needed. The security guideline's ADR requirement is satisfied by the existing ADR-007.

---

status: ready
