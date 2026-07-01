# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Social Media Sharing Assistant that automates content extraction from blog articles and generates platform-specific posts for X, LinkedIn, Medium, and Substack.

**Workflow:** URL input → Netlify Function fetches HTML (CORS proxy) → HTML parsed and article data extracted → Platform-specific content generated → User copies content per platform.

## Architecture

### Project-specific

#### Key Constraints

The Netlify Function (`netlify/functions/fetch-article.ts`) only whitelists two domains: `iamjeremie.me` and `jeremielitzler.fr`. All other URLs are rejected. This is by design.

#### State Management

State is managed via a **module-level singleton composable** (`src/composables/useArticleState.ts`) — not Pinia. A module-level `ref` is shared across all components that import the composable. See ADR-002 for rationale.

`ExtractionState` tracks `status` as one of: `'idle' | 'loading' | 'missing-introduction' | 'success' | 'error'`. The `missing-introduction` status triggers a manual input fallback UI (`ManualIntroduction.vue`).

#### Data Flow

1. `ArticleInput.vue` → triggers `useArticleExtractor.ts`
2. `useArticleExtractor.ts` → calls `/.netlify/functions/fetch-article?url=...` → parses HTML via `DOMParser` → calls pure functions in `htmlExtractor.ts` → updates shared state via `useArticleState.ts`
3. `src/pages/index.vue` → reads state and conditionally renders input, manual intro fallback, or success/platform content

#### HTML Extraction Selectors (`src/utils/htmlExtractor.ts`)

Pure functions targeting these CSS selectors on the fetched blog HTML:

- Title: `.article-title a`
- Description: `.article-subtitle`
- Image URL: `meta[name="twitter:image"]` content attribute (full absolute URL)
- Image alt: `.article-header .article-image a img` alt attribute
- Introduction: All `<p>`, `<pre>`, `<ul>`, `<ol>` and `<blockquote>` tags before the first `<h2>` in `.article-content`, preserved in source order
- Categories: `<header class="article-category"> a`
- Tags: `<section class="article-tags"> a`
- Follow-me snippet: second-to-last child of `.article-content`; if it is a `div.jli-notice.jli-notice-tip`, the inner `<p class="jli-notice-title">` is replaced with `<h2 class="jli-notice-title">`
- Image credit: Last `<p>` starting with "Photo by" / "Photo de"
- Blog detection: Derived from URL domain

#### Platform Content Types (`src/types/article.ts`)

`Platform` = `'X' | 'LinkedIn' | 'Medium' | 'Substack'`

Each platform has its own content interface: `XContent`, `LinkedInContent`, `MediumContent`, `SubstackContent`.

#### UTM Links

`src/utils/utm.ts` exports `generateUTMLink(url, platform)` — adds `utm_medium=social` and `utm_source={platform}` query params. Used when generating platform content links.

### Common

#### Stack

- Vue 3 Composition API with `<script setup lang="ts">` always
- File-based routing via `unplugin-vue-router`. Pages live in `src/pages/`
- Vue Composition API functions (`ref`, `computed`, `watch`, etc.), Vue Router hooks, and all components under `src/components/**` are auto-imported — no explicit import statements needed in `.vue` files. Configured in `vite.config.ts`
- shadcn-vue components live in `src/components/ui/`. These are copied (not npm-installed) and can be customized directly

#### Code Conventions

- Composables in `src/composables/` prefixed with `use`
- Utility functions in `src/utils/` — pure functions, no Vue dependencies
- **Styling** _(coder agent: write; reviewer agent: enforce)_: always use Tailwind CSS utility classes. Write custom CSS (inline `style` attributes, `<style>` blocks, or `.css` files) only when no Tailwind utility class covers the need — and add a comment explaining why

#### Naming Conventions

- Components: PascalCase (`ArticleInput.vue`)
- Composables: camelCase with `use` prefix (`useArticleState.ts`)
- Types/Interfaces: PascalCase (`Platform`, `XContent`)
- Utils: camelCase (`htmlExtractor.ts`, `utm.ts`)
- Constants: UPPER_SNAKE_CASE
- Test files: `*.spec.ts` suffix

#### Testing Conventions

- Use Vitest + @vue/test-utils (see ADR-005)
- Co-locate test files next to source files or in `src/__tests__/`
- Naming: `*.spec.ts` for all tests
- Coverage targets:
  - Composables: 100% (critical state management)
  - Utils: 100% (pure functions, easy to test)
  - Components: 80%+ (focus on logic, not styling)
- All tests must pass before merging

##### HTML Fixtures

When saving HTML files for test fixtures, always clean them up:

- Remove all `<link rel="stylesheet">` tags
- Remove all `<script>` tags and their content
- Keep metadata tags like `<link rel="canonical">` and `<link rel="shortcut icon">`

```bash
cd tests/fixtures && for file in *.html; do
  sed -i '/<link rel="stylesheet"/d' "$file"
  sed -i '/<script/d; /<\/script>/d' "$file"
done
```

## Documentation

- `docs/specs/` — Project specifications and requirements
- `docs/decisions/` — Architecture Decision Records (a.k.a ADR)
- `docs/prompts/` — Pipeline artifacts per issue;
  - See `docs/prompts/README.md` for the full pipeline reference. NEVER READ THIS FILE UNLESS THE PIPELINE CHANGES

## Who Is Claude Code

It is a senior engineer following Git Flow strategy, suggesting performant, secure and clean solutions.

Commits to `develop`/`main` prohibited. Use worktrees and conventional-commit type of the change (`feat`, `fix`, `docs`, `ci`, `refactor`, …). Pipeline work derives the branch and commit type automatically (see the `jli-*` commands); for one-off changes, name the branch after the change type.

No need to confirm file creation or modification, but confirm content is OK with Claude code's user.

No need to congratulate or use language that use unnecessary output tokens. Go to the point.

## Critical Rules

1. **Pipeline-first**: When asked to tackle/work on/implement/fix a GitHub issue, always use the `/tackle` skill. Never do git operations (branch, checkout, worktree) directly from the main conversation. All code changes go through the pipeline in a worktree.
2. **No hardcoded paths**: Never hardcode absolute paths or worktree-specific paths (e.g. `develop/`, `feat_foo/`) in any `.md` file under `.claude/`. Absolute paths break portability across machines; worktree paths are runtime values passed by the orchestrator, not constants. Always use placeholders (`[worktree]`, `[task-folder]`) or derive paths at runtime.
3. **Spec-first**: Before implementing anything, read the relevant spec files.
4. **ADR-first**: Before making any architectural decision, provide brief context why an ADR is needed before suggesting the full ADR. Once confirmed, create it in `docs/decisions/` and always update the index at `docs/decisions/README.md`.
5. **Type-first**: Define or update types in `src/types/` before implementing logic that uses them.

## Setup

Claude Code must be opened from the `develop/` worktree, not the bare repo root. If you detect the working directory is the bare repo root (i.e. no `src/`, `package.json`, or `.claude/commands/` at the root), warn the user:

> You appear to have opened Claude Code from the bare repo root. Skills and agents may not be discovered correctly. Please restart from the `develop/` directory:
>
> ```
> cd develop && claude
> ```

## Context to Read

Always read before starting any task:

- `docs/prompts/workspace-context.md` — current phase, completed work, open decisions

Read when relevant:

- ADRs in `docs/decisions/` — before touching a decided area

## When You Are Unsure

- Flag it explicitly rather than assuming
- Propose two options with trade-offs and ask for a decision
- If a spec is ambiguous, quote the ambiguous part and ask for clarification
- Never silently make a decision that affects architecture or data shape

## Development commands

```bash
npm install              # Install dependencies

netlify dev              # Dev server WITH Netlify Functions (required for article fetching)
npm run dev              # Vite only, no Functions (article fetching will fail on CORS)

npm run build            # Type-check + production build
npm run build-only       # Vite build only (skips type-check)
npm run preview          # Preview production build locally

npm run type-check       # vue-tsc type checking
npm run lint             # ESLint with auto-fix
npm run format           # Prettier formatting

npm run test             # Vitest unit tests
npm run test:ui          # Vitest with browser UI dashboard
npm run test:coverage    # Coverage report
```

Use `netlify dev` (not `npm run dev`) during development to enable the `/api/fetch-article` backend proxy — without it, article fetching fails on CORS.

## Shell commands — use `rtk` wrappers

**Always** prefix git, `gh`, build/lint, test, and file/search commands with `rtk` — never the bare equivalent. These are the commands auto-approved in `.claude/settings.local.json`; running them without `rtk` triggers a permission prompt on every call. The full command reference lives in the global `~/.claude/CLAUDE.md`.

Exception: `npm run type-check` (vue-tsc) has no rtk equivalent — keep as-is.
