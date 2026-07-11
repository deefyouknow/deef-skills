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
  const regex = new RegExp(`${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g');
  const cleaned = existing.replace(regex, '').trim();
  return cleaned ? `${cleaned}\n\n${block}` : block;
}

// ─── Discover skills from /skills directory ───────────────────────────────────

async function discoverSkills() {
  const entries = await fs.readdir(SKILLS_DIR, { withFileTypes: true });
  const skills = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const skillDir = join(SKILLS_DIR, entry.name);
    const skillMdPath = join(skillDir, 'SKILL.md');
    if (!(await pathExists(skillMdPath))) continue;

    // Parse name + description from SKILL.md frontmatter
    const content = await fs.readFile(skillMdPath, 'utf-8');
    const fmMatch = content.match(/^---\r?\n([\s\S]+?)\r?\n---/);
    let name = entry.name;
    let description = '';
    if (fmMatch) {
      const fm = fmMatch[1];
      const nameLine = fm.split('\n').find(l => l.startsWith('name:'));
      const descLine = fm.split('\n').find(l => l.startsWith('description:'));
      if (nameLine) name = nameLine.replace('name:', '').trim();
      if (descLine) description = descLine.replace('description:', '').trim().slice(0, 80) + '...';
    }

    skills.push({ id: entry.name, name, description, dir: skillDir, content });
  }

  return skills;
}

// ─── Agent Definitions ───────────────────────────────────────────────────────

const AGENTS = [
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
  {
    id: 'claude',
    name: 'Claude Code',
    icon: '🤖',
    supportsGlobal: false,
    async detect() {
      const cwd = process.cwd();
      return (await pathExists(join(cwd, 'CLAUDE.md'))) || (await pathExists(join(cwd, '.git')));
    },
    async installLocal(skill, cwd) {
      const targetFile = join(cwd, 'CLAUDE.md');
      const existing = (await pathExists(targetFile)) ? await fs.readFile(targetFile, 'utf-8') : '';
      await fs.writeFile(targetFile, injectSkillBlock(existing, skill.content, skill.id), 'utf-8');
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

  // ── Discover skills ────────────────────────────────────────────
  const s = spinner();
  s.start('Loading available skills...');
  const [skills, detected, undetected] = await Promise.all([
    discoverSkills(),
    Promise.all(AGENTS.map(a => a.detect().then(ok => ok ? a : null))).then(r => r.filter(Boolean)),
    Promise.all(AGENTS.map(a => a.detect().then(ok => ok ? null : a))).then(r => r.filter(Boolean)),
  ]);
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
  const skillChoices = skills.map(sk => ({
    value: sk.id,
    label: pc.bold(sk.name),
    hint: sk.description || sk.id,
  }));

  const selectedSkillIds = await multiselect({
    message: 'Select skills to install: (space to toggle, enter to confirm)',
    options: skillChoices,
    required: true,
  });

  if (isCancel(selectedSkillIds)) { cancel('Cancelled.'); process.exit(0); }

  const selectedSkills = skills.filter(sk => selectedSkillIds.includes(sk.id));

  // ── Select agent ───────────────────────────────────────────────
  const agentChoices = [
    ...detected.map(a => ({ value: a.id, label: `${pc.green('✓')} ${a.icon} ${a.name}`, hint: pc.green('detected') })),
    ...undetected.map(a => ({ value: a.id, label: `${pc.dim('○')} ${pc.dim(a.icon + ' ' + a.name)}`, hint: pc.dim('not detected') })),
  ];

  const selectedAgentId = await select({
    message: 'Select target agent:',
    options: agentChoices,
  });

  if (isCancel(selectedAgentId)) { cancel('Cancelled.'); process.exit(0); }

  const agent = AGENTS.find(a => a.id === selectedAgentId);

  // ── Select scope (Gemini only) ─────────────────────────────────
  let scope = 'local';
  if (agent.supportsGlobal) {
    const scopeChoice = await select({
      message: 'Select install scope:',
      options: [
        { value: 'global', label: pc.bold('🌍  Global'), hint: `~/.gemini/config/skills/  (all projects)` },
        { value: 'local',  label: pc.bold('📁  Local'),  hint: `.agents/skills/  (this workspace only)` },
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
  const lines = results.map(r =>
    r.ok
      ? `${pc.green('✔')}  ${pc.bold(r.skill.name)}\n   ${pc.dim(r.path)}`
      : `${pc.red('✖')}  ${pc.bold(r.skill.name)} — ${pc.red(r.error)}`
  );
  note(
    lines.join('\n\n') + `\n\n${pc.dim('Restart your agent to load the new skills.')}`,
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
