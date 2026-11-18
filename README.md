# taskade-sample-app

[Taskade](https://www.taskade.com) is an AI-native workspace where one prompt builds a running app with its own data, AI agents and automations.

[Taskade Genesis](https://www.taskade.com/create) turns one prompt into a running app: projects store the data, AI agents do the thinking, automations run the work across 100+ integrations, and the interface is built for you. This repo is a sample Taskade Genesis App Kit. It shows **Workspace DNA**, the portable format for AI-powered workspaces.

## What is Workspace DNA?

Every Taskade workspace is built from four types of DNA:

| Layer | Folder | What it does |
|-------|--------|-------------|
| **Memory** | `projects/` | Structured data — task trees, checklists, notes |
| **Intelligence** | `agents/` | AI agents with custom commands and personas |
| **Reflexes** | `automations/` | Trigger-action workflows connecting services |
| **Interface** | `apps/` | Genesis app UI — React components via Parade engine |

This repo contains one JSON file per DNA item — the same format that Taskade uses internally. No build toolchain required to understand or edit.

## Quick Start

```bash
# 1. Fork this repo (or click "Use this template")
gh repo fork taskade/taskade-sample-app

# 2. Install dependencies
npm install

# 3. Validate your JSON files
npm run validate

# 4. Assemble into a single workspace.json
npm run build

# 5. Import into Taskade
TASKADE_API_TOKEN=tskdp_... TASKADE_WORKSPACE_ID=... npm run import

# Or export an existing workspace into this repo
TASKADE_API_TOKEN=tskdp_... TASKADE_WORKSPACE_ID=... npm run export
```

## Repo Structure

```
taskade-sample-app/
├── manifest.json              # App metadata (name, version, author)
├── agents/
│   ├── research-agent.json    # AI research analyst (3 commands)
│   └── content-writer.json    # AI content writer (3 commands)
├── automations/
│   ├── weekly-digest.json     # Webhook → AI summarization
│   └── new-task-notification.json  # Webhook → Slack notification
├── projects/
│   ├── getting-started.json   # Onboarding checklist
│   └── roadmap.json           # Product roadmap with phases
├── apps/
│   └── hello-world.json       # Sample Genesis app (React + Tailwind)
├── media/
│   └── icon.svg               # App icon
├── scripts/
│   ├── assemble.ts            # Combines folders → workspace.json
│   ├── validate.ts            # Validates against SpaceBundleData schema
│   └── import.ts              # Uploads to Taskade via API
└── dist/                      # (generated) assembled bundle
    └── workspace.json
```

## How It Maps to Taskade

The folder structure mirrors the Workspace tab in Taskade:

```
GitHub Repo                    Taskade Workspace Tab
═══════════                    ═════════════════════
agents/*.json          ──►     [Agents] filter pill
automations/*.json     ──►     [Automations] filter pill
projects/*.json        ──►     [Projects] filter pill
apps/*.json            ──►     [Apps] Genesis app UI
```

Each JSON file is the same data shape that Taskade's internal `SpaceBundleData` uses. You can:
- **Export** a workspace from Taskade → get these JSON files
- **Edit** the JSON files in any editor
- **Import** back into Taskade → get a working workspace

## Scripts

| Command | What it does |
|---------|-------------|
| `npm run export` | Pull a workspace into local JSON files |
| `npm run validate` | Validates all JSON files against Taskade schemas |
| `npm run assemble` | Combines all items into `dist/workspace.json` |
| `npm run build` | Assemble + validate (both steps) |
| `npm run import` | Upload `workspace.json` to a Taskade workspace |

## Creating Your Own App

1. **Add an agent**: Create `agents/my-agent.json` with an `AgentTemplate`:
   ```json
   {
     "version": "1",
     "name": "My Agent",
     "commands": [
       { "id": "default", "name": "Default", "prompt": "You are a helpful assistant.", "mode": "default" }
     ]
   }
   ```

2. **Add an automation**: Create `automations/my-flow.json` with a `FlowTemplateV2`:
   ```json
   {
     "version": "2",
     "flowTitle": "My Flow",
     "trigger": { "type": "WEBHOOK", "valid": true, "settings": {} },
     "actions": []
   }
   ```

3. **Add a project**: Create `projects/my-project.json` with a taskast `Root`:
   ```json
   {
     "type": "root",
     "children": [{
       "type": "text",
       "id": "root",
       "text": { "ops": [{ "insert": "My Project\n" }] },
       "children": []
     }]
   }
   ```

4. **Add a Genesis app**: Create `apps/my-app.json` with a `FileSystemTree`:
   ```json
   {
     "src": {
       "directory": {
         "App.tsx": {
           "file": {
             "contents": "import * as React from 'react';\nexport default function App() {\n  return <div>Hello World</div>;\n}\n"
           }
         }
       }
     }
   }
   ```
   The file system tree mirrors the Parade base template structure. Each file node has `{ file: { contents: "..." } }` and directories use `{ directory: { ... } }`.

5. Run `npm run build` to assemble and validate.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TASKADE_API_TOKEN` | For import | Personal Access Token (`tskdp_...`) |
| `TASKADE_WORKSPACE_ID` | For import | Target workspace ID |
| `TASKADE_API_URL` | No | API base URL (default: `https://taskade.com`) |

Get your API token at [taskade.com/settings/api](https://www.taskade.com/settings/api).

## Related

- [Build an app with Taskade Genesis](https://www.taskade.com/create)
- [AI app builder](https://www.taskade.com/ai/apps)
- [AI agents](https://www.taskade.com/ai/agents)
- [Community apps you can clone](https://www.taskade.com/apps)
- [Hosted MCP server](https://www.taskade.com/mcp)
- [Taskade API Docs](https://www.taskade.com/api/documentation/v1)
- [Taskade MCP Server on GitHub](https://github.com/taskade/mcp)

## License

MIT
