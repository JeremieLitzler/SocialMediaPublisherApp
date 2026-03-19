# Pipeline Documentation

This folder holds all multi-agent pipeline artifacts. It is a co-authored AI-human space: humans provide the request, agents generate and validate the specs and implementation notes. This is distinct from `docs/specs/` (requirements) and `docs/decisions/` (ADRs), which are maintained by humans.

## How to start the pipeline

Use the `/tackle` skill followed by the GitHub issue number:

```
/tackle 42
```

The orchestrator runs the full pipeline: specs → security → test cases → coding → review → tests → versioning → PR. Human approval gates apply after specs, after coding, before PR creation, and before merge.

## Task folder structure

All pipeline artifacts for a given task live in one folder:

```
docs/prompts/tasks/
  issue-[id]-[slug]/
    README.md                    ← user request (input)
    business-specifications.md   ← specs agent output
    security-guidelines.md       ← security agent output
    test-cases.md                ← test-writer agent output (pass 1)
    technical-specifications.md  ← coder agent output
    review-results.md            ← reviewer agent output
    test-results.md              ← test-runner agent output
```

## Agents and their prompt files

| Agent         | Prompt                                  | Reads                                                                                                                                                                          | Writes                                                             |
| ------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Specification | `.claude/agents/agent-1-specs.md`       | `[task-folder]/README.md`                                                                                                                                                      | `[task-folder]/business-specifications.md`                         |
| Security      | `.claude/agents/agent-5-security.md`    | `[task-folder]/business-specifications.md`                                                                                                                                     | `[task-folder]/security-guidelines.md`                             |
| Test Writer   | `.claude/agents/agent-3-test-writer.md` | `[task-folder]/business-specifications.md`, `[task-folder]/security-guidelines.md` (pass 1); `[task-folder]/test-cases.md`, `[task-folder]/technical-specifications.md` (pass 2) | `[task-folder]/test-cases.md` (pass 1); `.spec.ts` files (pass 2) |
| Coder         | `.claude/agents/agent-2-coder.md`       | `[task-folder]/business-specifications.md`, `[task-folder]/security-guidelines.md`, `[task-folder]/test-cases.md`                                                              | `[task-folder]/technical-specifications.md`                        |
| Reviewer      | `.claude/agents/agent-6-reviewer.md`    | `[task-folder]/technical-specifications.md`, `[task-folder]/security-guidelines.md`, `[task-folder]/business-specifications.md`                                                | `[task-folder]/review-results.md`                                  |
| Test Runner   | `.claude/agents/agent-3-test-runner.md` | `[task-folder]/technical-specifications.md`                                                                                                                                    | `[task-folder]/test-results.md`                                    |
| Versioning    | `.claude/agents/agent-4-git.md`         | `[task-folder]/business-specifications.md`, `[task-folder]/test-results.md`                                                                                                    | git history                                                        |

## Pipeline flow

```mermaid
flowchart TD
    userRequest([User request]) --> versioningBranch[Versioning agent<br />Task 1-2: fetch origin + create worktree]
    versioningBranch --> writeReadme[Orchestrator writes<br />README.md to worktree]
    writeReadme --> specsAgent[Specs agent<br />writes business-specifications.md]
    specsAgent -->|ADR Required → human approves| specsAgent
    specsAgent --> approveSpecs{Human approves<br />business specs?}
    approveSpecs -->|Rejected| stoppedAfterSpecs([Pipeline stopped])
    approveSpecs -->|Approved| versioningCommitSpecs[Versioning agent<br />Task 3: commit business-specifications.md]
    versioningCommitSpecs --> securityAgent[Security agent<br />writes security-guidelines.md]
    securityAgent -->|ADR Required → human approves| securityAgent
    securityAgent --> versioningCommitSecurity[Versioning agent<br />Task 3.5: commit security-guidelines.md]
    versioningCommitSecurity --> testWriterPass1[Test Writer agent (pass 1)<br />writes test-cases.md]
    testWriterPass1 --> versioningCommitTestCases[Versioning agent<br />Task 3.7: commit test-cases.md]
    versioningCommitTestCases --> coderAgent[Coder agent<br />writes technical-specifications.md]
    coderAgent -->|status: review specs → loop back| specsAgent
    coderAgent --> reviewerAgent[Reviewer agent<br />runs lint + type-check + writes review-results.md]
    reviewerAgent -->|status: changes requested → loop back| coderAgent
    reviewerAgent -->|ADR Required → human approves| reviewerAgent
    reviewerAgent --> approveTechnicalSpecs{Human approves<br />technical specs?}
    approveTechnicalSpecs -->|Rejected| stoppedAfterReview([Pipeline stopped])
    approveTechnicalSpecs -->|Approved| versioningCommitCode[Versioning agent<br />Task 4: commit source files + review-results.md]
    versioningCommitCode --> testWriterPass2[Test Writer agent (pass 2)<br />writes .spec.ts files]
    testWriterPass2 --> testRunnerAgent[Test Runner agent<br />runs npm test + writes test-results.md]
    testRunnerAgent -->|status: failed → loop back| coderAgent
    testRunnerAgent --> versioningCommitTests[Versioning agent<br />Task 5: commit test files + push branch]
    versioningCommitTests --> approvePR{Human approves<br />PR creation?}
    approvePR -->|Rejected| stoppedBeforePR([Pipeline stopped])
    approvePR -->|Approved| createPR[gh pr create]
    createPR --> approveMerge{Human approves<br />merge?}
    approveMerge -->|Rejected| prRemainsOpen([PR remains open])
    approveMerge -->|Approved| mergePR([gh pr merge + remove worktree])
```
