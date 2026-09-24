# Audit Rules

Use this reference when the repository has multiple instruction or knowledge files and the correct ownership is unclear.

## Inventory
Check for:
- root and nested agent instruction files
- framework-specific instruction files
- architecture/domain docs
- README/setup docs
- plans, issues, handoff notes, ADRs
- project-local skills
- generated or copied knowledge summaries

Start shallow. Expand only when evidence requires it.

## Classification
For each meaningful block, assign one owner:
- universal workflow/safety
- directory-specific rule
- architecture/domain invariant
- command/setup information
- active task state
- durable decision
- historical/reference-only material
- duplicate
- conflicting authority
- stale/uncertain

## Waste Signals
Prioritize these:
- the same fact appears in two or more always-read files
- root rules contain details needed by only one subsystem
- commands are copied from the actual package/tooling authority
- stack/version summaries duplicate manifests
- completed task history remains in permanent context
- raw logs or large tool output are stored as agent memory
- one document exists only to repeat another document
- a compatibility file duplicates the primary instruction file instead of pointing to it
- a referenced path/file no longer exists or moved without the documentation being updated
- a documented command/script no longer exists in the current tooling authority
- an old document still describes a subsystem whose current code or structure has materially changed

## Conflict Signals
Treat disagreement as higher risk than duplication. Compare declared ownership, scope, precedence, and current code/tests before deciding which source is authoritative. Do not collapse conflicting rules into one until the conflict is resolved.

## Uncertainty Rule
Do not remove content merely because it looks old.

If authority, freshness, or consumers are unclear, mark it for review and preserve it until verified.
