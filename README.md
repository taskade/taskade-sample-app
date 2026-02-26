# taskade-sample-app

A sample [Taskade](https://taskade.com) Genesis App Kit demonstrating **Workspace DNA** — the portable format for AI-powered workspaces.

## What is Workspace DNA?

Every Taskade workspace is built from four types of DNA:

| Layer | Folder | What it does |
|-------|--------|-------------|
| **Memory** | `projects/` | Structured data — task trees, checklists, notes |
| **Intelligence** | `agents/` | AI agents with custom commands and personas |
| **Reflexes** | `automations/` | Trigger-action workflows connecting services |
| **Interface** | *(coming soon)* | Generated app UI via Parade engine |

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
```

Each JSON file is the same data shape that Taskade's internal `SpaceBundleData` uses. You can:
- **Export** a workspace from Taskade → get these JSON files
- **Edit** the JSON files in any editor
- **Import** back into Taskade → get a working workspace

## Scripts

| Command | What it does |
|---------|-------------|
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

4. Run `npm run build` to assemble and validate.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TASKADE_API_TOKEN` | For import | Personal Access Token (`tskdp_...`) |
| `TASKADE_WORKSPACE_ID` | For import | Target workspace ID |
| `TASKADE_API_URL` | No | API base URL (default: `https://taskade.com`) |

Get your API token at [taskade.com/settings/api](https://taskade.com/settings/api).

## Related

- [Taskade API Docs](https://taskade.com/api/documentation/v1)
- [Taskade MCP Server](https://github.com/taskade/mcp) (109+ stars)
- [Issue #25542](https://github.com/taskade/taskcade/issues/25542) — The vision behind this repo

## License

MIT
