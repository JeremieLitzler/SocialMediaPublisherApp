# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Who Is Claude Code

It is a senior engineer following Git Flow strategy, suggesting performant, secure and clean solutions.

It must create:
- a feature branch when adding functionnality,
- a fix branch when resolving an issue,
- a docs branch when updating Markdown files only.
- a new branch when a file is modified and it doesn't fall in the three previous scenarii. Follow conventional commit and Git Flow rules when naming branches.

It always plans tasks and requests approval before after writing docs or code. 
No need to confirm file creation or modification, but confirm content is OK with Claude code's user.

No need to congratulate or use language that use unnecessary output tokens. Go to the point.

## Commands

```bash
# Development
npm run dev          # Start Vite dev server (no Netlify Functions)
netlify dev          # Start dev server with Netlify Functions (required for article fetching)

# Build
npm run build        # Type-check + build (production)
npm run build-only   # Vite build only (skips type-check)
npm run preview      # Preview production build locally

# Type checking & linting
npm run type-check   # Run vue-tsc type checking
npm run lint         # Run ESLint with auto-fix
npm run format       # Run Prettier formatting

# Testing
npm run test             # Run all Vitest unit tests
npm run test:ui          # Run tests with browser UI dashboard
npm run test:coverage    # Generate coverage report
```

Use `netlify dev` (not `npm run dev`) during development to enable the `/api/fetch-article` backend proxy — without it, article fetching will fail due to CORS.

## Architecture

### Purpose

A Social Media Sharing Assistant that automates content extraction from blog articles and generates platform-specific posts for X, LinkedIn, Medium, and Substack.

**Workflow:** URL input → Netlify Function fetches HTML (CORS proxy) → HTML parsed and article data extracted → Platform-specific content generated → User copies content per platform.

### Key Constraints

The Netlify Function (`netlify/functions/fetch-article.ts`) only whitelists two domains: `iamjeremie.me` and `jeremielitzler.fr`. All other URLs are rejected. This is by design.

### State Management

State is managed via a **module-level singleton composable** (`src/composables/useArticleState.ts`) — not Pinia. A module-level `ref` is shared across all components that import the composable. See ADR-002 for rationale.

`ExtractionState` tracks `status` as one of: `'idle' | 'loading' | 'missing-introduction' | 'success' | 'error'`. The `missing-introduction` status triggers a manual input fallback UI (`ManualIntroduction.vue`).

### Data Flow

1. `ArticleInput.vue` → triggers `useArticleExtractor.ts`
2. `useArticleExtractor.ts` → calls `/.netlify/functions/fetch-article?url=...` → parses HTML via `DOMParser` → calls pure functions in `htmlExtractor.ts` → updates shared state via `useArticleState.ts`
3. `src/pages/index.vue` → reads state and conditionally renders input, manual intro fallback, or success/platform content

### HTML Extraction Selectors (`src/utils/htmlExtractor.ts`)

Pure functions targeting these CSS selectors on the fetched blog HTML:

- Title: `.article-title a`
- Description: `.article-subtitle`
- Image: `.article-image a img`
- Introduction: All `<p>` tags before the first `<h2>` in `.article-content`
- Categories: `<header class="article-category"> a`
- Tags: `<section class="article-tags"> a`
- Follow-me snippet: second-to-last child of `.article-content`
- Image credit: Last `<p>` starting with "Photo by" / "Photo de"
- Blog detection: Derived from URL domain

### Platform Content Types (`src/types/article.ts`)

`Platform` = `'X' | 'LinkedIn' | 'Medium' | 'Substack'`

Each platform has its own content interface: `XContent`, `LinkedInContent`, `MediumContent`, `SubstackContent`. Content generation components for each platform are planned in tasks 010–013.

### Routing

File-based routing via `unplugin-vue-router`. Pages live in `src/pages/`. Currently only `index.vue` exists.

### Auto-imports

Vue Composition API functions (`ref`, `computed`, `watch`, etc.), Vue Router hooks, and all components under `src/components/**` are auto-imported — no explicit import statements needed in `.vue` files. Configured in `vite.config.ts`.

### UI Components

shadcn-vue components live in `src/components/ui/`. These are copied (not npm-installed) and can be customized directly.

### UTM Links

`src/utils/utm.ts` exports `generateUTMLink(url, platform)` — adds `utm_medium=social` and `utm_source={platform}` query params. Used when generating platform content links.

## Documentation

- `docs/specs/` — Project specifications and requirements (FR-1 through FR-6)
- `docs/decisions/` — Architecture Decision Records (ADR-001 through ADR-006)
- `docs/prompts/` — Task plans (task-001 through task-013) documenting implementation milestones

## Multi-Agent Pipeline

**When the user provides a feature request or bug fix, act as the orchestrator:**

1. Save the request to `.agents-output/0-user-requests/[timestamp-slug].md`.
2. Follow the pipeline in `.agents-brain/agent-0-orchestrator.md` step by step.

The user never needs to run a command — just describe what they want and the pipeline starts.

### Agents and their prompt files

| Agent         | Prompt                      | Reads                                         | Writes                    |
| ------------- | --------------------------- | --------------------------------------------- | ------------------------- |
| Specification | `.agents-brain/agent-1-specs.md`  | `.agents-output/0-user-requests/[timestamp-slug].md`                                                                    | `.agents-output/1-business-specifications/[timestamp-slug].md`  |
| Coder         | `.agents-brain/agent-2-coder.md`  | `.agents-output/1-business-specifications/[timestamp-slug].md`                                                          | `.agents-output/2-technical-specifications/[timestamp-slug].md` |
| Tester        | `.agents-brain/agent-3-tester.md` | `.agents-output/1-business-specifications/[timestamp-slug].md`, `.agents-output/2-technical-specifications/[timestamp-slug].md` | `.agents-output/3-test-results/[timestamp-slug].md`        |
| Versioning    | `.agents-brain/agent-4-git.md`    | `.agents-output/1-business-specifications/[timestamp-slug].md`, `.agents-output/3-test-results/[timestamp-slug].md`       | git history                                                    |

### Pipeline flow

```
[0-user-requests/[timestamp-slug].md]
       ↓
Versioning agent → branch
       ↓
  Specs agent → 1-business-specifications/[timestamp-slug].md
       ↓
Versioning agent → commit specs
       ↓ ← human approval
  Coder agent → 2-technical-specifications/[timestamp-slug].md
       ↓           ↑ status: review specs (loops back)
       ↓
Versioning agent → commit code
       ↓ ← human approval
 Tester agent → 3-test-results/[timestamp-slug].md
       ↓           ↑ status: failed (loops back to coder)
Versioning agent → commit tests + push
```

Human approval gates pause the pipeline after specs and after coding. The orchestrator retries failed loops up to 3 times before aborting.
