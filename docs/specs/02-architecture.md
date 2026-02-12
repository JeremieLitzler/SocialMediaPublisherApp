# Architecture

## Overview

A single-page Vue 3 application that extracts content from a blog article
URL and generates platform-specific formatted content for manual posting
to X, LinkedIn, Medium, and Substack.

## Tech Stack

| Layer         | Technology                       | Version |
| ------------- | -------------------------------- | ------- |
| Framework     | Vue 3 (Composition API)          | 3.5.x   |
| Language      | TypeScript                       | 5.9.x   |
| Build Tool    | Vite                             | 7.x     |
| Styling       | Tailwind CSS                     | 4.x     |
| UI Components | shadcn-vue (Radix Vue)           | 1.9.x   |
| Routing       | Vue Router (unplugin-vue-router) | 4.5.x   |
| State         | Singleton Composable             | n/a     |
| Utilities     | VueUse                           | 14.x    |
| Versioning    | Semantic Release                 | 25.x    |

## Application Structure

```plaintext
src/
├── assets/             # Static assets, global CSS
├── components/
│   ├── ui/             # shadcn-vue base components (Button, Tabs, etc.)
│   ├── article/        # Article URL input and extraction feedback
│   └── platforms/      # One component per platform
│       ├── PlatformX.vue
│       ├── PlatformLinkedIn.vue
│       ├── PlatformMedium.vue
│       └── PlatformSubstack.vue
├── composables/
│   ├── useArticleState.ts    # Singleton shared article state
│   ├── useArticleExtractor.ts # Fetches and parses article HTML
│   └── useClipboard.ts       # Wraps @vueuse/core useClipboard
├── config/
│   └── snippets.ts           # Predefined Medium/Substack snippets
├── types/
│   └── article.ts            # Article, Platform, ExtractedContent types
├── utils/
│   ├── utm.ts                # UTM tag generation
│   ├── xFormatter.ts         # X 280-char chunk splitting
│   └── htmlExtractor.ts      # DOM parsing helpers
└── views/
    └── HomeView.vue          # Single page, hosts all platform sections
```

## Data Flow

```plaintext
User inputs URL
      ↓
useArticleExtractor
  → fetch article HTML
  → parse DOM
  → validate introduction exists
  → extract: title, description, intro,
             image, category, tags,
             follow-me snippet
      ↓
useArticleState (singleton)
  → stores extracted article data
      ↓
Platform components (read from useArticleState)
  → generate platform-specific formatted content
  → expose copy-to-clipboard actions
```

## Key Design Decisions

See [ADR Index](../decisions/README.md)

## Article Extraction Rules

### Source HTML Structure

```html
<!-- Featured image -->
<head>
  <meta property="og:image" content="[image url]" />
  <meta property="og:description" content="[description]" />
  <meta property="og:title" content="[title]" />
</head>

<!-- Article body -->
<section class="article-content">
  <p>Introduction paragraph(s) — before first h2</p>
  <h2>First heading</h2>
  ...
  <!-- Last 2 children: follow-me + image credits snippet -->
</section>

<!-- Category -->
<header class="article-category">
  <a>Category Name</a>
</header>

<!-- Tags -->
<section class="article-tags">
  <a>Tag 1</a>
  <a>Tag 2</a>
</section>
```

### Validation Rules

See [FR-1](../specs/01-requirements.md) for validation rules.

## UTM Tag Rules

| Platform | utm_medium | utm_source |
| -------- | ---------- | ---------- |
| X        | social     | X          |
| LinkedIn | social     | LinkedIn   |
| Medium   | social     | Medium     |
| Substack | social     | Substack   |

## Configurable Snippets

Stored in `src/config/snippets.ts`:

- `MEDIUM_NO_FULL_ARTICLE` — "why I don't share full article" text
- `FOLLOW_ME` — extracted dynamically from last 2 children of article-content

## Dependency Cleanup (TR-1)

Remove before building:

- `pinia` and all store files
- `@tanstack/vue-table`
- `@faker-js/faker`
- Supabase-related config and components
- Multi-route Vue Router setup (reduce to single route)
