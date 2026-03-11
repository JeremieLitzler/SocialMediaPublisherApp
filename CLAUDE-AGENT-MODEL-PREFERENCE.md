# Agent Model Preference

This document records the model assigned to each pipeline agent, the rationale for lower-cost model choices, and the criteria for future reassignment.

## Model Assignments

| Agent | File | Model | Reasoning demand |
|---|---|---|---|
| agent-0-orchestrator | `.agents-brain/agent-0-orchestrator.md` | sonnet | Coordinates the full pipeline: routes between agents, evaluates ADR flags, manages human approval gates, and applies retry logic — requires sustained multi-step reasoning. |
| agent-1-specs | `.agents-brain/agent-1-specs.md` | sonnet | Produces business specifications using Example Mapping, identifies ADR-worthy patterns, and must ask clarifying questions rather than guess — requires deep understanding of intent and context. |
| agent-2-coder | `.agents-brain/agent-2-coder.md` | sonnet | Implements source code, applies all nine Object Calisthenics rules, performs a self-code review, and documents non-trivial technical decisions — requires strong reasoning about code quality and architecture. |
| agent-3-tester | `.agents-brain/agent-3-tester.md` | haiku | Reads existing specs to identify test cases, writes and runs `npm run test`, and records structured pass/fail output — the work is mechanical and well-scoped. |
| agent-4-git | `.agents-brain/agent-4-git.md` | haiku | Executes a fixed sequence of git and GitHub CLI commands (fetch, branch, commit, push, PR, merge, cleanup) following explicit task numbers — no creative or analytical reasoning required. |
| agent-5-security | `.agents-brain/agent-5-security.md` | sonnet | Performs threat analysis across input validation, XSS surfaces, Netlify Function boundaries, CORS, secrets handling, and dependency risks — requires domain knowledge and nuanced judgment. |
| agent-6-reviewer | `.agents-brain/agent-6-reviewer.md` | sonnet | Cross-references implementation against business specs and security guidelines, runs lint and type-check, detects Vue reactivity pitfalls and TypeScript type-safety issues, and fetches reference documentation — requires broad technical judgment. |
| agent-7-pipeline-maintainer | `.agents-brain/agent-7-pipeline-maintainer.md` | sonnet | Diagnoses pipeline issues, identifies cascading effects across multiple agent files, and applies minimal targeted edits — requires careful reasoning about agent interdependencies. |

## Why agent-3-tester and agent-4-git Use Haiku

**agent-3-tester** follows a deterministic workflow: read the business spec and technical spec to identify scenarios, write `.spec.ts` test files, run `npm run test` from the worktree root, and record the output in a structured file ending with `status: passed` or `status: failed`. The agent does not design architecture, assess risk, or interpret ambiguous requirements. The test scenarios are already defined by the specs; the agent translates them into test code and reports results. This is well within Haiku's capability.

**agent-4-git** executes an explicitly numbered task list of shell and GitHub CLI commands. Each task specifies exactly what to run (e.g., `git fetch origin`, `git worktree add`, `gh pr create`, `gh pr merge --rebase --delete-branch`). The agent reads a fixed set of files for commit message content and applies conventional commit formatting. There is no branching logic, no judgment call, and no creative output. The work is wholly procedural and is a natural fit for a smaller, faster model.

Both agents benefit from Haiku's lower latency and cost, and neither loses quality because their tasks are bounded and instruction-driven.

## Criteria for Reassigning a Model

**Reassign up (Haiku to Sonnet) when:**

- The agent begins producing incorrect or incomplete output that correlates with reasoning complexity (e.g., the tester misidentifies test cases, or the git agent misreads commit scope from a large technical spec).
- The agent's task scope expands — for example, if the tester is asked to generate test strategies or evaluate coverage quality rather than just run existing tests.
- A new instruction requires the agent to make a judgment call rather than follow a fixed procedure.

**Reassign down (Sonnet to Haiku) when:**

- An agent's task is refactored to become fully procedural with explicit, unambiguous steps and no judgment required.
- Observed output quality for a Sonnet agent is consistently identical to what Haiku produces on the same prompts over multiple pipeline runs.

**Do not reassign based on cost alone.** Model selection must reflect task demand. A wrong model choice in a reasoning-heavy agent (specs, security, reviewer) will produce silent quality degradation that is harder to detect than a failed shell command.
