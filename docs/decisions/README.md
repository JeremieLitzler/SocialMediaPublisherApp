# Architecture Decision Records

This directory contains ADRs (Architecture Decision Records) for the project.
Each ADR documents a significant technical decision, its context, and consequences.

## Format

Filename: `adr-XXX-short-title.md` (always lowercase)
Status values: `Proposed` | `Accepted` | `Deprecated` | `Superseded by ADR-XXX`

## Index

- [ADR-001](./adr-001-vue3-framework.md): Vue 3 as Frontend Framework. Accepted, 2026-02-11
- [ADR-002](./adr-002-state-management.md): Singleton Composable for Shared State. Accepted, 2026-02-11
- [ADR-003](./adr-003-ui-layer.md): Tailwind CSS v4 + shadcn-vue for UI. Accepted, 2026-02-11
- [ADR-004](./adr-004-semantic-release.md): Semantic Release for Versioning. Superseded by ADR-009, 2026-02-11
- [ADR-005](./adr-005-testing-strategy.md): Testing Strategy with Vitest. Accepted, 2026-02-12
- [ADR-006](./adr-006-netlify-functions-for-cors-proxy.md): Netlify Functions for CORS-Free HTML Fetching. Proposed, 2026-02-13
- [ADR-007](./adr-007-html-sanitization-for-vhtml.md): HTML Sanitization Strategy for v-html Rendering. Proposed, 2026-03-03
- [ADR-008](./adr-008-client-side-storage.md): IndexedDB Over localStorage for Client-Side Persistence. Accepted, 2026-03-04
- [ADR-009](./adr-009-release-sh-pinned-script-release-workflow.md): Pinned External `release.sh`, Single-Trunk Release. Accepted, 2026-10-23

## How to Add a New ADR

1. Copy the template below
2. Number sequentially (the next number after the last entry of the index)
3. Name the file in lowercase: `adr-XXX-short-title.md`
4. Add a bullet to the index above
5. Commit alongside the code change it documents

## Template

```markdown
# ADR-XXX: [Title]

**Date:** YYYY-MM-DD
**Status:** Proposed

## Context

## Decision

## Consequences

### Positive

### Negative

## Alternatives Considered

## Notes
```
