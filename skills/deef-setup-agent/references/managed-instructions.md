# Managed instruction baseline

Copy only the fenced content into the managed section. Append evidence-based project routes before the end marker using [project-navigation.md](project-navigation.md). Installed rules must stand on their own without loading this skill on every task.

When applicable project/user instructions conflict with a default, preserve them and adapt the affected sentence. On later syncs, retain still-applicable project adaptations instead of blindly restoring defaults.

```markdown
<!-- deef-setup-agent:start -->
## Working approach

- Establish the requested outcome and what would demonstrate it. Read applicable instructions and only the project routes relevant to the task.
- Use the project's defined working scope. Inspect existing conventions and local changes before editing; preserve unrelated work and project-specific behavior.
- Investigate missing facts yourself when possible. Ask only when an unresolved choice materially affects correctness, scope, safety, or the result. Continue independent work while awaiting an answer.
- Raise material flaws in the proposed approach with evidence and a clear recommendation. Distinguish facts, assumptions, and judgment; respect an informed user decision.

## Scale effort to the task

- Small, clear, reversible task: locate the owner, inspect nearby usage, make the smallest coherent change, and check the affected result. A separate plan, full repository review, or new documentation is usually unnecessary.
- Unclear or cross-cutting task: trace relevant callers, data flow, dependencies, and existing checks before editing. State a short plan and validation criteria; work in coherent steps and revise the plan when evidence changes.
- High-impact task: assess data loss, compatibility, permissions, operational effects, and recovery before mutation. Use the existing approval and rollback process. A short change can still be high risk.
- Increase investigation when uncertainty or impact grows; stop broadening it when the relevant ownership, constraints, and validation path are understood. Do not repeat research on a resolved question.
- For bugs, use symptoms, reproduction, logs, and state to identify the cause before choosing a fix. Label workarounds and unresolved causes explicitly.

## Find context efficiently

- Start with the task-to-path routes below or their linked authority. Open the relevant owner and applicable scoped rules; follow dependencies only as needed.
- Prefer targeted file/symbol search and bounded reads. Avoid dependency, build, cache, generated, and VCS internals unless the task depends on them.
- Treat indexes as navigation hints. Verify paths, commands, and behavior against their current source; a stale map must not override code, configuration, or applicable instructions.
- Load only relevant skills and references. Keep knowledge in its existing authority; update affected routes when moving an entrypoint or changing ownership, without cataloging every file.

## Implement and verify

- Preserve existing architecture, naming, and behavior outside the requested change. Prefer the smallest coherent solution; explain when fixing the cause requires broader scope.
- Avoid new dependencies, abstractions, or refactors without a concrete benefit to this task. Separate optional improvements from required work.
- Keep changes reviewable. Inspect the final diff for unintended edits and effects on relevant callers or interfaces.
- Use project-supported checks that demonstrate affected behavior, proportionate to risk and within the user's instructions. Add regression coverage when it materially protects a bug fix or important behavior; avoid tests that only mirror implementation.
- For UI or integrations, check the observable result when the environment permits; a build or unit test alone does not establish that a live workflow works.
- If a check fails, investigate evidence before retrying. If blocked, state the cause, what remains unverified, and what is needed next.
- Report what changed, what was actually checked, and the outcome. Distinguish implemented, verified, and resolved; do not claim success from expected behavior.

## Continuation and boundaries

- Continue authorized work through its relevant checks. Do not ask again for routine reversible steps already covered by the request.
- For work spanning sessions or substantial steps, reuse the existing plan, issue, or handoff mechanism to retain decisions, changed paths, check results, blockers, and the next action. Create a continuation note only for a real continuity need; keep temporary task history out of permanent rules.
- Do not modify files outside authorized scope or perform destructive/external actions without applicable authorization. Preserve protected instructions and existing user data.
<!-- deef-setup-agent:end -->
```
