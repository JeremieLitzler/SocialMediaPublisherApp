Write the business specifications for a feature. Task folder: $ARGUMENTS

`$ARGUMENTS` must be the absolute path to the task folder created by `/jli-git-setup`
(e.g. `…/<type>_<slug>/docs/prompts/tasks/issue-<id>-<slug>`). If it is empty, stop and reply:

> Usage: `/jli-spec <task-folder>` — I need the absolute task-folder path printed by
> `/jli-git-setup`.

Derive the worktree root `[worktree]` from the argument: it is the substring before
`/docs/prompts/tasks/`. Resolve every path below under `[worktree]`. This command reads and
writes only inside `[worktree]`.

## What this command does

Read the feature request in `[task-folder]/README.md` (this is the input — this phase does
not read any other artifact). Using the project context in `CLAUDE.md` and `README.md`,
write a detailed business spec to `[task-folder]/business-specifications.md`.

The spec describes WHAT the system does — goals, rules, constraints, observable outcomes —
never HOW. Use the Example Mapping method.

The spec must include:
- Goal and scope of the change
- Files to create or modify, and each file's role (without prescribing internal structure)
- Edge cases described as user-visible / externally observable consequences
- Concurrency or performance requirements stated as qualities of the outcome, not as
  implementation blueprints

Do NOT include: function signatures, method/parameter names, pseudocode or code snippets,
exact variable/field names, import lists, or any other implementation detail.

### Conciseness rules (strictly enforced)
- At most 1 example per rule; omit the example if the rule is self-evident.
- Integrate edge cases into the rule they qualify — no standalone Edge Cases section.
- Do not repeat CLAUDE.md, existing ADRs, or the README; reference them by name.
- Target 60 lines maximum. Cut rules that only restate decisions already in CLAUDE.md/ADRs.

Ask up to 10 clarifying questions about architecture, edge cases, and dependencies if
needed. DO NOT GUESS.

## ADR requirement

If the spec introduces a new architectural pattern not yet documented in `docs/decisions/`,
add this section before the final status line:

```
### ADR Required

[Description of the new architectural pattern and why it is needed]
```

(AWS definition of an ADR: a short structured document capturing a significant, high-impact
architectural choice with its context, rationale, and consequences. In doubt, ask the user.)

## Output contract

Create `[task-folder]/business-specifications.md`. End it with `status: ready` as the last
line. Do NOT use horizontal rules (`---`) anywhere in the file.

## Shell command retry limit

Do not run more than 3 failing shell commands in total. After 3 failures, stop and report
the full error output to the user.

## Next

Show the user a short summary of the spec, then:

- If the file contains `### ADR Required`:
  > ⚠ This spec requires a new ADR. Review and approve the ADR before continuing. Once
  > approved (add it under `docs/decisions/` and update `docs/decisions/README.md`), run
  > `/jli-git-commit [task-folder]`.
- Otherwise:
  > Spec ready. Review `[task-folder]/business-specifications.md`, then run
  > `/jli-git-commit [task-folder]`, then (optionally `/clear` and) `/jli-security [task-folder]`.
