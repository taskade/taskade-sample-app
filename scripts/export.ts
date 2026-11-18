/**
 * Exports a Taskade workspace as individual DNA files (agents/, automations/, projects/, apps/).
 *
 * Prerequisites:
 *   1. Set TASKADE_API_TOKEN (Personal Access Token: tskdp_...)
 *   2. Set TASKADE_WORKSPACE_ID (source workspace ID)
 *
 * Usage: TASKADE_API_TOKEN=tskdp_... TASKADE_WORKSPACE_ID=... npx tsx scripts/export.ts
 *
 * API endpoint: GET /api/v1/bundles/:workspaceId/export
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const API_BASE = process.env.TASKADE_API_URL ?? 'https://www.taskade.com';
const API_TOKEN = process.env.TASKADE_API_TOKEN;
const WORKSPACE_ID = process.env.TASKADE_WORKSPACE_ID;

if (!API_TOKEN) {
  console.error('Error: TASKADE_API_TOKEN environment variable is required.');
  console.error('Create a Personal Access Token at https://taskade.com/settings/api');
  process.exit(1);
}

if (!WORKSPACE_ID) {
  console.error('Error: TASKADE_WORKSPACE_ID environment variable is required.');
  console.error('Find your workspace ID in the workspace URL: https://www.taskade.com/spaces/<workspace-id>');
  process.exit(1);
}

console.log(`Exporting workspace ${WORKSPACE_ID}...`);

const url = `${API_BASE}/api/v1/bundles/${WORKSPACE_ID}/export`;

const response = await fetch(url, {
  headers: {
    Authorization: `Bearer ${API_TOKEN}`,
  },
});

if (!response.ok) {
  const body = await response.text();
  console.error(`Export failed (${response.status}): ${body}`);
  process.exit(1);
}

const result = (await response.json()) as { ok: boolean; item: { version: string; items: Record<string, any>; name?: string; description?: string } };
const bundleData = result.item;

// Write raw bundle
fs.mkdirSync(path.join(ROOT, 'dist'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist', 'workspace.json'), JSON.stringify(bundleData, null, 2));
console.log(`Saved dist/workspace.json`);

// Split into individual files by type
const typeMap: Record<string, { dir: string; idField: string; dataField: string }> = {
  'space-bundle-agent-item': { dir: 'agents', idField: 'agentId', dataField: 'template' },
  'space-bundle-flow-item': { dir: 'automations', idField: 'flowId', dataField: 'template' },
  'space-bundle-project-item': { dir: 'projects', idField: 'projectId', dataField: 'root' },
  'space-bundle-app-item': { dir: 'apps', idField: 'appId', dataField: 'files' },
};

let totalFiles = 0;

for (const [itemId, item] of Object.entries(bundleData.items)) {
  const mapping = typeMap[item.type];
  if (mapping == null) continue;

  const dir = path.join(ROOT, mapping.dir);
  fs.mkdirSync(dir, { recursive: true });

  const data = item[mapping.dataField];
  const fileName = `${itemId}.json`;
  fs.writeFileSync(path.join(dir, fileName), JSON.stringify(data, null, 2));
  totalFiles++;
}

console.log(`\nExported ${totalFiles} items from workspace "${bundleData.name ?? WORKSPACE_ID}":`);

const counts: Record<string, number> = {};
for (const item of Object.values(bundleData.items) as any[]) {
  const mapping = typeMap[item.type];
  if (mapping != null) {
    counts[mapping.dir] = (counts[mapping.dir] ?? 0) + 1;
  }
}
for (const [dir, count] of Object.entries(counts)) {
  console.log(`  ${dir}/: ${count} files`);
}

// Update manifest if workspace has a name
if (bundleData.name != null) {
  const manifestPath = path.join(ROOT, 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    manifest.name = bundleData.name;
    if (bundleData.description != null) {
      manifest.description = bundleData.description;
    }
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
    console.log(`\nUpdated manifest.json with workspace name: "${bundleData.name}"`);
  }
}
