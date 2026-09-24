# Safe setup and compatibility

## Preserve the before-state

Inspect target files and current changes before writing. Uncommitted and untracked files can contain user work. For a multi-file migration, retain affected content using an available local snapshot or backup; do not auto-commit, stash, reset, or overwrite unrelated work.

Check whether paths are protected, generated, or symlinked. Resolve symlink targets before editing; do not follow writes outside authorized scope. If a required file cannot be changed, prepare the proposed content in an allowed location and report the limitation rather than bypassing the boundary.

## Managed section update

Use the exact `<!-- deef-setup-agent:start -->` and `<!-- deef-setup-agent:end -->` markers in project `AGENTS.md`.

- Missing file: create it with a clear title and one managed section.
- Existing file without markers: preserve its content and append one section after checking for conflicting instructions.
- Exactly one ordered pair: update only the bounded section. Preserve all text outside it and retain verified routes and still-applicable project adaptations inside it.
- Unmatched, nested, or multiple pairs: inspect ownership and intended content first. Do not use greedy replacement, append another pair, or delete ambiguous content. Repair only when ownership is clear; otherwise finish unaffected work and report the specific conflict.

Preserve installer/skill-loader sections and other tools' markers. User-owned instructions outside this section remain authoritative. Adapt baseline defaults to applicable project rules. If project authorities conflict and evidence cannot resolve the intended behavior, ask about that specific conflict before changing the affected rule.

Repeated setup with unchanged evidence should produce no content changes: reuse route locations, keep stable ordering, and avoid timestamps, duplicate routes, or new artifacts.

## Framework routing

Detect usage from explicit user choice, active configuration, or existing instruction entrypoints. Do not copy the installer's supported-agent list into every project.

1. Determine discovery behavior from installed tooling/help/configuration; consult current official documentation when needed. Read [framework-precedence.md](context-optimizer/references/framework-precedence.md) when compatibility or scoping depends on inheritance.
2. If the framework already loads the canonical project file, add nothing.
3. Otherwise use a supported import or minimal instruction to read it in a discovered entrypoint. Preserve existing framework content. Use a clearly bounded DEEF-owned section if comments are supported, otherwise a minimal structured edit.
4. Resolve paths from the documented base directory. Avoid circular references and unnecessary native configuration changes.
5. Verify discovery and scope where tooling permits. Label routing as statically configured when automatic loading has not been observed.

Do not invent import syntax, replace a whole configuration, or duplicate the complete baseline across adapters. If reliable routing cannot be established, report that framework as unresolved rather than claiming universal compatibility.
