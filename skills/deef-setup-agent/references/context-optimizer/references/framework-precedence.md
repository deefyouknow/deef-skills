# Framework Precedence

Use this reference only when an optimization depends on moving rules between global, project, nested, or framework-specific instruction files.

## Principle
Instruction discovery and precedence are runtime/framework behavior, not a universal convention. Do not assume that similarly named files are merged, inherited, or scoped the same way across agents.

Current framework documentation or directly verified behavior takes precedence over this reference. Framework behavior can change over time.

## Verify Before Scoping
Determine, for the agent/framework that will actually run the project:
- which instruction filenames/locations are recognized
- where discovery starts and stops
- whether nested instructions inherit, merge with, or replace broader instructions
- which rule wins when parent and child instructions conflict
- whether scope depends on current working directory, target file path, or another mechanism
- whether compatibility files are automatically loaded or merely conventional
- whether the same repository must support more than one agent framework

Examples of frameworks that may require separate verification include Codex/OpenAI agents, Claude Code, OpenCode, Cursor, and GitHub Copilot. Do not infer one framework's behavior from another.

## Safe Migration Gate
Do not move a critical rule out of a broader authority until the target framework is known to apply the narrower rule where needed.

If precedence or discovery is unclear:
1. keep the critical rule at the broader authority,
2. avoid creating duplicate copies as a workaround,
3. report the uncertainty,
4. verify behavior before attempting the scoped migration.

When a project intentionally supports multiple frameworks, prefer one primary authority plus thin compatibility shims where the frameworks permit it.

## Durable Evidence
If framework behavior is important enough to constrain project structure, record the verified behavior briefly with the framework/version or verification date when practical. Keep volatile framework details out of permanent instructions unless the project actually depends on them.
