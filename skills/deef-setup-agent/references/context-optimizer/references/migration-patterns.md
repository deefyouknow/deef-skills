# Migration Patterns

Use this reference only when an audit shows that restructuring would materially improve context quality.

## Pattern 1 — Root Router
Keep root instructions short and authoritative.

Root should normally contain:
- universal workflow
- safety and destructive-action boundaries
- source-of-truth routing
- verification expectations

Move subsystem-specific detail elsewhere when the agent framework can discover it reliably.

## Pattern 2 — Scoped Instructions
Use nested/scoped rules when one subsystem has substantial local rules and most tasks elsewhere do not need them.

Good candidates include frontend, backend, infrastructure, or a domain with special invariants.

Cross-cutting safety, secret handling, destructive-action boundaries, and repository-wide verification usually remain broad. Styling conventions or module-layout rules that are meaningless outside one subtree are stronger candidates for local scope.

Do not repeat root rules in every scope.

## Pattern 3 — Existing Memory First
Before creating task or handoff files, check whether plans, issue tracking, version-control history, or another bounded state mechanism already serves that purpose.

Add a new memory layer only if it removes repeated context or solves a real continuation problem.

## Pattern 4 — Compatibility Shim
Framework-specific files should point to the primary project authority whenever possible instead of duplicating it.

Keep only genuinely framework-specific exceptions in the shim.

## Pattern 5 — Context-Safe Tool Use
Prefer targeted search, partial reads, filtered diffs, and relevant test output.

Avoid scanning dependency, build, cache, VCS, generated, or test-artifact directories unless the task requires them.

## Pattern 6 — Recoverable Migration
Prefer the recovery mechanism the project already trusts: an existing clean checkpoint, local version-control commit, snapshot, or backup. In a dirty/concurrent workspace, isolate only the optimizer's files and never reset unrelated work. Compare the final change against that before-state before declaring the migration complete.

## Anti-Patterns
- creating a new index when a source-of-truth router already exists
- adding CURRENT_TASK/HANDOFF by default
- copying manifests or command lists into multiple agent files
- moving critical rules into files agents will not reliably discover
- optimizing line count while making information harder to find
