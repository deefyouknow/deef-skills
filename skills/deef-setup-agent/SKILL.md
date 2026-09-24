---
name: deef-setup-agent
description: Set up or repair project agent rules and task-based file navigation so agents handle small edits directly and complex work with proportionate investigation, planning, and verification. Use for bootstrapping AGENTS.md or improving project agent setup, not ordinary implementation tasks.
---

# DEEF Setup Agent

Configure the target project's agent workflow in one invocation. Produce usable rules and navigation from the actual project, rather than stopping at a proposed design. For an audit-only request, report findings without writing.

## Outcome and boundaries

- Use project `AGENTS.md` as the shared entrypoint; preserve applicable user instructions and project-specific constraints.
- Keep small tasks direct. Add investigation as uncertainty, dependencies, and consequences increase.
- Make the next relevant file easy to find. Prefer an existing router; a short inline map can be enough.
- Setup changes instruction and navigation artifacts. It does not authorize application refactors, framework installation, deployment, or global configuration changes.
- Do not edit protected global instructions, including `~/.AGENT.md`. Do not apply setup to the skill's own repository unless that is the requested target.

## 1. Establish the target and inspect narrowly

Use the user's target path, otherwise the current project scope. Confirm boundaries from applicable instructions and project metadata; do not assume a Git root owns every subproject. Ask only if multiple plausible targets remain and choosing one changes where files would be written.

Inspect applicable instructions, current changes, top-level structure, documentation routes, and relevant manifests/CI. Prefer `rg --files` and targeted searches. Include relevant hidden agent configuration explicitly; exclude dependency, build, cache, generated, and VCS internals. Read deeper only to resolve a concrete question.

Identify project constraints and conflicts, likely task areas and entry files, sources for validation commands, and frameworks requested or evidenced by active project configuration. `.git`, a home-directory tool install, or a sample configuration does not prove project usage of a framework.

## 2. Choose the smallest useful setup

| Project evidence | Setup |
| --- | --- |
| Small project with obvious entry files | Managed rules plus a few inline routes in `AGENTS.md` |
| Useful README/docs index/project map | Improve and link that authority; avoid a second index |
| Multiple areas expensive to rediscover | One concise task-to-path map in the existing docs location |
| Significant local constraints | Scoped rules only after framework discovery and precedence are verified |
| Conflicting or heavily duplicated instruction systems | Audit affected context before migrating it |

Read [project-navigation.md](references/project-navigation.md) to populate routes from evidence. Project size determines navigation needs, not the difficulty of every future task.

Do not scaffold `.agent/`, architecture docs, decision logs, task memory, or plans solely because setup is running. Create an artifact only when it serves a demonstrated need.

## 3. Write working rules and routes

Read [managed-instructions.md](references/managed-instructions.md) for the baseline to install, and [safe-setup.md](references/safe-setup.md) for managed-section updates and framework routing.

Install the baseline inside the project's `<!-- deef-setup-agent:start -->` / `<!-- deef-setup-agent:end -->` section. Add project-specific routes inside that section, or link the existing navigation authority. User/project requirements take priority over baseline defaults; resolve conflicts before changing behavior.

Use verified paths and command sources, with working directories where needed. Preserve project-specific knowledge and unrelated content. Complete authorized setup without asking for routine approval of file names or layout.

Connect only requested or evidenced frameworks using their verified discovery/import mechanism. A Markdown link alone is not proof that a framework loads instructions.

## 4. Review proportionately

For simple setup, inspect the resulting rules, routes, and diff directly. When duplication, conflicting authority, or migration makes deeper review useful, load the bundled [context optimizer](references/context-optimizer/SKILL.md), then only its relevant references. It advises setup; it does not replace the managed baseline or create a second workflow.

Read [verification.md](references/verification.md) before reporting completion. Check discoverability, preservation, rerun behavior, and whether small and complex tasks have a clear path. Distinguish static checks from an actual target-agent run.

Report files changed, how tasks find context, checks performed, and material limitations. Do not claim measured speed or quality gains without observing them.
