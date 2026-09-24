# Deef Skills

Choose and install ready-to-use skills for Gemini, Claude Code, Cursor, Windsurf, Cline, Roo Code, Kilo Code, Aider, OpenAI Codex, or GitHub Copilot.

## Quick install

Requirements: Node.js 18 or newer and npm.

Run this from the project where you want to use the skill:

```bash
npx github:deefyouknow/deef-skills
```

The installer lists available skills in alphabetical order, detects agent configuration when it can, and lets you choose a skill, target agent, and install scope. Detection is a convenience; you can still select an agent that was not detected. Restart the agent after installation so it reloads its instructions.

Choose **Local** to keep a bundle in the current project or **Global** to make it available across projects when the selected agent supports that scope. Agent instruction files point to the installed skill bundle, so its references and scripts remain available. Running the installer again replaces an existing skill with the current bundle and labels it **Updated**. This removes custom files stored inside that skill's install folder.

## Available skills

| Skill | Use it for |
| --- | --- |
| `coding-style` | Consistent, maintainable code across languages |
| `deef-setup-agent` | Project agent instructions and task-based file navigation |
| `minecraft-bedrock-native-macos-arm64` | Running and repairing native Bedrock on Apple Silicon with the custom runtime |
| `readable-markdown` | Making raw Markdown files easier to read in an editor or terminal |
| `react-tailwind-ui-system` | Reusable React and Tailwind interface design |
| `system-architecture` | System design, backend, databases, embedded work, testing, and API security |

The installer discovers skills from folders directly under `skills/` that contain a `SKILL.md`. Each skill can include its own references, templates, and scripts.

## Supported agents

| Agent | Local instruction entrypoint |
| --- | --- |
| Gemini / Antigravity | `.agents/skills/` bundle |
| Claude Code | `CLAUDE.md` |
| Cursor | `.cursor/rules/<skill>.mdc` |
| Windsurf | `.windsurfrules` |
| Cline | `.clinerules` |
| Roo Code | `.roo/rules/<skill>.md` |
| Kilo Code | `.kilocode/rules/<skill>.md` |
| Aider | `CONVENTIONS.md` |
| OpenAI Codex / Amp | `AGENTS.md` |
| GitHub Copilot | `.github/copilot-instructions.md` |

## Run from a clone

```bash
npm install
npm start
```

## Add a skill

Create `skills/<skill-id>/SKILL.md` with `name` and `description` frontmatter. Put supporting references, templates, or scripts inside that skill's folder. The installer picks it up automatically; add it to the table above so people can choose confidently. Preview the distributable bundle with `npm pack --dry-run`.
