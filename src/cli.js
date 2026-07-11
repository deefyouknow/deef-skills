import {
  intro,
  outro,
  select,
  multiselect,
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

const SKILLS_DIR = join(__dirname, '..', 'skills');

// ─── Utilities ───────────────────────────────────────────────────────────────

async function pathExists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);
    if (entry.isDirectory()) await copyDir(srcPath, destPath);
    else await fs.copyFile(srcPath, destPath);
  }
}

function injectSkillBlock(existing, skillContent, skillName) {
  const s = `<!-- agent-skill-start: ${skillName} -->`;
  const e = `<!-- agent-skill-end: ${skillName} -->`;
  const block = `${s}\n${skillContent.trim()}\n${e}`;
  const regex = new RegExp(
    `${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
    'g'
  );
  const cleaned = existing.replace(regex, '').trim();
  return cleaned ? `${cleaned}\n\n${block}` : block;
}

// ─── Discover skills ──────────────────────────────────────────────────────────

async function discoverSkills() {
  const entries = await fs.readdir(SKILLS_DIR, { withFileTypes: true });
  const skills = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const skillDir = join(SKILLS_DIR, entry.name);
    const skillMdPath = join(skillDir, 'SKILL.md');
    if (!(await pathExists(skillMdPath))) continue;
    const content = await fs.readFile(skillMdPath, 'utf-8');
    const fmMatch = content.match(/^---\r?\n([\s\S]+?)\r?\n---/);
    let name = entry.name;
    let description = '';
    if (fmMatch) {
      const fm = fmMatch[1];
      const nameLine = fm.split('\n').find(l => l.startsWith('name:'));
      const descLine = fm.split('\n').find(l => l.startsWith('description:'));
      if (nameLine) name = nameLine.replace('name:', '').trim();
      if (descLine) description = descLine.replace('description:', '').trim().slice(0, 80) + '…';
    }
    skills.push({ id: entry.name, name, description, dir: skillDir, content });
  }
  return skills;
}

// ─── Agent Definitions ───────────────────────────────────────────────────────

const AGENTS = [
  // ── Gemini / Antigravity ──────────────────────────────────────────────────
  {
    id: 'gemini',
    name: 'Gemini / Antigravity',
    icon: '🔮',
    supportsGlobal: true,
    async detect() { return pathExists(join(homedir(), '.gemini')); },
    async installGlobal(skill) {
      const dest = join(homedir(), '.gemini', 'config', 'skills', skill.id);
      await copyDir(skill.dir, dest);
      return dest;
    },
    async installLocal(skill, cwd) {
      const dest = join(cwd, '.agents', 'skills', skill.id);
      await copyDir(skill.dir, dest);
      return dest;
    },
  },

  // ── Claude Code ───────────────────────────────────────────────────────────
  {
    id: 'claude',
    name: 'Claude Code',
    icon: '🤖',
    supportsGlobal: true,
    async detect() {
      const cwd = process.cwd();
      return (await pathExists(join(cwd, 'CLAUDE.md'))) || (await pathExists(join(cwd, '.git')));
    },
    async installGlobal(skill) {
      // Claude Code global: ~/.claude/CLAUDE.md
      const dir = join(homedir(), '.claude');
      await fs.mkdir(dir, { recursive: true });
      const targetFile = join(dir, 'CLAUDE.md');
      const existing = (await pathExists(targetFile)) ? await fs.readFile(targetFile, 'utf-8') : '';
      await fs.writeFile(targetFile, injectSkillBlock(existing, skill.content, skill.id), 'utf-8');
      return targetFile;
    },
    async installLocal(skill, cwd) {
      const targetFile = join(cwd, 'CLAUDE.md');
      const existing = (await pathExists(targetFile)) ? await fs.readFile(targetFile, 'utf-8') : '';
      await fs.writeFile(targetFile, injectSkillBlock(existing, skill.content, skill.id), 'utf-8');
      return targetFile;
    },
  },

  // ── Cursor ────────────────────────────────────────────────────────────────
  {
    id: 'cursor',
    name: 'Cursor',
    icon: '🖱️ ',
    supportsGlobal: false,
    async detect() {
      const cwd = process.cwd();
      return (await pathExists(join(cwd, '.cursor'))) || (await pathExists(join(cwd, '.git')));
    },
    async installLocal(skill, cwd) {
      const rulesDir = join(cwd, '.cursor', 'rules');
      await fs.mkdir(rulesDir, { recursive: true });
      const mdcContent = `---\ndescription: ${skill.name}\nglobs: \nalwaysApply: false\n---\n\n${skill.content}`;
      const targetFile = join(rulesDir, `${skill.id}.mdc`);
      await fs.writeFile(targetFile, mdcContent, 'utf-8');
      const refsDir = join(skill.dir, 'references');
      if (await pathExists(refsDir)) await copyDir(refsDir, join(rulesDir, `${skill.id}-references`));
      return targetFile;
    },
  },

  // ── Windsurf (Codeium) ────────────────────────────────────────────────────
  {
    id: 'windsurf',
    name: 'Windsurf',
    icon: '🌊',
    supportsGlobal: true,
    async detect() { return pathExists(join(homedir(), '.codeium')); },
    async installGlobal(skill) {
      const dir = join(homedir(), '.codeium', 'windsurf', 'memories');
      await fs.mkdir(dir, { recursive: true });
      const targetFile = join(dir, 'global_rules.md');
      const existing = (await pathExists(targetFile)) ? await fs.readFile(targetFile, 'utf-8') : '';
      await fs.writeFile(targetFile, injectSkillBlock(existing, skill.content, skill.id), 'utf-8');
      return targetFile;
    },
    async installLocal(skill, cwd) {
      const targetFile = join(cwd, '.windsurfrules');
      const existing = (await pathExists(targetFile)) ? await fs.readFile(targetFile, 'utf-8') : '';
      await fs.writeFile(targetFile, injectSkillBlock(existing, skill.content, skill.id), 'utf-8');
      return targetFile;
    },
  },

  // ── Cline ─────────────────────────────────────────────────────────────────
  {
    id: 'cline',
    name: 'Cline',
    icon: '⚡',
    supportsGlobal: false,
    async detect() {
      const cwd = process.cwd();
      return (await pathExists(join(cwd, '.clinerules'))) || (await pathExists(join(cwd, '.git')));
    },
    async installLocal(skill, cwd) {
      const targetFile = join(cwd, '.clinerules');
      const existing = (await pathExists(targetFile)) ? await fs.readFile(targetFile, 'utf-8') : '';
      await fs.writeFile(targetFile, injectSkillBlock(existing, skill.content, skill.id), 'utf-8');
      return targetFile;
    },
  },

  // ── Roo Code ──────────────────────────────────────────────────────────────
  {
    id: 'roo',
    name: 'Roo Code',
    icon: '🦘',
    supportsGlobal: false,
    async detect() {
      const cwd = process.cwd();
      return (
        (await pathExists(join(cwd, '.roo'))) ||
        (await pathExists(join(cwd, '.roorules'))) ||
        (await pathExists(join(cwd, '.git')))
      );
    },
    async installLocal(skill, cwd) {
      const rulesDir = join(cwd, '.roo', 'rules');
      await fs.mkdir(rulesDir, { recursive: true });
      const targetFile = join(rulesDir, `${skill.id}.md`);
      await fs.writeFile(targetFile, skill.content, 'utf-8');
      return targetFile;
    },
  },

  // ── Kilo Code ─────────────────────────────────────────────────────────────
  {
    id: 'kilo',
    name: 'Kilo Code',
    icon: '🔢',
    supportsGlobal: false,
    async detect() {
      const cwd = process.cwd();
      return (await pathExists(join(cwd, '.kilocode'))) || (await pathExists(join(cwd, '.git')));
    },
    async installLocal(skill, cwd) {
      const rulesDir = join(cwd, '.kilocode', 'rules');
      await fs.mkdir(rulesDir, { recursive: true });
      const targetFile = join(rulesDir, `${skill.id}.md`);
      await fs.writeFile(targetFile, skill.content, 'utf-8');
      return targetFile;
    },
  },

  // ── Aider ─────────────────────────────────────────────────────────────────
  {
    id: 'aider',
    name: 'Aider',
    icon: '🤝',
    supportsGlobal: false,
    async detect() {
      const cwd = process.cwd();
      return (
        (await pathExists(join(cwd, 'CONVENTIONS.md'))) ||
        (await pathExists(join(cwd, '.aider.conf.yml'))) ||
        (await pathExists(join(cwd, '.git')))
      );
    },
    async installLocal(skill, cwd) {
      const targetFile = join(cwd, 'CONVENTIONS.md');
      const existing = (await pathExists(targetFile)) ? await fs.readFile(targetFile, 'utf-8') : '';
      await fs.writeFile(targetFile, injectSkillBlock(existing, skill.content, skill.id), 'utf-8');
      return targetFile;
    },
  },

  // ── OpenAI Codex / Amp ────────────────────────────────────────────────────
  {
    id: 'codex',
    name: 'OpenAI Codex / Amp',
    icon: '🌀',
    supportsGlobal: false,
    async detect() {
      const cwd = process.cwd();
      return (await pathExists(join(cwd, 'AGENTS.md'))) || (await pathExists(join(cwd, '.git')));
    },
    async installLocal(skill, cwd) {
      const targetFile = join(cwd, 'AGENTS.md');
      const existing = (await pathExists(targetFile)) ? await fs.readFile(targetFile, 'utf-8') : '';
      await fs.writeFile(targetFile, injectSkillBlock(existing, skill.content, skill.id), 'utf-8');
      return targetFile;
    },
  },

  // ── GitHub Copilot ────────────────────────────────────────────────────────
  {
    id: 'copilot',
    name: 'GitHub Copilot',
    icon: '🐙',
    supportsGlobal: false,
    async detect() {
      const cwd = process.cwd();
      return (await pathExists(join(cwd, '.github'))) || (await pathExists(join(cwd, '.git')));
    },
    async installLocal(skill, cwd) {
      await fs.mkdir(join(cwd, '.github'), { recursive: true });
      const targetFile = join(cwd, '.github', 'copilot-instructions.md');
      const existing = (await pathExists(targetFile)) ? await fs.readFile(targetFile, 'utf-8') : '';
      await fs.writeFile(targetFile, injectSkillBlock(existing, skill.content, skill.id), 'utf-8');
      return targetFile;
    },
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('');
  intro(
    pc.bgMagenta(pc.white(pc.bold('  🧠 Deef Skills  '))) +
    pc.dim('  AI Coding Agent Skill Installer')
  );

  // ── Discover skills + detect agents in parallel ────────────────
  const s = spinner();
  s.start('Loading skills and detecting agents...');

  const [skills, detectionResults] = await Promise.all([
    discoverSkills(),
    Promise.all(AGENTS.map(a => a.detect().then(ok => ({ agent: a, ok })))),
  ]);

  const detected = detectionResults.filter(r => r.ok).map(r => r.agent);
  const undetected = detectionResults.filter(r => !r.ok).map(r => r.agent);

  s.stop(`Found ${pc.bold(skills.length)} skill${skills.length !== 1 ? 's' : ''}`);

  if (skills.length === 0) {
    log.error('No skills found in the skills/ directory.');
    process.exit(1);
  }

  // ── Show agent detection results ───────────────────────────────
  const detectedLines = detected.map(a => `  ${pc.green('●')} ${a.icon} ${pc.bold(a.name)}`).join('\n');
  const undetectedLines = undetected.map(a => `  ${pc.dim('○')} ${pc.dim(a.icon + ' ' + a.name)}`).join('\n');
  note(
    detectedLines + (undetectedLines ? `\n\n${pc.dim('Not detected:')}\n${undetectedLines}` : ''),
    'Agents on this system'
  );

  // ── Select skills (multi-select) ───────────────────────────────
  const selectedSkillIds = await multiselect({
    message: 'Select skills to install: (space to toggle, enter to confirm)',
    options: skills.map(sk => ({
      value: sk.id,
      label: pc.bold(sk.name),
      hint: sk.description || sk.id,
    })),
    required: true,
  });

  if (isCancel(selectedSkillIds)) { cancel('Cancelled.'); process.exit(0); }
  const selectedSkills = skills.filter(sk => selectedSkillIds.includes(sk.id));

  // ── Select agent ───────────────────────────────────────────────
  const selectedAgentId = await select({
    message: 'Select target agent:',
    options: [
      ...detected.map(a => ({
        value: a.id,
        label: `${pc.green('✓')} ${a.icon} ${a.name}`,
        hint: pc.green('detected'),
      })),
      ...undetected.map(a => ({
        value: a.id,
        label: `${pc.dim('○')} ${pc.dim(a.icon + ' ' + a.name)}`,
        hint: pc.dim('not detected'),
      })),
    ],
  });

  if (isCancel(selectedAgentId)) { cancel('Cancelled.'); process.exit(0); }
  const agent = AGENTS.find(a => a.id === selectedAgentId);

  // ── Select scope (agents that support global) ──────────────────
  let scope = 'local';
  if (agent.supportsGlobal) {
    const scopeChoice = await select({
      message: 'Select install scope:',
      options: [
        { value: 'global', label: pc.bold('🌍  Global'), hint: 'available in all projects' },
        { value: 'local',  label: pc.bold('📁  Local'),  hint: 'this workspace only' },
      ],
    });
    if (isCancel(scopeChoice)) { cancel('Cancelled.'); process.exit(0); }
    scope = scopeChoice;
  }

  // ── Install all selected skills ────────────────────────────────
  const installSpinner = spinner();
  installSpinner.start(`Installing ${selectedSkills.length} skill${selectedSkills.length > 1 ? 's' : ''} to ${agent.name}...`);

  const results = [];
  for (const skill of selectedSkills) {
    try {
      let path;
      if (scope === 'global' && agent.installGlobal) {
        path = await agent.installGlobal(skill);
      } else {
        path = await agent.installLocal(skill, process.cwd());
      }
      results.push({ skill, path, ok: true });
    } catch (err) {
      results.push({ skill, error: err.message, ok: false });
    }
  }

  installSpinner.stop('Installation complete');

  // ── Summary ────────────────────────────────────────────────────
  note(
    results
      .map(r =>
        r.ok
          ? `${pc.green('✔')}  ${pc.bold(r.skill.name)}\n   ${pc.dim(r.path)}`
          : `${pc.red('✖')}  ${pc.bold(r.skill.name)} — ${pc.red(r.error)}`
      )
      .join('\n\n') +
      `\n\n${pc.dim('Restart your agent to load the new skills.')}`,
    `Installed to ${agent.icon} ${agent.name} (${scope})`
  );

  const failed = results.filter(r => !r.ok);
  if (failed.length > 0) {
    outro(pc.yellow(`⚠️  Done with ${failed.length} error(s).`));
    process.exit(1);
  } else {
    outro(pc.green(`🎉  All ${results.length} skill${results.length > 1 ? 's' : ''} installed successfully!`));
  }
}

main().catch(err => {
  console.error(pc.red(`Unexpected error: ${err.message}`));
  process.exit(1);
});
