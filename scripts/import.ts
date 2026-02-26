/**
 * Imports the assembled workspace.json into a Taskade workspace via the Public API.
 *
 * Prerequisites:
 *   1. Run `npm run build` first to assemble workspace.json
 *   2. Set TASKADE_API_TOKEN (Personal Access Token: tskdp_...)
 *   3. Set TASKADE_WORKSPACE_ID (target workspace ID)
 *
 * Usage: TASKADE_API_TOKEN=tskdp_... TASKADE_WORKSPACE_ID=... npx tsx scripts/import.ts
 *
 * API endpoint: POST /api/v1/bundles/:workspaceId/import
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const API_BASE = process.env.TASKADE_API_URL ?? 'https://taskade.com';
const API_TOKEN = process.env.TASKADE_API_TOKEN;
const WORKSPACE_ID = process.env.TASKADE_WORKSPACE_ID;

if (!API_TOKEN) {
  console.error('Error: TASKADE_API_TOKEN environment variable is required.');
  console.error('Create a Personal Access Token at https://taskade.com/settings/api');
  process.exit(1);
}

if (!WORKSPACE_ID) {
  console.error('Error: TASKADE_WORKSPACE_ID environment variable is required.');
  console.error('Find your workspace ID in the workspace URL: https://taskade.com/ws/<workspace-id>');
  process.exit(1);
}

const workspacePath = path.join(ROOT, 'dist', 'workspace.json');
if (!fs.existsSync(workspacePath)) {
  console.error('Error: dist/workspace.json not found. Run `npm run build` first.');
  process.exit(1);
}

const bundleData = JSON.parse(fs.readFileSync(workspacePath, 'utf-8'));
const itemCount = Object.keys(bundleData.items).length;

console.log(`Importing ${itemCount} items into workspace ${WORKSPACE_ID}...`);

const url = `${API_BASE}/api/v1/bundles/${WORKSPACE_ID}/import`;

const response = await fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${API_TOKEN}`,
  },
  body: JSON.stringify({ bundleData }),
});

if (!response.ok) {
  const body = await response.text();
  console.error(`Import failed (${response.status}): ${body}`);
  process.exit(1);
}

const result = await response.json();
console.log('Import successful!');
console.log(JSON.stringify(result, null, 2));
