# 🧠 Deef Skills

> Engineering skill packs for AI coding agents — one command installs any skill into Gemini, Cursor, Claude Code, or GitHub Copilot.

```bash
npx @deefyouknow/skills
```

---

## ✨ Available Skills

| Skill | Topics |
|-------|--------|
| **system-architecture** | Clean Code/SOLID, Backend (Rust/Go/Node), PostgreSQL+PgBouncer, Redis caching, Frontend Atomic Design, ESP32/Arduino embedded, Testing, CI/CD, API Security |

> More skills coming soon — just add a folder to `skills/` and it's automatically available.

---

## 🚀 Installation

Run the interactive installer:

```bash
npx @deefyouknow/skills
```

It will:
1. Detect which AI agents you have installed
2. Let you **pick which skills** to install (multi-select)
3. Let you pick the target agent
4. Install everything automatically

### What it looks like

```
  🧠 Deef Skills   AI Coding Agent Skill Installer

◇  Found 1 skill

│  Agents on this system
│  ● 🔮 Gemini / Antigravity
│  ● 🤖 Claude Code
│  ○ 🖱️ Cursor  (not detected)

◆  Select skills to install:
│  ◼ system-architecture  Deep-dive engineering reference...
└

◆  Select target agent:
│  ✓ 🔮 Gemini / Antigravity   detected
│  ✓ 🤖 Claude Code            detected
└

◆  Select install scope:
│  ● 🌍 Global   ~/.gemini/config/skills/  (all projects)
│  ○ 📁 Local    .agents/skills/           (this workspace only)
└

│  Installed to 🔮 Gemini / Antigravity (global)
│  ✔  System Architecture Guide
│     /Users/you/.gemini/config/skills/system-architecture
│
│  Restart your agent to load the new skills.

🎉  All 1 skill installed successfully!
```

---

## 🤖 Supported Agents

| Agent | Detection | Install Location |
|-------|-----------|-----------------|
| **Gemini / Antigravity** | `~/.gemini` exists | `~/.gemini/config/skills/<skill>/` (global) or `.agents/skills/<skill>/` (local) |
| **Cursor** | `.cursor/` or `.git` | `.cursor/rules/<skill>.mdc` |
| **Claude Code** | `.git` | Appended to `CLAUDE.md` |
| **GitHub Copilot** | `.git` | `.github/copilot-instructions.md` |

---

## 📁 Repository Structure

```
├── bin/cli.js              ← npx entry point
├── src/cli.js              ← interactive installer
├── skills/
│   └── system-architecture/
│       ├── SKILL.md        ← main skill file
│       └── references/     ← detailed reference docs
│           ├── clean-code-architecture.md
│           ├── backend-server.md
│           ├── postgres-pgbouncer.md
│           ├── redis-caching.md
│           ├── frontend-atomic-design.md
│           ├── embedded-esp32-arduino.md
│           ├── testing-strategy.md
│           ├── cicd-pipeline.md
│           └── api-security.md
└── package.json
```

---

## 📦 Publishing

```bash
npm login
npm publish --access public
```

After publishing, anyone can install your skills with:

```bash
npx @deefyouknow/skills
```

---

## License

MIT © deefyouknow
