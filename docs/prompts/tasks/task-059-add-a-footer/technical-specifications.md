# Technical Specifications — Task 059: Add a Footer

## Files Created or Changed

| File | Action | Description |
|---|---|---|
| `src/components/layout/AppFooter.vue` | Created | New footer layout component rendering three external links (author attribution, license, Netlify hosting). |
| `src/components/layout/GuestLayout.vue` | Modified | Wrapped `<slot>` in a flex column container and added `<AppFooter />` below it so the footer appears on every page. |

## Technical Choices

### AppLink reuse
`AppLink` is already auto-imported and handles external URLs by detecting `http` prefix, applying `target="_blank"` and `rel="noopener"` automatically. No custom anchor elements were needed.

### GuestLayout restructure
The original layout used a single `div` with `justify-center items-center` targeting both axes. To stack the slot content and the footer vertically, the outer div was changed to `flex-col`. The slot content is wrapped in its own inner div preserving the original horizontal centering behaviour.

### Tailwind styling
The footer uses `border-t flex flex-wrap justify-center items-center gap-4 px-4 py-3 text-sm`, consistent with the `border-b flex … items-center px-4` pattern from `NavBarTop.vue`. `flex-wrap` satisfies the narrow-viewport edge case from the business spec.

### No new dependencies or ADRs
No new libraries, stores, or architectural patterns were introduced. The footer is a stateless presentational component composed entirely from existing primitives.

status: ready
