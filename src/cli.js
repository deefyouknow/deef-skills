import {
  intro,
  outro,
  select,
  spinner,
  isCancel,
  cancel,
  note,
  log,
} from '@clack/prompts';
import pc from 'picocolors';
import { homedir } from 'os';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SKILL_DIR = join(__dirname, '..', 'skill');
const SKILL_NAME = 'system-architecture-guide';

// ─── Utilities ──────────────────────────────────────────────────────────────

async function pathExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function readSkillMd() {
  return fs.readFile(join(SKILL_DIR, 'SKILL.md'), 'utf-8');
}

function injectSkillBlock(existing, skillContent, skillName) {
  const markerStart = `<!-- agent-skill-start: ${skillName} -->`;
  const markerEnd = `<!-- agent-skill-end: ${skillName} -->`;
  const block = `${markerStart}\n${skillContent.trim()}\n${markerEnd}`;
  // Remove old version if present
  const regex = new RegExp(
    `${markerStart.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${markerEnd.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
    'g'
  );
  const cleaned = existing.replace(regex, '').trim();
  return cleaned ? `${cleaned}\n\n${block}` : block;
}

// ─── Agent Definitions ───────────────────────────────────────────────────────

const AGENTS = [
  {
    id: 'gemini',
    name: 'Gemini / Antigravity',
    icon: '🔮',
    supportsGlobal: true,
    async detect() {
      return pathExists(join(homedir(), '.gemini'));
    },
    async installGlobal() {
      const dest = join(homedir(), '.gemini', 'config', 'skills', SKILL_NAME);
      await copyDir(SKILL_DIR, dest);
      return dest;
    },
    async installLocal(cwd) {
      const dest = join(cwd, '.agents', 'skills', SKILL_NAME);
      await copyDir(SKILL_DIR, dest);
      return dest;
    },
  },
  {
    id: 'cursor',
    name: 'Cursor',
    icon: '🖱️',
    supportsGlobal: false,
    async detect() {
      const cwd = process.cwd();
      return (
        (await pathExists(join(cwd, '.cursor'))) ||
        (await pathExists(join(cwd, '.git')))
      );
    },
    async installLocal(cwd) {
      const rulesDir = join(cwd, '.cursor', 'rules');
      await fs.mkdir(rulesDir, { recursive: true });

      const skillMd = await readSkillMd();
      // Cursor .mdc format
      const mdcContent = `---\ndescription: ${SKILL_NAME} — engineering reference for AI agents\nglobs: \nalwaysApply: false\n---\n\n${skillMd}`;
      const targetFile = join(rulesDir, `${SKILL_NAME}.mdc`);
      await fs.writeFile(targetFile, mdcContent, 'utf-8');

      // Copy references alongside
      const refsDir = join(SKILL_DIR, 'references');
      if (await pathExists(refsDir)) {
        await copyDir(refsDir, join(rulesDir, `${SKILL_NAME}-references`));
      }

      return targetFile;
    },
  },
  {
    id: 'claude',
    name: 'Claude Code',
    icon: '🤖',
    supportsGlobal: false,
    async detect() {
      const cwd = process.cwd();
      return (
        (await pathExists(join(cwd, 'CLAUDE.md'))) ||
        (await pathExists(join(cwd, '.git')))
      );
    },
    async installLocal(cwd) {
      const targetFile = join(cwd, 'CLAUDE.md');
      const skillMd = await readSkillMd();
      const existing = (await pathExists(targetFile))
        ? await fs.readFile(targetFile, 'utf-8')
        : '';
      const newContent = injectSkillBlock(existing, skillMd, SKILL_NAME);
      await fs.writeFile(targetFile, newContent, 'utf-8');
      return targetFile;
    },
  },
  {
    id: 'copilot',
    name: 'GitHub Copilot',
    icon: '🐙',
    supportsGlobal: false,
    async detect() {
      const cwd = process.cwd();
      return (
        (await pathExists(join(cwd, '.github'))) ||
        (await pathExists(join(cwd, '.git')))
      );
    },
    async installLocal(cwd) {
      const githubDir = join(cwd, '.github');
      await fs.mkdir(githubDir, { recursive: true });
      const targetFile = join(githubDir, 'copilot-instructions.md');
      const skillMd = await readSkillMd();
      const existing = (await pathExists(targetFile))
        ? await fs.readFile(targetFile, 'utf-8')
        : '';
      const newContent = injectSkillBlock(existing, skillMd, SKILL_NAME);
      await fs.writeFile(targetFile, newContent, 'utf-8');
      return targetFile;
    },
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('');
  intro(
    pc.bgMagenta(pc.white(pc.bold('  🧠 System Architecture Guide  '))) +
      pc.dim('  AI Coding Agent Skill Installer')
  );

  // ── Step 1: Detect agents ──────────────────────────────────────
  const s = spinner();
  s.start('Detecting AI agents on your system...');

  const detected = [];
  const undetected = [];
  for (const agent of AGENTS) {
    if (await agent.detect()) {
      detected.push(agent);
    } else {
      undetected.push(agent);
    }
  }

  s.stop('Agent detection complete');

  // Show what was found
  const detectedLines = detected
    .map((a) => `  ${pc.green('●')} ${a.icon}  ${pc.bold(a.name)}`)
    .join('\n');
  const undetectedLines = undetected
    .map((a) => `  ${pc.dim('○')}  ${pc.dim(a.icon + '  ' + a.name)}`)
    .join('\n');

  note(
    (detectedLines || pc.dim('  (none)')) +
      (undetectedLines ? `\n\n${pc.dim('Not detected:')}\n${undetectedLines}` : ''),
    'Agents found'
  );

  // ── Step 2: Select agent ───────────────────────────────────────
  const agentChoices = [
    ...detected.map((a) => ({
      value: a.id,
      label: `${pc.green('✓')} ${a.icon}  ${a.name}`,
      hint: pc.green('detected'),
    })),
    ...undetected.map((a) => ({
      value: a.id,
      label: `${pc.dim('○')}  ${pc.dim(a.icon + '  ' + a.name)}`,
      hint: pc.dim('not detected — install anyway?'),
    })),
  ];

  const selectedId = await select({
    message: 'Select target agent:',
    options: agentChoices,
  });

  if (isCancel(selectedId)) {
    cancel('Installation cancelled.');
    process.exit(0);
  }

  const agent = AGENTS.find((a) => a.id === selectedId);

  // ── Step 3: Select scope (only for agents that support global) ─
  let scope = 'local';
  if (agent.supportsGlobal) {
    const scopeChoice = await select({
      message: 'Select install scope:',
      options: [
        {
          value: 'global',
          label: pc.bold('🌍  Global'),
          hint: `~/.gemini/config/skills/${SKILL_NAME}/  (all projects)`,
        },
        {
          value: 'local',
          label: pc.bold('📁  Local'),
          hint: `.agents/skills/${SKILL_NAME}/  (this workspace only)`,
        },
      ],
    });

    if (isCancel(scopeChoice)) {
      cancel('Installation cancelled.');
      process.exit(0);
    }

    scope = scopeChoice;
  }

  // ── Step 4: Install ────────────────────────────────────────────
  const installSpinner = spinner();
  installSpinner.start(`Installing to ${pc.bold(agent.name)}...`);

  let installedPath = '';
  try {
    if (scope === 'global' && agent.installGlobal) {
      installedPath = await agent.installGlobal();
    } else {
      installedPath = await agent.installLocal(process.cwd());
    }
    installSpinner.stop('Done!');
  } catch (err) {
    installSpinner.stop('Failed');
    log.error(pc.red(`Installation error: ${err.message}`));
    process.exit(1);
  }

  // ── Step 5: Summary ────────────────────────────────────────────
  note(
    [
      `${pc.green('✔')}  Agent  : ${pc.bold(agent.icon + ' ' + agent.name)}`,
      `${pc.green('✔')}  Scope  : ${pc.bold(scope)}`,
      `${pc.green('✔')}  Path   : ${pc.cyan(installedPath)}`,
      '',
      pc.dim('Restart your agent to load the new skill.'),
    ].join('\n'),
    'Installation complete'
  );

  outro(pc.green('🎉  Skill installed successfully!'));
}

main().catch((err) => {
  console.error(pc.red(`Unexpected error: ${err.message}`));
  process.exit(1);
});
