# Agent Model Preference

This document records the model assigned to each pipeline agent, the rationale for lower-cost model choices, and the criteria for future reassignment.

## Model Assignments

| Agent | File | Model | Reasoning demand |
|---|---|---|---|
| agent-0-orchestrator | `.agents-brain/agent-0-orchestrator.md` | sonnet | Coordinates the full pipeline: routes between agents, evaluates ADR flags, manages human approval gates, and applies retry logic — requires sustained multi-step reasoning. |
| agent-1-specs | `.agents-brain/agent-1-specs.md` | sonnet | Produces business specifications using Example Mapping, identifies ADR-worthy patterns, and must ask clarifying questions rather than guess — requires deep understanding of intent and context. |
| agent-2-coder | `.agents-brain/agent-2-coder.md` | sonnet | Implements source code only, applies all nine Object Calisthenics rules, performs a self-code review, and documents non-trivial technical decisions — requires strong reasoning about code quality and architecture. |
| agent-3-test-writer | `.agents-brain/agent-3-test-writer.md` | sonnet | Runs twice: before coding to derive test scenarios from specs and write `test-cases.md`; after coding to translate those scenarios into `.spec.ts` files using the now-known implementation structure — requires interpreting specs and reasoning about observable behaviour independently of the coder. |
| agent-3-test-runner | `.agents-brain/agent-3-test-runner.md` | haiku | Runs `npm run test` against `.spec.ts` files written by agent-3-test-writer and records structured pass/fail output — purely mechanical. |
| agent-4-git | `.agents-brain/agent-4-git.md` | haiku | Executes a fixed sequence of git and GitHub CLI commands (fetch, branch, commit, push, PR, merge, cleanup) following explicit task numbers — no creative or analytical reasoning required. |
| agent-5-security | `.agents-brain/agent-5-security.md` | sonnet | Performs threat analysis across input validation, XSS surfaces, Netlify Function boundaries, CORS, secrets handling, and dependency risks — requires domain knowledge and nuanced judgment. |
| agent-6-reviewer | `.agents-brain/agent-6-reviewer.md` | sonnet | Cross-references implementation against business specs and security guidelines, runs lint and type-check, detects Vue reactivity pitfalls and TypeScript type-safety issues, and fetches reference documentation — requires broad technical judgment. |
| agent-7-pipeline-maintainer | `.agents-brain/agent-7-pipeline-maintainer.md` | sonnet | Diagnoses pipeline issues, identifies cascading effects across multiple agent files, and applies minimal targeted edits — requires careful reasoning about agent interdependencies. |

## TDD split: agent-3-test-writer and agent-3-test-runner

The original `agent-3-tester` bundled two jobs with different reasoning demands. They are now split:

**agent-3-test-writer (Sonnet)** runs twice:

**First pass — before coding:** reads `business-specifications.md` and `security-guidelines.md` and writes `test-cases.md` — plain-language scenarios covering the happy path, edge cases, and error conditions. It does not write `.spec.ts` files at this stage because the code does not exist yet: function names, file paths, and composable APIs are all coder decisions. Scenarios are written against observable behaviour described in the spec, not against any implementation.

**Second pass — after coding:** reads `test-cases.md` and the implementation files the coder just produced, then translates each scenario into a `.spec.ts` test. File paths and function signatures are now known, so imports are valid. The test code is written by an agent that did not write the implementation — it cannot be biased toward covering only what was built.

Writing good test scenarios and translating them faithfully into test code both require interpreting specs and reasoning about observable behaviour. Haiku would produce shallow scenarios and miss edge cases the spec only implies.

**agent-3-test-runner (Haiku)** runs after the test-writer's second pass. It executes `npm run test` from the worktree root and records the output in `test-results.md` with a `status: passed` or `status: failed` line. There is no reasoning involved — just command execution and output formatting.

The coder is responsible for implementation only. The pipeline order becomes:

```
Specs → Security → Test Writer (pass 1) → Coder → Test Writer (pass 2) → Reviewer → Test Runner → Git
```

The key discipline: test scenarios are defined before coding by an agent that has not seen the implementation, and test code is written after coding by the same independent agent — never by the coder itself.

## Why agent-4-git Uses Haiku

**agent-4-git** executes an explicitly numbered task list of shell and GitHub CLI commands. Each task specifies exactly what to run (e.g., `git fetch origin`, `git worktree add`, `gh pr create`, `gh pr merge --rebase --delete-branch`). The agent reads a fixed set of files for commit message content and applies conventional commit formatting. There is no branching logic, no judgment call, and no creative output. The work is wholly procedural and is a natural fit for a smaller, faster model.

## Criteria for Reassigning a Model

**Reassign up (Haiku to Sonnet) when:**

- The agent begins producing incorrect or incomplete output that correlates with reasoning complexity (e.g., agent-3-test-runner misreads the output format, or agent-4-git misreads commit scope from a large technical spec).
- The agent's task scope expands — for example, if agent-3-test-runner is asked to evaluate coverage quality or write test code rather than just run and report.
- A new instruction requires the agent to make a judgment call rather than follow a fixed procedure.

**Reassign down (Sonnet to Haiku) when:**

- An agent's task is refactored to become fully procedural with explicit, unambiguous steps and no judgment required.
- Observed output quality for a Sonnet agent is consistently identical to what Haiku produces on the same prompts over multiple pipeline runs.

**Do not reassign based on cost alone.** Model selection must reflect task demand. A wrong model choice in a reasoning-heavy agent (specs, security, reviewer) will produce silent quality degradation that is harder to detect than a failed shell command.

## Migration: .agents-brain/ → .claude/agents/

Claude Code's native subagent system loads agent files from `.claude/agents/`, not `.agents-brain/`. Each file must have a YAML frontmatter block at the top; the markdown body becomes the system prompt automatically. This eliminates the current "read file → pass as prompt" pattern in the orchestrator.

### Step 1 — Add YAML frontmatter to each agent file

Prepend the following block to each agent file. Use the model assignments from the table above.

```yaml
---
name: agent-0-orchestrator
description: Orchestrates the full pipeline, delegates to specialist agents via Task tool
model: sonnet
tools: Read, Write, Task, AskUserQuestion
---
```

```yaml
---
name: agent-1-specs
description: Writes business specifications from user request using Example Mapping
model: sonnet
tools: Read, Write, Glob, AskUserQuestion
---
```

```yaml
---
name: agent-2-coder
description: Implements source code to make test cases pass, writes technical-specifications.md
model: sonnet
tools: Read, Write, Edit, Bash, Glob, Grep
---
```

```yaml
---
name: agent-3-test-writer
description: Writes test-cases.md from specs (pass 1) and .spec.ts files from implementation (pass 2)
model: sonnet
tools: Read, Write, Glob, Grep
---
```

```yaml
---
name: agent-3-test-runner
description: Runs npm test and writes test-results.md with pass/fail status
model: haiku
tools: Read, Write, Bash
---
```

```yaml
---
name: agent-4-git
description: Handles git operations — fetch, branch, commit, push, PR create/merge/cleanup
model: haiku
tools: Bash, Read
---
```

```yaml
---
name: agent-5-security
description: Produces security guidelines for the coder based on business specs
model: sonnet
tools: Read, Write
---
```

```yaml
---
name: agent-6-reviewer
description: Reviews code against specs, runs lint and type-check, fetches Vue/TS reference docs
model: sonnet
tools: Read, Write, Bash, WebFetch
---
```

```yaml
---
name: agent-7-pipeline-maintainer
description: Edits agent files and CLAUDE.md to fix reported pipeline issues
model: sonnet
tools: Read, Write, Edit, Glob
---
```

### Step 2 — Move files to .claude/agents/

```bash
mkdir -p .claude/agents
cp .agents-brain/*.md .claude/agents/
```

### Step 3 — Update the orchestrator invocation pattern

Every "Read `.agents-brain/agent-X.md` and spawn a subagent using the Task tool with that prompt" block in `agent-0-orchestrator.md` and `CLAUDE-AGENT-WORFLOW-ISSUES-HANDLING.md` becomes a direct invocation by name:

```
# Before
Read `.agents-brain/agent-3-test-runner.md` and spawn a subagent using the Task tool with that prompt.
Pass: Task folder: [task-folder] / Worktree: [worktree]

# After
Invoke: Task(subagent_type="agent-3-test-runner", prompt="Task folder: [task-folder]\nWorktree: [worktree]")
```

The orchestrator no longer reads agent files — the system loads them automatically from `.claude/agents/`.

### Step 4 — Update cascading references

All files that reference `.agents-brain/` must be updated:

| File | What to update |
|---|---|
| `agent-4-git.md` commit rules | `ci(agent)` scope: `.agents-brain` → `.claude/agents` |
| `agent-7-pipeline-maintainer.md` scope | Allowed edit paths: `.agents-brain/agent-*.md` → `.claude/agents/agent-*.md` |
| `CLAUDE.md` | Agent table paths + pipeline step 2 reference |
| `CLAUDE-AGENT-WORFLOW-ISSUES-HANDLING.md` | All `.agents-brain` references (5 occurrences) |
| `CLAUDE-AGENT-ADDITIONS-2026-03-05.md` | All `.agents-brain` references (4 occurrences) |
| `CLAUDE-AGENT-WORKFLOW.md` | 1 occurrence |
| `CLAUDE-AGENT-WORKFLOW-WORKTREE-AND-AGENT-PARALLELISM.md` | 1 occurrence |

### Step 5 — Delete .agents-brain/

Once all files are in `.claude/agents/` and all references updated:

```bash
rm -rf .agents-brain
```

### Step 6 — Verify

Search for any remaining `.agents-brain` references across the repo — the result must be zero:

```bash
grep -r "agents-brain" . --include="*.md" --include="*.json"
```
