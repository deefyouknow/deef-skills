# 🧠 System Architecture Guide

> An opinionated engineering skill pack for AI coding agents — covering system design, databases, caching, embedded firmware, security, and more.

Install this skill into your AI coding agent so it gets deep engineering context right in your editor, without you having to repeat yourself every session.

---

## ✨ What's Inside

| Topic | What it covers |
|-------|---------------|
| **Clean Code & Architecture** | SOLID principles, guard clauses, folder layout, JSDoc conventions |
| **Backend Server Design** | Rust/Axum vs Go vs Node+Fastify decision table, middleware ordering, concurrency patterns |
| **PostgreSQL + PgBouncer** | Connection pooling architecture, pool sizing formula, PgBouncer config, failure modes |
| **Redis Caching** | Cache-aside pattern, stampede prevention, Token Bucket rate limiting via Lua, eviction policies |
| **Frontend Atomic Design** | Atoms→Organisms hierarchy, design tokens, React component patterns, Next.js App Router |
| **ESP32 / Arduino Embedded** | Non-blocking state machines, MQTT with backoff, OTA updates, deep sleep power management |
| **Testing Strategy** | Test pyramid, testcontainers, hardware-in-loop, flaky test prevention |
| **CI/CD Pipeline** | GitHub Actions templates, Dockerfile best practices, deployment strategies, OTA rollout |
| **API Security** | JWT rotation, CORS config, IDOR prevention, SQL injection defense, security headers |

---

## 🚀 Installation

Run the interactive installer — it auto-detects your agents and guides you through setup:

```bash
npx @thanawat/system-architecture-guide
```

### What it looks like

```
  🧠 System Architecture Guide   AI Coding Agent Skill Installer

◇  Agent detection complete
│
│  Agents found
│  ● 🔮  Gemini / Antigravity
│  ● 🤖  Claude Code
│  ○  🖱️  Cursor  (not detected)
│

◆  Select target agent:
│  ✓ 🔮  Gemini / Antigravity        detected
│  ✓ 🤖  Claude Code                 detected
│  ○  🖱️  Cursor                      not detected — install anyway?
└

◆  Select install scope:
│  ● 🌍  Global   ~/.gemini/config/skills/  (all projects)
│  ○ 📁  Local    .agents/skills/           (this workspace only)
└

◇  Installation complete
│  ✔  Agent  : 🔮 Gemini / Antigravity
│  ✔  Scope  : global
│  ✔  Path   : /Users/you/.gemini/config/skills/system-architecture-guide

🎉  Skill installed successfully!
```

---

## 🤖 Supported Agents

| Agent | Detection | Install Location |
|-------|-----------|-----------------|
| **Gemini / Antigravity** | `~/.gemini` exists | `~/.gemini/config/skills/` (global) or `.agents/skills/` (local) |
| **Cursor** | `.cursor/` or `.git` exists | `.cursor/rules/system-architecture-guide.mdc` |
| **Claude Code** | `.git` exists | Appended to `CLAUDE.md` |
| **GitHub Copilot** | `.git` exists | `.github/copilot-instructions.md` |

---

## 🛠️ Manual Installation

### Gemini / Antigravity (Global)

```bash
# Copy the skill folder to Gemini's global skills directory
cp -r node_modules/@thanawat/system-architecture-guide/skill \
  ~/.gemini/config/skills/system-architecture-guide
```

### Cursor

Copy `skill/SKILL.md` into `.cursor/rules/system-architecture-guide.mdc` in your workspace.

### Claude Code

Append the contents of `skill/SKILL.md` to your workspace's `CLAUDE.md`.

### GitHub Copilot

Append the contents of `skill/SKILL.md` to `.github/copilot-instructions.md`.

---

## 📁 Repository Structure

```
├── bin/
│   └── cli.js            ← npx entry point
├── src/
│   └── cli.js            ← interactive installer logic
├── skill/
│   ├── SKILL.md          ← main skill file (agent reads this)
│   └── references/       ← detailed reference docs loaded on demand
│       ├── clean-code-architecture.md
│       ├── backend-server.md
│       ├── postgres-pgbouncer.md
│       ├── redis-caching.md
│       ├── frontend-atomic-design.md
│       ├── embedded-esp32-arduino.md
│       ├── testing-strategy.md
│       ├── cicd-pipeline.md
│       └── api-security.md
└── package.json
```

---

## 📦 Publishing Updates

```bash
# Bump version in package.json, then:
npm publish --access public

# Or tag a release for GitHub Actions to auto-publish:
git tag v1.0.1
git push origin v1.0.1
```

---

## License

MIT © Thanawat
