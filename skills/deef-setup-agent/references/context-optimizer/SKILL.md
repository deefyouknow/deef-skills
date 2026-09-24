---
name: context-optimizer
description: Audit and optimize project agent context for lower token use, better focus, and safer long-running work without changing project behavior.
---

# Context Optimizer

## Purpose
Reduce context waste while preserving operational knowledge, project behavior, and user-defined constraints.

Use when the user asks to optimize agent rules, token usage, context structure, repo navigation, handoffs, or persistent project memory.

Do not use for ordinary feature work, isolated bug fixes, or unrelated source refactors.

## Core Principles
1. Preserve meaning before reducing size.
2. Scope before shortening.
3. Reference before duplicating.
4. Search before broad reads.
5. Reuse existing authorities before creating new files.
6. Keep current-task state separate from durable project rules.
7. Prefer incremental migration over wholesale rewrites.
8. Do not modify unrelated source code.

## Operating Model

### 1. Discover
Inspect the repository shallowly first and locate existing instruction, architecture, plan, issue, and skill files.

Do not recursively load the whole repo.

### 2. Classify
Classify useful context as:
- permanent project-wide rule
- scoped/directory rule
- architecture or domain knowledge
- repo navigation knowledge
- durable decision
- active task state
- historical material
- duplicate
- stale or uncertain

Do not delete uncertain information.

### 3. Detect Waste
Look for duplicated rules, over-broad root instructions, stale task history, repeated commands/stack summaries, oversized tool output, and documentation that merely mirrors another authority.

### 4. Resolve Authority Conflicts
If two sources disagree, do not silently merge or choose one. Determine the declared source of truth, applicable scope/precedence, and current code/tests before moving rules. Preserve and report unresolved conflicts rather than optimizing them away.

### 5. Choose the Smallest Better Structure
Adapt to what already exists.

Do not create `docs/INDEX.md`, `CURRENT_TASK.md`, `HANDOFF.md`, nested `AGENTS.md`, or similar files automatically.

Create or split files only when they reduce repeated context, improve routing, or isolate a real scope.

If an existing source-of-truth section already routes agents effectively, keep and improve it instead of adding another index.

If plans, issues, and version-control history already provide bounded work memory, reuse them instead of creating a second task-memory system.

### 6. Patch Safely
If the user asked only for audit/review, stop after recommendations.

Before a multi-file or high-impact migration, establish a recoverable before-state using the project's existing VCS/checkpoint/snapshot mechanism when available. Do not force a branch workflow where the project does not use one.

If the user asked to apply optimization, make the smallest coherent changes and preserve existing commands, prohibitions, safety rules, release constraints, and non-obvious project quirks. Review the resulting diff before finalizing.

Never replace project-specific guidance with a generic template when the existing guidance is more precise.

## Context Discipline

- Start from root instructions plus only task-relevant authorities.
- Prefer repository-aware search and symbol/path lookup before opening large files.
- Use tools available in the environment; do not assume one search utility exists.
- Avoid vendor, generated, build, cache, VCS, and test-artifact directories unless relevant.
- Prefer partial reads, filtered results, and concise summaries over large dumps.
- Treat remaining context as a budget: when one tool result is broader than the current decision requires, filter or summarize it before continuing instead of carrying the raw output forward.
- Summarize long tool results before continuing when their raw form is no longer needed.
- Load only the skill relevant to the task; do not preload all skills.

## Scoped Rules

Move rules closer to the area they govern only when:
- the agent framework supports scoped/nested instructions,
- the rule is genuinely local,
- duplication is reduced,
- and the new scope remains discoverable.

Localness test: if the rule still matters when the agent works outside that scope, keep it at a broader authority instead of scoping it away.

Before moving critical rules across framework-specific scopes, verify current precedence/discovery behavior using `references/framework-precedence.md`.

Do not scatter universal safety or workflow rules across many nested files.

## Progressive Disclosure

Keep this `SKILL.md` focused on routing and decisions.

Load these references only when needed:
- `references/audit-rules.md` — detailed audit/classification guidance
- `references/migration-patterns.md` — safe restructuring patterns and anti-patterns
- `references/framework-precedence.md` — how to verify framework instruction discovery/precedence before scoping rules
- `references/verification.md` — before/after verification checklist

Use files under `templates/` only when creating a missing artifact is actually justified.

## Verification
Before reporting success:
- confirm no critical instruction disappeared,
- confirm references and paths resolve,
- confirm no unrelated project files changed,
- confirm duplicate context was reduced or better scoped,
- confirm a fresh agent can still find the authoritative information,
- and report unresolved uncertainty explicitly.

Do not claim exact token savings unless measured.

## Reporting
Report briefly:
1. what changed,
2. why it reduces context or improves routing,
3. what was intentionally preserved,
4. any remaining conflict or uncertainty.
