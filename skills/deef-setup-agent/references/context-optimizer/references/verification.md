# Verification

Use this after applying context optimization.

## Before vs After
Verify:
- every critical constraint still exists somewhere authoritative
- commands and operational procedures were not changed accidentally
- destructive-action, deployment, database, and secret-handling rules remain intact
- moved rules are discoverable in the scopes where they apply
- framework precedence/discovery was verified when a scoped migration depended on it
- compatibility files still route correctly
- moved and newly created references resolve to real files
- known authority conflicts were resolved explicitly or remain preserved and reported

## Context Quality
Check that:
- root always-loaded instructions are smaller or more focused
- subsystem-only rules no longer burden unrelated work when safe to scope them
- duplicate summaries were removed or replaced with references
- distinctive hard constraints, commands, or routing phrases are searched across always-read instruction files to catch accidental duplicated authority; semantic review still decides whether two differently worded rules are actually duplicates
- historical/task-specific information is not treated as permanent authority
- large generated/vendor directories are excluded from routine exploration
- tool output guidance favors bounded results

## Fresh-Agent Test
A fresh agent should be able to answer:
1. What are the universal project rules?
2. Where is the authority for the current task?
3. Which deeper document should be read next?
4. Which information should not be loaded unless relevant?

If these answers became less obvious, the optimization is not complete.

## Change Boundary
For multi-file or high-impact migrations, confirm a recoverable before-state existed and the final diff was reviewed against it.

Confirm that only context/instruction artifacts intended by the task changed.

Do not modify application source merely to make the documentation structure look cleaner.

## Savings
When practical, record before/after measurements for the files actually changed using available deterministic metrics such as line count, byte/character size, or a suitable tokenizer estimate.

Prefer measured results over qualitative claims. If measurement is unavailable, say only what changed structurally (for example, "root always-loaded context is more focused").

Do not invent percentage or token savings without measurement.
