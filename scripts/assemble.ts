/**
 * Assembles individual JSON files from agents/, automations/, projects/
 * into a single SpaceBundleData workspace.json file.
 *
 * Usage: npx tsx scripts/assemble.ts
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'dist');

interface SpaceBundleData {
  version: '1';
  name?: string;
  description?: string;
  items: Record<string, unknown>;
}

function readJsonFiles(dir: string): Array<{ name: string; data: unknown }> {
  const fullPath = path.join(ROOT, dir);
  if (!fs.existsSync(fullPath)) return [];
  return fs
    .readdirSync(fullPath)
    .filter((f) => f.endsWith('.json'))
    .map((f) => ({
      name: path.basename(f, '.json'),
      data: JSON.parse(fs.readFileSync(path.join(fullPath, f), 'utf-8')),
    }));
}

function generateRank(index: number): string {
  return `a${index}`;
}

// Read manifest
const manifestPath = path.join(ROOT, 'manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.error('Error: manifest.json not found');
  process.exit(1);
}
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

// Assemble items
const items: Record<string, unknown> = {};
let rankIndex = 0;

// Agents
for (const { name, data } of readJsonFiles('agents')) {
  const id = `agent-${name}`;
  items[id] = {
    type: 'space-bundle-agent-item',
    agentId: id,
    rank: generateRank(rankIndex++),
    template: data,
  };
}

// Automations (flows)
for (const { name, data } of readJsonFiles('automations')) {
  const id = `flow-${name}`;
  items[id] = {
    type: 'space-bundle-flow-item',
    flowId: id,
    rank: generateRank(rankIndex++),
    template: data,
  };
}

// Projects
for (const { name, data } of readJsonFiles('projects')) {
  const id = `proj-${name}`;
  items[id] = {
    type: 'space-bundle-project-item',
    projectId: id,
    rank: generateRank(rankIndex++),
    root: data,
  };
}

const bundle: SpaceBundleData = {
  version: '1',
  name: manifest.name,
  description: manifest.description,
  items,
};

// Write output
fs.mkdirSync(OUT, { recursive: true });
const outPath = path.join(OUT, 'workspace.json');
fs.writeFileSync(outPath, JSON.stringify(bundle, null, 2));

console.log(`Assembled ${Object.keys(items).length} items into ${outPath}`);

const counts = {
  agents: Object.values(items).filter((i: any) => i.type === 'space-bundle-agent-item').length,
  automations: Object.values(items).filter((i: any) => i.type === 'space-bundle-flow-item').length,
  projects: Object.values(items).filter((i: any) => i.type === 'space-bundle-project-item').length,
};
console.log(`  Agents: ${counts.agents}, Automations: ${counts.automations}, Projects: ${counts.projects}`);
