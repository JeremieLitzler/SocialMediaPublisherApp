# Business Specifications — Task 059: Add a Footer

## Goal and Scope

Add a persistent application footer that appears on every page of the Social Media Publisher App. The footer provides attribution, licensing, and hosting information through three external links. It is purely informational and does not affect the article extraction or content generation workflows.

## Context

The current layout is a single-column, centered layout managed by `GuestLayout.vue`, which wraps the router view inside `App.vue`. The app already has an `AppLink.vue` component that handles both internal and external links, opening external links in a new tab with `rel="noopener"`. The footer must integrate into this existing layout structure.

## Files to Create or Modify

### Create: `src/components/layout/AppFooter.vue`

A new layout component responsible for rendering the footer. It displays three external links. It is placed within the application layout so it is visible on all pages.

### Modify: `src/components/layout/GuestLayout.vue`

The existing guest layout wraps page content in a centered column. It must be updated to include the footer below the main page slot so the footer appears consistently on every page without being part of any individual page component.

## Business Rules

### Rule 1 — Footer is always visible

The footer appears on every page of the application. It is not conditional on any application state (loading, error, success, idle).

### Rule 2 — Three required links

The footer must contain exactly three external links:

1. **Author attribution link** — Links to `https://iamjeremie.me/` and opens in a new tab. The visible text must read: "Made by Jeremie and Claude". Both "Jeremie" and "Claude" are themselves hyperlinks within that text: "Jeremie" links to `https://iamjeremie.me/` and "Claude" links to `https://claude.ai/code`. Both open in a new tab.

2. **License link** — Links to the LICENSE file of this repository on GitHub and opens in a new tab. The visible text must clearly communicate it is the project license.

3. **Netlify hosting link** — Links to Netlify and opens in a new tab. The visible text must read "Hosted on Netlify".

### Rule 3 — All footer links open in a new tab

Every link in the footer is external. All must open in a new browser tab (`target="_blank"`) with `rel="noopener"` for security. The existing `AppLink.vue` component already handles this behaviour for any URL starting with `http`, so it is the appropriate component to use.

### Rule 4 — Footer uses existing UI patterns

The footer is styled consistently with the rest of the application. It uses Tailwind CSS utility classes, matching the visual conventions already present in layout components such as `NavBarTop.vue` (border, padding, flex layout).

## Example Mapping

### Feature: Footer always appears

**Rule:** The footer is present on every page regardless of application state.

- **Example:** When the app loads and the article input is shown (idle state), the footer is visible at the bottom of the page.
- **Example:** When an article is successfully extracted and platform content is displayed, the footer is still visible at the bottom of the page.
- **Example:** When an error occurs during article extraction, the footer is still visible at the bottom of the page.

### Feature: Author attribution link

**Rule:** The footer contains an inline attribution sentence where "Jeremie" and "Claude" are separate clickable links.

- **Example:** A user sees the text "Made by Jeremie and Claude" in the footer. Clicking "Jeremie" opens `https://iamjeremie.me/` in a new tab. Clicking "Claude" opens `https://claude.ai/code` in a new tab.
- **Example:** Both links open in a new tab without navigating away from the application.

### Feature: License link

**Rule:** The footer contains a link to the project license file.

- **Example:** A user clicks the license link and is taken to the LICENSE file of this repository on GitHub in a new tab.

### Feature: Netlify hosting link

**Rule:** The footer contains a link to Netlify with the text "Hosted on Netlify".

- **Example:** A user sees "Hosted on Netlify" in the footer and clicks it. The Netlify website opens in a new tab without navigating away from the application.

### Feature: New-tab behaviour for all footer links

**Rule:** All footer links are external and must not navigate away from the app.

- **Example:** A user clicks any footer link. The application remains open in the current tab; the linked page opens in a new tab.

## Edge Cases

- **No JavaScript / link fallback:** If a user's browser does not open new tabs (e.g., popup blocker), the link still navigates to the correct URL in the current tab. The `rel="noopener"` attribute remains present regardless.
- **Narrow viewport:** On small screen widths, the footer links must remain readable and not overflow their container. Wrapping is acceptable; horizontal scrolling is not.
- **Long text wrap:** The attribution sentence "Made by Jeremie and Claude" contains two inline links. If the viewport is narrow enough to cause line wrapping within the sentence, the text remains coherent and the links remain individually clickable.

### ADR Required

The introduction of a dedicated footer component as part of `GuestLayout.vue` does not introduce a new architectural pattern (layout components already exist under `src/components/layout/`). No new ADR is needed.

status: ready
