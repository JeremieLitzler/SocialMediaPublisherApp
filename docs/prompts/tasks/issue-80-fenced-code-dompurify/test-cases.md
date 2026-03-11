# Test Cases — Issue #80: Fenced Code DOMPurify Allowlist Extension

## Scope

These test scenarios cover the DOMPurify allowlist extension for fenced code blocks in `PlatformMedium` and `PlatformSubstack`, the HTML fixture file, and the non-regression tests that exercise the sanitization path.

---

## Happy Path Scenarios

### TC-01: Fenced code block structure survives sanitization

**Precondition:** A Body HTML value contains a fenced code block rendered as a wrapping `div.highlight` containing a `div.chroma`, a line-number table, one or more `pre` elements, and a copy button.

**Action:** The Body HTML is sanitized.

**Expected outcome:** The sanitized output contains the code text that was present inside the `pre` elements. The structural wrapper elements (`div.highlight`, `div.chroma`, the table, `tbody`, `tr`, `td`, `pre`, and the copy button element) are all present in the sanitized output.

---

### TC-02: Medium preview renders fenced code content

**Precondition:** An article whose introduction contains at least one fenced code block has been loaded.

**Action:** The user navigates to the Medium platform page.

**Expected outcome:** The Body HTML preview area shows the code block with its text content visible. No blank region or broken table appears where the code block should be.

---

### TC-03: Substack preview renders fenced code content

**Precondition:** An article whose introduction contains at least one fenced code block has been loaded.

**Action:** The user navigates to the Substack platform page.

**Expected outcome:** The Body HTML preview area shows the code block with its text content visible, in the same way as it appears on the Medium page. No blank region or broken structure appears.

---

### TC-04: Copying Body HTML on Medium includes fenced code block content

**Precondition:** An article whose introduction contains a fenced code block has been loaded and the user is on the Medium platform page.

**Action:** The user clicks the "Copy" button for the Body HTML field.

**Expected outcome:** The clipboard contains HTML in which the code text from the fenced block is present and the structural wrapper elements are intact.

---

### TC-05: Copying Body HTML on Substack includes fenced code block content

**Precondition:** An article whose introduction contains a fenced code block has been loaded and the user is on the Substack platform page.

**Action:** The user clicks the "Copy" button for the Body HTML field.

**Expected outcome:** The clipboard contains HTML in which the code text from the fenced block is present and the structural wrapper elements are intact.

---

### TC-06: Article with no fenced code block produces unchanged output

**Precondition:** A Body HTML value contains only paragraph elements (`p`) and no fenced code blocks.

**Action:** The Body HTML is sanitized.

**Expected outcome:** The sanitized output is identical to what the same input would have produced before this fix. No content is added or removed.

---

### TC-07: Non-regression test using the full article fixture

**Precondition:** The full HTML of the article at `https://iamjeremie.me/post/2026-03/organizing-specifications-with-claude-code/` is saved as a fixture file. The introduction of that article contains at least one fenced code block.

**Action:** The introduction is extracted from the fixture HTML, and the resulting Body HTML is sanitized.

**Expected outcome:** The sanitized output contains the code text from the fenced block present in that article's introduction. The output is not empty where the fenced code block appeared.

---

## Security / Active Content Blocking Scenarios

### TC-08: Script tag is stripped after allowlist extension

**Precondition:** A Body HTML value contains both a fenced code block and an injected `<script>alert('xss')</script>` element.

**Action:** The Body HTML is sanitized.

**Expected outcome:** The `script` element is absent from the sanitized output. The fenced code block content is still present.

---

### TC-09: Inline event handler on a pre element is stripped

**Precondition:** A Body HTML value contains a `pre` element with an `onclick` attribute set to a JavaScript expression.

**Action:** The Body HTML is sanitized.

**Expected outcome:** The `onclick` attribute is absent from the sanitized output. The `pre` element itself and its text content are still present.

---

### TC-10: Event handler on the copy button element is stripped

**Precondition:** A Body HTML value contains a `button` element (as produced by the blog's fenced code renderer) that carries an `onclick` attribute.

**Action:** The Body HTML is sanitized.

**Expected outcome:** The `onclick` attribute (and any other event handler attribute) is absent from the sanitized output. The button element itself may or may not survive, but no handler survives.

---

### TC-11: iframe is stripped after allowlist extension

**Precondition:** A Body HTML value contains a fenced code block and an injected `<iframe src="https://evil.example">`.

**Action:** The Body HTML is sanitized.

**Expected outcome:** The `iframe` element is absent from the sanitized output. The fenced code block content is still present.

---

### TC-12: javascript: URI is stripped after allowlist extension

**Precondition:** A Body HTML value contains a link with `href="javascript:stealData()"`.

**Action:** The Body HTML is sanitized.

**Expected outcome:** The `javascript:` URI is absent from the sanitized output (either the attribute is removed or the value is neutralised).

---

### TC-13: style attribute is not allowed on elements even when class is allowed

**Precondition:** A Body HTML value contains an element that carries both a `class` attribute and a `style` attribute.

**Action:** The Body HTML is sanitized.

**Expected outcome:** The `style` attribute is absent from the sanitized output. The `class` attribute may survive if it is on an element that the allowlist permits.

---

### TC-14: Sanitization is applied before clipboard write

**Precondition:** An article whose introduction contains a fenced code block and an injected script tag has been loaded and the user is on the Medium or Substack platform page.

**Action:** The user clicks the "Copy" button for the Body HTML field.

**Expected outcome:** The clipboard content does not contain the script tag. The clipboard content does contain the fenced code block text.

---

### TC-15: Raw HTML is never bound to the preview without sanitization

**Precondition:** A Body HTML value contains an injected `<script>` tag alongside a fenced code block.

**Action:** The user views the Body HTML preview on the Medium or Substack platform page.

**Expected outcome:** The script tag does not appear in the rendered preview. The fenced code block content is visible in the preview.

---

## Edge Case Scenarios

### TC-16: HTML-like text inside a code block is rendered as plain text

**Precondition:** A fenced code block contains literal text that looks like HTML (e.g. the text `<div>` written as a code sample). The blog engine has encoded that text as HTML entities or wrapped it in `span` elements.

**Action:** The Body HTML is sanitized and the result is rendered.

**Expected outcome:** The rendered output shows the literal characters (e.g. `<div>`) as visible text, not as an actual HTML element. The HTML entities or `span` elements used for encoding are preserved unchanged by sanitization so the displayed characters are correct.

---

### TC-17: Multiple fenced code blocks in one introduction are all preserved

**Precondition:** A Body HTML value contains an introduction with two or more fenced code blocks.

**Action:** The Body HTML is sanitized.

**Expected outcome:** All fenced code blocks are present in the sanitized output with their code text intact. Not only the first block is preserved.

---

### TC-18: Introduction mixing fenced code blocks with other element types is fully preserved

**Precondition:** A Body HTML value contains an introduction that includes a fenced code block, one or more paragraph elements, an unordered list, and a blockquote.

**Action:** The Body HTML is sanitized.

**Expected outcome:** All element types (`p`, `ul`, `blockquote`, and the fenced code structure) are present in the sanitized output. The extended allowlist does not accidentally remove element types that DOMPurify previously preserved by default.

---

### TC-19: Medium and Substack produce identical sanitized output for the same input

**Precondition:** A Body HTML value containing a fenced code block is provided to both the Medium and Substack sanitization paths.

**Action:** The Body HTML is sanitized in each platform's context.

**Expected outcome:** The sanitized output produced by the Medium path is identical to the sanitized output produced by the Substack path.

---

### TC-20: Sanitization completes in the same render cycle (no async delay)

**Precondition:** An article whose introduction contains a fenced code block has been loaded.

**Action:** The user navigates to either the Medium or Substack platform page.

**Expected outcome:** The Body HTML preview and the value that would be written to the clipboard are both available immediately when the page renders, without any observable loading delay attributable to sanitization.

---

### TC-21: Fixture file is not accessible as a routed page

**Precondition:** The HTML fixture file has been added to the `tests/fixtures/` directory.

**Action:** A browser navigates to the dev server or production build attempting to access the fixture file as a URL.

**Expected outcome:** The fixture file is not served as a routable page. It is not rendered by the browser as live HTML in the application's origin.

---

### TC-22: object and embed elements are stripped after allowlist extension

**Precondition:** A Body HTML value contains `<object>` and `<embed>` elements alongside a fenced code block.

**Action:** The Body HTML is sanitized.

**Expected outcome:** Both `<object>` and `<embed>` elements are absent from the sanitized output. The fenced code block content is still present.

---

### TC-23: form element is stripped after allowlist extension

**Precondition:** A Body HTML value contains a `<form>` element alongside a fenced code block.

**Action:** The Body HTML is sanitized.

**Expected outcome:** The `<form>` element is absent from the sanitized output. The fenced code block content is still present.

---

status: ready
