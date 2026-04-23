/**
 * Activation validator — validate .github/ directory for completeness and consistency.
 *
 * Milestone 1H: Full implementation
 */

import { readFile, readdir, access } from 'node:fs/promises';
import path from 'node:path';
import { loadConfig } from '../config/loader.js';
import { log } from '../utils/logger.js';

export interface ActivateOptions {
  configPath: string;
  githubDir: string;
  verbose?: boolean;
}

export interface ValidationResult {
  passed: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  summary: {
    agents: { valid: number; total: number };
    skills: { complete: number; total: number };
    instructions: { valid: number; total: number };
    hooks: { valid: number; total: number };
    prompts: { valid: number; total: number };
    unresolvedFlags: number;
    enrichmentMarkers: number;
  };
}

export interface ValidationIssue {
  category: 'structural' | 'content' | 'consistency';
  severity: 'error' | 'warning';
  file?: string;
  message: string;
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function readFileContent(p: string): Promise<string | null> {
  try {
    return await readFile(p, 'utf-8');
  } catch {
    return null;
  }
}

async function listDir(p: string): Promise<string[]> {
  try {
    return await readdir(p);
  } catch {
    return [];
  }
}

/**
 * Run all validation checks against the generated output directory.
 */
export async function activate(options: ActivateOptions): Promise<ValidationResult> {
  log.info(`Validating ${options.githubDir} against config ${options.configPath}...`);

  const issues: ValidationIssue[] = [];
  const { config, hasNeedsReview, needsReviewLocations } = await loadConfig(options.configPath);

  // Track counts
  let agentsValid = 0;
  let agentsTotal = 0;
  let skillsComplete = 0;
  let skillsTotal = 0;
  let instructionsValid = 0;
  let instructionsTotal = 0;
  let hooksValid = 0;
  let hooksTotal = 0;
  let promptsValid = 0;
  let promptsTotal = 0;
  let enrichmentMarkers = 0;

  // === 1. Config consistency ===
  const unresolvedFlags = hasNeedsReview ? needsReviewLocations.length : 0;
  if (unresolvedFlags > 0) {
    for (const loc of needsReviewLocations) {
      issues.push({
        category: 'consistency',
        severity: 'error',
        message: `Unresolved NEEDS_REVIEW flag: ${loc}`,
      });
    }
  }

  // === 2. Structural — agent files ===
  const agentsDir = path.join(options.githubDir, 'agents');
  for (const agent of config.agents) {
    agentsTotal++;
    const agentFile =
      agent === 'orchestrator'
        ? path.join(agentsDir, 'orchestrator.agent.md')
        : path.join(agentsDir, `${agent}-agent.agent.md`);

    if (await fileExists(agentFile)) {
      const content = await readFileContent(agentFile);
      if (content && content.trim().length > 0) {
        agentsValid++;
      } else {
        issues.push({
          category: 'content',
          severity: 'error',
          file: agentFile,
          message: `Agent file is empty: ${path.basename(agentFile)}`,
        });
      }
    } else {
      issues.push({
        category: 'structural',
        severity: 'error',
        file: agentFile,
        message: `Missing agent file: ${path.basename(agentFile)}`,
      });
    }
  }

  // === 3. Structural — skill directories ===
  const skillsDir = path.join(options.githubDir, 'skills');
  const skillDirs = await listDir(skillsDir);
  for (const skillName of skillDirs) {
    const skillPath = path.join(skillsDir, skillName);
    skillsTotal++;
    const skillMd = path.join(skillPath, 'SKILL.md');
    if (await fileExists(skillMd)) {
      const content = await readFileContent(skillMd);
      if (content && content.trim().length > 50) {
        skillsComplete++;
      } else {
        issues.push({
          category: 'content',
          severity: 'warning',
          file: skillMd,
          message: `Skill SKILL.md is too short (possibly stub): ${skillName}`,
        });
      }
    } else {
      issues.push({
        category: 'structural',
        severity: 'error',
        file: skillMd,
        message: `Missing SKILL.md in skill: ${skillName}`,
      });
    }
  }

  // === 4. Custom skill references not empty ===
  for (const skill of config.custom_skills) {
    for (const ref of skill.references) {
      const refPath = path.join(skillsDir, skill.name, 'references', ref);
      if (await fileExists(refPath)) {
        const content = await readFileContent(refPath);
        if (!content || content.trim().length < 10) {
          issues.push({
            category: 'content',
            severity: 'error',
            file: refPath,
            message: `Custom skill reference is empty: ${skill.name}/references/${ref}`,
          });
        }
      } else {
        issues.push({
          category: 'structural',
          severity: 'error',
          file: refPath,
          message: `Missing custom skill reference: ${skill.name}/references/${ref}`,
        });
      }
    }
  }

  // === 5. Check for enrichment markers ===
  const allFiles = await findAllFiles(options.githubDir);
  for (const file of allFiles) {
    if (file.endsWith('.md') || file.endsWith('.json')) {
      const content = await readFileContent(file);
      if (content) {
        const markers = (content.match(/<!-- ENRICHMENT WILL FILL THIS/g) || []).length;
        if (markers > 0) {
          enrichmentMarkers += markers;
          issues.push({
            category: 'content',
            severity: 'warning',
            file,
            message: `${markers} enrichment marker(s) remaining in ${path.relative(options.githubDir, file)}`,
          });
        }
        const reviewMarkers = (content.match(/NEEDS_HUMAN_REVIEW/g) || []).length;
        if (reviewMarkers > 0) {
          issues.push({
            category: 'content',
            severity: 'warning',
            file,
            message: `${reviewMarkers} NEEDS_HUMAN_REVIEW marker(s) in ${path.relative(options.githubDir, file)}`,
          });
        }
      }
    }
  }

  // === 6. Instructions ===
  const instructionsDir = path.join(options.githubDir, 'instructions');
  const instrFiles = await listDir(instructionsDir);
  for (const f of instrFiles) {
    if (f.endsWith('.md')) {
      instructionsTotal++;
      const content = await readFileContent(path.join(instructionsDir, f));
      if (content && content.trim().length > 0) {
        instructionsValid++;
      }
    }
  }

  // === 7. Hooks ===
  const hooksDir = path.join(options.githubDir, 'hooks');
  const hookFiles = await listDir(hooksDir);
  for (const f of hookFiles) {
    hooksTotal++;
    const content = await readFileContent(path.join(hooksDir, f));
    if (content && content.trim().length > 0) {
      hooksValid++;
    }
  }

  // === 8. Prompts ===
  const promptsDir = path.join(options.githubDir, 'prompts');
  const promptFiles = await listDir(promptsDir);
  for (const f of promptFiles) {
    if (f.endsWith('.md')) {
      promptsTotal++;
      const content = await readFileContent(path.join(promptsDir, f));
      if (content && content.trim().length > 0) {
        promptsValid++;
      }
    }
  }

  // === 9. Consistency — orchestrator references valid agents ===
  const orchestratorPath = path.join(agentsDir, 'orchestrator.agent.md');
  const orchestratorContent = await readFileContent(orchestratorPath);
  if (orchestratorContent) {
    for (const agent of config.agents) {
      if (agent === 'orchestrator') continue;
      const agentRef = `${agent}-agent`;
      const agentFileName = `${agentRef}.agent.md`;
      if (orchestratorContent.includes(agentRef) && !(await fileExists(path.join(agentsDir, agentFileName)))) {
        issues.push({
          category: 'consistency',
          severity: 'error',
          file: orchestratorPath,
          message: `Orchestrator references "${agentRef}" but ${agentFileName} does not exist`,
        });
      }
    }
  }

  // === Build result ===
  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');
  const passed = errors.length === 0;

  const result: ValidationResult = {
    passed,
    errors,
    warnings,
    summary: {
      agents: { valid: agentsValid, total: agentsTotal },
      skills: { complete: skillsComplete, total: skillsTotal },
      instructions: { valid: instructionsValid, total: instructionsTotal },
      hooks: { valid: hooksValid, total: hooksTotal },
      prompts: { valid: promptsValid, total: promptsTotal },
      unresolvedFlags,
      enrichmentMarkers,
    },
  };

  // === Print result ===
  if (passed) {
    log.success('MAO Activation Check — PASSED');
  } else {
    log.error(`MAO Activation Check — FAILED (${errors.length} issue(s))`);
  }

  log.info('');
  log.info(`Agents:       ${agentsValid}/${agentsTotal} valid`);
  log.info(`Skills:       ${skillsComplete}/${skillsTotal} complete`);
  log.info(`Instructions: ${instructionsValid}/${instructionsTotal} valid`);
  log.info(`Hooks:        ${hooksValid}/${hooksTotal} valid`);
  log.info(`Prompts:      ${promptsValid}/${promptsTotal} valid`);
  log.info(`Config:       ${unresolvedFlags} unresolved flag(s)`);
  log.info(`Markers:      ${enrichmentMarkers} remaining`);

  if (passed) {
    log.info('');
    log.success('Your agent team is ready. Open VS Code Chat and try:');
    log.info('  @Orchestrator Start Phase 1');
  } else {
    log.info('');
    for (const err of errors) {
      log.error(`  ✗ ${err.message}`);
    }
    log.info('');
    log.info('Fix these issues and run `npm run activate` again.');
  }

  if (warnings.length > 0 && options.verbose) {
    log.info('');
    log.warn(`${warnings.length} warning(s):`);
    for (const w of warnings) {
      log.warn(`  ⚠ ${w.message}`);
    }
  }

  return result;
}

/** Recursively find all files in a directory */
async function findAllFiles(dir: string): Promise<string[]> {
  const results: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await findAllFiles(fullPath)));
    } else {
      results.push(fullPath);
    }
  }
  return results;
}
