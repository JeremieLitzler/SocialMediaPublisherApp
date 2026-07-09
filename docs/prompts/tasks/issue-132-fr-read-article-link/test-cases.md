# Test Cases — Issue #132: localized Medium read-article anchor

Plain-language scenarios the implementation must satisfy. Written against observable
behaviour only (generated content, snippet defaults, settings fields). No implementation
details.

## Medium anchor — language selection (default snippets)

### TC-1 — French article uses the French Medium anchor by default
- **Precondition:** An extracted article whose blog language is French; no custom snippet
  values saved (defaults in effect).
- **Action:** Generate the Medium cross-post content for this article.
- **Expected:** The generated Medium body contains a single "read the full article" link
  whose visible anchor text is exactly `Venez lire l'article complet`. The body does not
  contain the English anchor text `Read the full article` nor
  `Let's review this in the full article`.

### TC-2 — English article uses the English Medium anchor by default
- **Precondition:** An extracted article whose blog language is English; no custom snippet
  values saved (defaults in effect).
- **Action:** Generate the Medium cross-post content for this article.
- **Expected:** The generated Medium body contains a single "read the full article" link
  whose visible anchor text is exactly `Let's review this in the full article`. The body
  does not contain the previous English anchor text `Read the full article` nor the French
  anchor text.

### TC-3 — Only the anchor text changes; link, URL, UTM, and separator are unchanged
- **Precondition:** A French article (e.g. the issue's
  `https://jeremielitzler.fr/post/2026-07/prothese-dentaire-en-acetal/`); defaults in effect.
- **Action:** Generate the Medium cross-post content.
- **Expected:** The anchor still sits inside the same visual-separator paragraph
  (`⬇️⬇️⬇️` followed by a line break) and the same anchor element. The link's `href`
  ends with `?utm_medium=social&utm_source=Medium` (the same UTM-tagged article URL as
  before this change). Only the visible link text differs from the pre-change output.

### TC-4 — Surrounding Medium blocks are unaffected
- **Precondition:** Any article; defaults in effect.
- **Action:** Generate the Medium cross-post content.
- **Expected:** The featured image/figure, introduction, follow-me snippet, horizontal
  separators, and the "Why does this post link to my blog?" block are identical to the
  pre-change output for the same article. The X, LinkedIn, and Substack outputs for the
  same article are unaffected by the Medium anchor change (other than the Substack rewording
  covered below).

## Medium anchor — custom saved override and reset

### TC-5 — A saved custom French Medium anchor overrides the default
- **Precondition:** A French article; a custom value (e.g. `Lire la suite ici`) has been
  saved for the French Medium anchor snippet.
- **Action:** Generate the Medium cross-post content using the live saved snippet values.
- **Expected:** The generated anchor text is exactly `Lire la suite ici`; the default
  French anchor text does not appear.

### TC-6 — A saved custom English Medium anchor overrides the default
- **Precondition:** An English article; a custom value (e.g. `Read more on my blog`) has
  been saved for the English Medium anchor snippet.
- **Action:** Generate the Medium cross-post content using the live saved snippet values.
- **Expected:** The generated anchor text is exactly `Read more on my blog`; the default
  English anchor text does not appear.

### TC-7 — Reset restores the Medium anchor defaults
- **Precondition:** Custom values have been saved for both Medium anchor snippets, then a
  reset-to-defaults action is performed.
- **Action:** Generate Medium content for a French article and for an English article after
  the reset.
- **Expected:** The French article's anchor reads `Venez lire l'article complet` and the
  English article's anchor reads `Let's review this in the full article` (the hardcoded
  defaults), i.e. the custom values no longer take effect.

### TC-8 — Custom Medium anchor persists per key without affecting other snippets
- **Precondition:** A custom French Medium anchor value is saved.
- **Action:** Inspect the persisted/live snippet values.
- **Expected:** Only the French Medium anchor key changed; the English Medium anchor and all
  Substack / "Why" snippet values remain at their current values. Saving the French Medium
  anchor does not alter any other key.

## Substack anchor rewording (Rule 2)

### TC-9 — Substack French anchor default is reworded
- **Precondition:** A French article; no custom snippet values saved (defaults in effect).
- **Action:** Generate the Substack cross-post content.
- **Expected:** The Substack "read the full article" anchor text reads exactly
  `Venez lire l'article complet`. The previous wording `Allez lire l'article complet` does
  not appear anywhere in the Substack output.

### TC-10 — Substack English anchor and other Substack output unchanged
- **Precondition:** An English article and a French article; defaults in effect.
- **Action:** Generate the Substack cross-post content for each.
- **Expected:** The Substack English anchor still reads
  `Let's review this in the full article`. The Substack share block, attribution line,
  figure, introduction, category, and tags are unchanged from the pre-change output for the
  same articles. Only the French Substack anchor wording differs.

## Settings UI — Medium anchor fields

### TC-11 — Medium settings section exposes two new anchor fields
- **Precondition:** The settings page is open with the current snippet values loaded.
- **Action:** View the Medium settings section.
- **Expected:** The Medium section shows two new editable text fields — one English, one
  French — each labelled as the Medium UTM link anchor text, mirroring the two Substack
  anchor fields. Each field displays its current snippet value (default or saved).

### TC-12 — Editing a Medium anchor field updates the bound settings value
- **Precondition:** The settings page is open.
- **Action:** Change the French Medium anchor field to a new value and trigger the existing
  save behaviour.
- **Expected:** The new value is bound to the settings state for the French Medium anchor
  key and is what subsequent Medium content generation uses; the English Medium anchor field
  and all other fields are unchanged.

### TC-13 — Reopening settings shows saved anchor values as inert text (security)
- **Precondition:** A Medium anchor snippet has a saved value that contains HTML-like
  characters (e.g. `<b>x</b>` or `"><script>`).
- **Action:** Reopen the settings page.
- **Expected:** The anchor field displays the saved value as an ordinary text-input value;
  no markup from the value is rendered or executed in the settings page (the characters
  appear literally in the input, not as active DOM/content).

## Security — anchor value handling in generated Medium content

### TC-14 — A stored HTML-bearing Medium anchor value is rendered through the existing sanitisation
- **Precondition:** A saved Medium anchor value contains markup (e.g.
  `<img src=x onerror=alert(1)>`); a French or English article accordingly.
- **Action:** Generate the Medium content and render it through the platform's normal render
  path (the same DOMPurify-based sanitisation used for the Medium body).
- **Expected:** The rendered output contains no active/executable content from the anchor
  value — any disallowed tags/attributes are stripped by the existing sanitiser. No new raw
  (`v-html`)/unsanitised render or clipboard path is introduced for the anchor value, and no
  new tag or attribute becomes allowed as a result of this change.

status: ready
