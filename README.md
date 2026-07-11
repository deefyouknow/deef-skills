# deef-skills

Agent skills loaded by Gemini, Cursor, Claude Code, and GitHub Copilot.

## Layout

Skills live under `skills/`, grouped into buckets:

- `engineering/` — system design, backend, database, embedded, security
- `productivity/` — non-code workflow tools *(coming soon)*
- `in-progress/` — drafts not yet ready to ship

Each skill is its own directory containing a `SKILL.md` (with YAML frontmatter — `name` and `description`) and any bundled reference files.

## Install

**With npx (works for every agent)**

```bash
npx github:deefyouknow/deef-skills
```

The interactive installer detects your agents, lets you pick which skills to install, and copies everything to the right location automatically.

**Supported agents**

| Agent | Install location |
|-------|-----------------|
| 🔮 Gemini / Antigravity | `~/.gemini/config/skills/` (global) or `.agents/skills/` (local) |
| 🤖 Claude Code | `~/.claude/CLAUDE.md` (global) or `CLAUDE.md` (local) |
| 🖱️ Cursor | `.cursor/rules/<skill>.mdc` |
| 🌊 Windsurf | `~/.codeium/windsurf/memories/global_rules.md` (global) or `.windsurfrules` (local) |
| ⚡ Cline | `.clinerules` |
| 🦘 Roo Code | `.roo/rules/<skill>.md` |
| 🔢 Kilo Code | `.kilocode/rules/<skill>.md` |
| 🤝 Aider | `CONVENTIONS.md` |
| 🌀 OpenAI Codex / Amp | `AGENTS.md` |
| 🐙 GitHub Copilot | `.github/copilot-instructions.md` |

## Reference

### Engineering

- **system-architecture** — Deep-dive reference for fast, maintainable systems. Covers clean code/SOLID, backend runtime selection (Rust/Axum, Go, Node+Fastify), PostgreSQL pooling with PgBouncer, Redis caching and stampede prevention, frontend Atomic Design, ESP32/Arduino embedded firmware, testing strategy, CI/CD pipelines, and API security.
