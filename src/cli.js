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

async function replaceDir(src, dest) {
  const updated = await pathExists(dest);
  await fs.rm(dest, { recursive: true, force: true });
  await copyDir(src, dest);
  return { path: dest, updated };
}

async function installLocalSkillBundle(skill, cwd) {
  const dest = join(cwd, '.agents', 'skills', skill.id);
  return replaceDir(skill.dir, dest);
}

async function installGlobalSkillBundle(skill) {
  const dest = join(homedir(), '.agents', 'skills', skill.id);
  return replaceDir(skill.dir, dest);
}

function skillLoader(skill, skillPath) {
  const trigger = skill.description ? `Use when: ${skill.description}` : `Use when this skill is relevant.`;
  return `# Skill: ${skill.name}\n\n${trigger}\n\nWhen applicable, read and follow \`${skillPath}\`. Resolve relative references from that skill directory.`;
}

function localSkillEntrypoint(skill) {
  return `.agents/skills/${skill.id}/SKILL.md`;
}

function globalSkillEntrypoint(skill) {
  return join(homedir(), '.agents', 'skills', skill.id, 'SKILL.md').replaceAll('\\', '/');
}

async function installInjectedLocalSkill(skill, cwd, targetFile) {
  const installation = await installLocalSkillBundle(skill, cwd);
  await fs.mkdir(dirname(targetFile), { recursive: true });
  const existing = (await pathExists(targetFile)) ? await fs.readFile(targetFile, 'utf-8') : '';
  const loader = skillLoader(skill, localSkillEntrypoint(skill));
  await fs.writeFile(targetFile, injectSkillBlock(existing, loader, skill.id), 'utf-8');
  return { ...installation, path: targetFile };
}

async function installInjectedGlobalSkill(skill, targetFile) {
  const installation = await installGlobalSkillBundle(skill);
  await fs.mkdir(dirname(targetFile), { recursive: true });
  const existing = (await pathExists(targetFile)) ? await fs.readFile(targetFile, 'utf-8') : '';
  const loader = skillLoader(skill, globalSkillEntrypoint(skill));
  await fs.writeFile(targetFile, injectSkillBlock(existing, loader, skill.id), 'utf-8');
  return { ...installation, path: targetFile };
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
  return skills.sort((a, b) => a.name.localeCompare(b.name));
}

// ─── Agent Definitions ───────────────────────────────────────────────────────

const AGENTS = [
  // ── Gemini / Antigravity ──────────────────────────────────────────────────
  {
    id: 'gemini',
    name: 'Gemini / Antigravity',
    icon: '🔮',
    supportsGlobal: true,
    async detect() {
      const cwd = process.cwd();
      return (await pathExists(join(homedir(), '.gemini'))) || (await pathExists(join(cwd, '.gemini')));
    },
    async installGlobal(skill) {
      const dest = join(homedir(), '.gemini', 'config', 'skills', skill.id);
      return replaceDir(skill.dir, dest);
    },
    async installLocal(skill, cwd) {
      return installLocalSkillBundle(skill, cwd);
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
      return (await pathExists(join(cwd, 'CLAUDE.md'))) || (await pathExists(join(homedir(), '.claude')));
    },
    async installGlobal(skill) {
      const targetFile = join(homedir(), '.claude', 'CLAUDE.md');
      return installInjectedGlobalSkill(skill, targetFile);
    },
    async installLocal(skill, cwd) {
      const targetFile = join(cwd, 'CLAUDE.md');
      return installInjectedLocalSkill(skill, cwd, targetFile);
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
      return pathExists(join(cwd, '.cursor'));
    },
    async installLocal(skill, cwd) {
      const installation = await installLocalSkillBundle(skill, cwd);
      const rulesDir = join(cwd, '.cursor', 'rules');
      await fs.mkdir(rulesDir, { recursive: true });
      const loader = skillLoader(skill, localSkillEntrypoint(skill));
      const mdcContent = `---\ndescription: ${skill.name}\nglobs: \nalwaysApply: false\n---\n\n${loader}`;
      const targetFile = join(rulesDir, `${skill.id}.mdc`);
      await fs.writeFile(targetFile, mdcContent, 'utf-8');
      return { ...installation, path: targetFile };
    },
  },

  // ── Windsurf (Codeium) ────────────────────────────────────────────────────
  {
    id: 'windsurf',
    name: 'Windsurf',
    icon: '🌊',
    supportsGlobal: true,
    async detect() {
      const cwd = process.cwd();
      return (await pathExists(join(homedir(), '.codeium'))) ||
        (await pathExists(join(cwd, '.windsurfrules'))) ||
        (await pathExists(join(cwd, '.windsurf')));
    },
    async installGlobal(skill) {
      const targetFile = join(homedir(), '.codeium', 'windsurf', 'memories', 'global_rules.md');
      return installInjectedGlobalSkill(skill, targetFile);
    },
    async installLocal(skill, cwd) {
      const targetFile = join(cwd, '.windsurfrules');
      return installInjectedLocalSkill(skill, cwd, targetFile);
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
      return (await pathExists(join(cwd, '.clinerules'))) || (await pathExists(join(cwd, '.cline')));
    },
    async installLocal(skill, cwd) {
      const targetFile = join(cwd, '.clinerules');
      return installInjectedLocalSkill(skill, cwd, targetFile);
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
        (await pathExists(join(cwd, '.roorules')))
      );
    },
    async installLocal(skill, cwd) {
      const installation = await installLocalSkillBundle(skill, cwd);
      const rulesDir = join(cwd, '.roo', 'rules');
      await fs.mkdir(rulesDir, { recursive: true });
      const targetFile = join(rulesDir, `${skill.id}.md`);
      await fs.writeFile(targetFile, skillLoader(skill, localSkillEntrypoint(skill)), 'utf-8');
      return { ...installation, path: targetFile };
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
      return pathExists(join(cwd, '.kilocode'));
    },
    async installLocal(skill, cwd) {
      const installation = await installLocalSkillBundle(skill, cwd);
      const rulesDir = join(cwd, '.kilocode', 'rules');
      await fs.mkdir(rulesDir, { recursive: true });
      const targetFile = join(rulesDir, `${skill.id}.md`);
      await fs.writeFile(targetFile, skillLoader(skill, localSkillEntrypoint(skill)), 'utf-8');
      return { ...installation, path: targetFile };
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
        (await pathExists(join(cwd, '.aider.conf.yml')))
      );
    },
    async installLocal(skill, cwd) {
      const targetFile = join(cwd, 'CONVENTIONS.md');
      return installInjectedLocalSkill(skill, cwd, targetFile);
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
      return (await pathExists(join(cwd, 'AGENTS.md'))) || (await pathExists(join(homedir(), '.codex')));
    },
    async installLocal(skill, cwd) {
      const targetFile = join(cwd, 'AGENTS.md');
      return installInjectedLocalSkill(skill, cwd, targetFile);
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
      return pathExists(join(cwd, '.github', 'copilot-instructions.md'));
    },
    async installLocal(skill, cwd) {
      const targetFile = join(cwd, '.github', 'copilot-instructions.md');
      return installInjectedLocalSkill(skill, cwd, targetFile);
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
        { value: 'global', label: pc.bold('🌍  Global'), hint: 'available across projects' },
        { value: 'local',  label: pc.bold('📁  Local'),  hint: 'this project only' },
      ],
    });
    if (isCancel(scopeChoice)) { cancel('Cancelled.'); process.exit(0); }
    scope = scopeChoice;
  }

  const scopeLabel = scope === 'global'
    ? 'Global — available across projects'
    : `Local — this project only (${process.cwd()})`;
  note(scopeLabel, 'Install scope');

  // ── Install all selected skills ────────────────────────────────
  const installSpinner = spinner();
  installSpinner.start(`Installing or updating ${selectedSkills.length} skill${selectedSkills.length > 1 ? 's' : ''} in ${scopeLabel}...`);

  const results = [];
  for (const skill of selectedSkills) {
    try {
      let installation;
      if (scope === 'global' && agent.installGlobal) {
        installation = await agent.installGlobal(skill);
      } else {
        installation = await agent.installLocal(skill, process.cwd());
      }
      results.push({ skill, ...installation, ok: true });
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
          ? `${r.updated ? pc.cyan('↻ Updated') : pc.green('✔ Installed')}  ${pc.bold(r.skill.name)}\n   ${pc.dim(r.path)}`
          : `${pc.red('✖')}  ${pc.bold(r.skill.name)} — ${pc.red(r.error)}`
      )
      .join('\n\n') +
      `\n\n${pc.dim('Restart your agent to load the new skills.')}`,
    `Skills for ${agent.icon} ${agent.name} — ${scopeLabel}`
  );

  const failed = results.filter(r => !r.ok);
  if (failed.length > 0) {
    outro(pc.yellow(`⚠️  Done with ${failed.length} error(s).`));
    process.exit(1);
  } else {
    outro(pc.green(`🎉  All ${results.length} skill${results.length > 1 ? 's were' : ' was'} installed or updated successfully!`));
  }
}

main().catch(err => {
  console.error(pc.red(`Unexpected error: ${err.message}`));
  process.exit(1);
});
