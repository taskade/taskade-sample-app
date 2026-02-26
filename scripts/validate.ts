/**
 * Validates the assembled workspace.json against the SpaceBundleData schema.
 * Also validates individual JSON files for structural correctness.
 *
 * Usage: npx tsx scripts/validate.ts
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { z } from 'zod';

const ROOT = path.resolve(import.meta.dirname, '..');

// --- Inline schemas matching Taskade's SpaceBundleData ---
// These mirror the exact Zod schemas from @taskade/common-schemas

const DeltaSnapshotZchema = z.object({
  ops: z.array(
    z.union([
      z.object({ insert: z.union([z.string(), z.record(z.unknown())]), attributes: z.record(z.unknown()).optional() }),
      z.object({ retain: z.number(), attributes: z.record(z.unknown()).optional() }),
      z.object({ delete: z.number() }),
    ]),
  ),
});

const FormatZchema = z
  .object({
    node: z.string().nullable().optional(),
    children: z.string().nullable().optional(),
  })
  .nullable()
  .optional();

const BaseNodeZchema = z.object({
  type: z.literal('text'),
  id: z.string().optional(),
  text: DeltaSnapshotZchema,
  format: FormatZchema,
  collapsed: z.boolean().optional(),
  completed: z.boolean().optional(),
  attributes: z.record(z.unknown()).optional(),
});

type Node = z.infer<typeof BaseNodeZchema> & { children: Node[] };
const NodeZchema: z.ZodType<Node> = BaseNodeZchema.extend({
  children: z.lazy(() => NodeZchema.array()),
});

const RootZchema = z.object({
  type: z.literal('root'),
  children: NodeZchema.array().min(1).max(1),
  project: z.object({ id: z.string(), revision: z.number() }).optional(),
  fields: z.record(z.string(), z.any()).optional(),
  views: z.record(z.string(), z.any()).optional(),
});

const AgentCommandZchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  prompt: z.string().min(1),
  mode: z.enum(['default', 'plan-and-execute-v1', 'plan-and-execute-v2']).default('default'),
  isBackgroundJob: z.boolean().default(false),
  searchToolEnabled: z.boolean().optional(),
});

const AgentTemplateZchema = z.object({
  version: z.literal('1'),
  name: z.string().optional(),
  description: z.string().optional(),
  persona: z.string().optional(),
  tone: z.string().optional(),
  language: z.string().optional(),
  llm: z
    .object({
      type: z.enum(['openai', 'anthropic', 'google']),
      name: z.string(),
    })
    .optional(),
  introduction: z.string().optional(),
  avatar: z
    .object({
      type: z.literal('emoji'),
      data: z.object({ value: z.string() }),
    })
    .optional(),
  commands: z.array(AgentCommandZchema),
  conversationStarters: z
    .array(
      z.object({
        id: z.string().min(1),
        text: z.string().min(1),
        prompt: z.string().optional(),
      }),
    )
    .optional(),
  toolbox: z.array(z.any()).optional(),
  variables: z.record(z.string(), z.any()).optional(),
  publicPreferences: z
    .object({
      mode: z.enum(['template', 'chatbot']).optional(),
      canCopyKnowledge: z.boolean().optional(),
      theme: z.enum(['light', 'dark', 'auto']).optional(),
      autoEndChats: z.boolean().optional(),
    })
    .optional(),
  addToKnowledgeProjectVariables: z.array(z.any()).optional(),
});

const FlowTemplateV2Zchema = z.object({
  version: z.literal('2'),
  flowTitle: z.string().optional(),
  trigger: z.object({
    type: z.string(),
    displayName: z.string().optional(),
    valid: z.boolean().optional(),
    settings: z.any().optional(),
    name: z.string().optional(),
  }),
  actions: z.array(
    z.object({
      type: z.string(),
      displayName: z.string().optional(),
      valid: z.boolean().optional(),
      name: z.string().optional(),
      settings: z.any().optional(),
    }),
  ),
  outputs: z.any().optional(),
  variables: z.record(z.string(), z.any()).optional(),
});

const SpaceBundleDataItemBaseZchema = z.object({
  rank: z.string(),
  dependsOn: z.array(z.string()).optional(),
});

const SpaceBundleDataAgentItemZchema = SpaceBundleDataItemBaseZchema.extend({
  type: z.literal('space-bundle-agent-item'),
  agentId: z.string(),
  template: AgentTemplateZchema,
});

const SpaceBundleDataFlowItemZchema = SpaceBundleDataItemBaseZchema.extend({
  type: z.literal('space-bundle-flow-item'),
  flowId: z.string(),
  template: FlowTemplateV2Zchema,
});

const SpaceBundleDataProjectItemZchema = SpaceBundleDataItemBaseZchema.extend({
  type: z.literal('space-bundle-project-item'),
  projectId: z.string(),
  root: RootZchema,
  preferences: z
    .object({
      defaultView: z.string().optional(),
      avatar: z.object({ type: z.literal('emoji'), value: z.string() }).optional(),
    })
    .optional(),
});

const SpaceBundleDataTemplateItemZchema = SpaceBundleDataItemBaseZchema.extend({
  type: z.literal('space-bundle-template-item'),
  projectId: z.string(),
  root: RootZchema,
  preferences: z
    .object({
      defaultView: z.string().optional(),
      avatar: z.object({ type: z.literal('emoji'), value: z.string() }).optional(),
    })
    .optional(),
});

const SpaceBundleDataMediaItemZchema = SpaceBundleDataItemBaseZchema.extend({
  type: z.literal('space-bundle-media-item'),
  mediaId: z.string(),
});

const SpaceBundleDataAppItemZchema = SpaceBundleDataItemBaseZchema.extend({
  type: z.literal('space-bundle-app-item'),
  appId: z.string(),
  files: z.record(z.string(), z.any()),
});

const SpaceBundleDataItemZchema = z.discriminatedUnion('type', [
  SpaceBundleDataAgentItemZchema,
  SpaceBundleDataFlowItemZchema,
  SpaceBundleDataProjectItemZchema,
  SpaceBundleDataTemplateItemZchema,
  SpaceBundleDataMediaItemZchema,
  SpaceBundleDataAppItemZchema,
]);

const SpaceBundleDataZchema = z.object({
  version: z.literal('1'),
  items: z.record(z.string(), SpaceBundleDataItemZchema),
  name: z.string().optional(),
  description: z.string().optional(),
  metaData: z
    .object({
      agentIcons: z.array(z.string()).optional(),
      projectIcons: z.array(z.string()).optional(),
      automationLogoUrls: z.array(z.string()).optional(),
    })
    .optional(),
});

// --- Validation Logic ---

let errors = 0;

function fail(msg: string) {
  console.error(`  FAIL: ${msg}`);
  errors++;
}

function pass(msg: string) {
  console.log(`  OK: ${msg}`);
}

// 1. Validate manifest.json
console.log('\nValidating manifest.json...');
const manifestPath = path.join(ROOT, 'manifest.json');
if (!fs.existsSync(manifestPath)) {
  fail('manifest.json not found');
} else {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  if (!manifest.formatVersion) fail('Missing formatVersion');
  else pass('formatVersion present');
  if (!manifest.name) fail('Missing name');
  else pass(`name: "${manifest.name}"`);
  if (!manifest.version) fail('Missing version');
  else pass(`version: ${manifest.version}`);
}

// 2. Validate individual agent files
console.log('\nValidating agents/...');
const agentsDir = path.join(ROOT, 'agents');
if (fs.existsSync(agentsDir)) {
  for (const file of fs.readdirSync(agentsDir).filter((f) => f.endsWith('.json'))) {
    const data = JSON.parse(fs.readFileSync(path.join(agentsDir, file), 'utf-8'));
    const result = AgentTemplateZchema.safeParse(data);
    if (result.success) {
      pass(`${file} (${result.data.commands.length} commands)`);
    } else {
      fail(`${file}: ${result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')}`);
    }
  }
} else {
  pass('No agents/ directory (optional)');
}

// 3. Validate individual automation files
console.log('\nValidating automations/...');
const automationsDir = path.join(ROOT, 'automations');
if (fs.existsSync(automationsDir)) {
  for (const file of fs.readdirSync(automationsDir).filter((f) => f.endsWith('.json'))) {
    const data = JSON.parse(fs.readFileSync(path.join(automationsDir, file), 'utf-8'));
    const result = FlowTemplateV2Zchema.safeParse(data);
    if (result.success) {
      pass(`${file} (${result.data.actions.length} actions)`);
    } else {
      fail(`${file}: ${result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')}`);
    }
  }
} else {
  pass('No automations/ directory (optional)');
}

// 4. Validate individual project files
console.log('\nValidating projects/...');
const projectsDir = path.join(ROOT, 'projects');
if (fs.existsSync(projectsDir)) {
  for (const file of fs.readdirSync(projectsDir).filter((f) => f.endsWith('.json'))) {
    const data = JSON.parse(fs.readFileSync(path.join(projectsDir, file), 'utf-8'));
    const result = RootZchema.safeParse(data);
    if (result.success) {
      pass(`${file}`);
    } else {
      fail(`${file}: ${result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')}`);
    }
  }
} else {
  pass('No projects/ directory (optional)');
}

// 5. Validate assembled workspace.json if it exists
const workspacePath = path.join(ROOT, 'dist', 'workspace.json');
if (fs.existsSync(workspacePath)) {
  console.log('\nValidating dist/workspace.json...');
  const bundle = JSON.parse(fs.readFileSync(workspacePath, 'utf-8'));
  const result = SpaceBundleDataZchema.safeParse(bundle);
  if (result.success) {
    const itemCount = Object.keys(result.data.items).length;
    pass(`SpaceBundleData valid (${itemCount} items)`);
  } else {
    for (const issue of result.error.issues) {
      fail(`${issue.path.join('.')}: ${issue.message}`);
    }
  }
}

// Summary
console.log('\n' + '='.repeat(50));
if (errors === 0) {
  console.log('All validations passed!');
  process.exit(0);
} else {
  console.error(`${errors} validation error(s) found.`);
  process.exit(1);
}
