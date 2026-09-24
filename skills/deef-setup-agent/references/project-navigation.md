# Project navigation

## Reuse before creating

Check whether `AGENTS.md`, a README section, docs index, or project map already answers “where should I look for this task?” Improve that location. Keep one navigation authority and link to it from the managed rules.

For a small project, add a short `Project routes` section inside the managed block. For several independent areas, use the existing docs convention; `docs/PROJECT_MAP.md` is a fallback when no suitable location exists. The map can itself serve as the index. Do not create both merely to link one to the other.

## Populate from the current tree

Build routes for real task areas rather than a directory listing. A useful route answers:

| Task area | Open first | Expand only when needed | Validation authority |
| --- | --- | --- | --- |
| Concrete feature or workflow | Existing entry file or owning module | Relevant caller, contract, or design doc | Existing test/config/script source |

The row describes a schema, not content to copy. Include only areas found in the target. Use human-readable task terms and concrete paths or search anchors. Lead to the next decision without requiring every document to be read.

- Check an entry file and relevant imports/callers before stating ownership. Mark uncertainty if behavior has not been traced.
- Prefer links to script definitions and CI over copying full command catalogs. If a short command is useful, verify it exists, state its working directory, and identify required services or side effects.
- Keep non-obvious invariants in their existing authority and link them from the affected route.
- State that paths are project-relative, or use actual relative Markdown links from the containing document; use the chosen convention consistently.
- Include only existing paths. Do not emit empty sections, placeholders, or links to planned files as if they already exist.
- Avoid per-file inventories, line-number indexes, copied manifests, raw logs, and generated stack summaries.

## Search fallback and maintenance

Installed rules require targeted search when a route is missing or stale. Do not regenerate the index on every task. Update the affected route when an entrypoint, ownership boundary, command source, or authoritative document changes.

Reuse existing code navigation/indexing tools. Add a generated index or helper script only when repeated navigation cost justifies maintenance and the output has a clear consumer.

## Navigation walkthrough

Choose one real small edit and one cross-cutting task from the target. Starting at `AGENTS.md`, trace the required files. The small edit should avoid unrelated documents; the complex task should reveal relevant contracts, constraints, and checks. Label this a static walkthrough unless an actual agent performs the tasks.
