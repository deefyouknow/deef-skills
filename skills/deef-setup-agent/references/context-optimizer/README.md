# Context Optimizer Skill

Reusable skill for reducing agent-context waste without changing project behavior.

## Structure

- `SKILL.md` — compact routing, decision rules, and safe workflow
- `references/audit-rules.md` — deeper audit/classification guidance
- `references/migration-patterns.md` — restructuring patterns and anti-patterns
- `references/framework-precedence.md` — framework discovery/precedence verification before scoped migrations
- `references/verification.md` — before/after verification
- `templates/` — optional examples; load only when a new artifact is justified

## Design

The skill uses progressive disclosure: agents read the compact `SKILL.md` first and load references/templates only when the current audit requires them.

It must adapt to the project that already exists. It should not create indexes, handoff files, nested instructions, or other context artifacts merely because templates are available.

## Packaging

When distributing the skill as an archive, exclude operating-system metadata such as `__MACOSX/` and `.DS_Store`. Package the skill directory itself, not unrelated repository files.
