# taskade-sample-app

A template for your own Taskade Genesis App Kit: projects, AI agents, automations and app UI as JSON files that you edit here and import into a Taskade workspace.

<p align="center">
  <a href="https://www.taskade.com/create"><img src="https://www.taskade.com/static_images/workspace-dna.gif" alt="One Taskade Genesis app and its parts: an event sign-up page with its AI assistant chat, the projects list, a table of registrations, three AI agents and a list of automations" width="640"></a>
</p>

> **This repository is a template for your own App Kit.** Fork or clone it, change the JSON files and import the result into your workspace.
> Found a problem with the template or its scripts? [Open an issue in this repository](https://github.com/taskade/taskade-sample-app/issues). For a problem with the Taskade product, open an issue at [taskade/taskade](https://github.com/taskade/taskade/issues).

## Quick Start

```bash
# 1. Fork or clone this repository
gh repo fork taskade/taskade-sample-app --clone
# or: git clone https://github.com/taskade/taskade-sample-app.git
cd taskade-sample-app

# 2. Install dependencies
npm install

# 3. Assemble dist/workspace.json and validate every file
npm run build

# 4. Import into Taskade
TASKADE_API_TOKEN=tskdp_... TASKADE_WORKSPACE_ID=... npm run import

# Or export an existing workspace into this repo
TASKADE_API_TOKEN=tskdp_... TASKADE_WORKSPACE_ID=... npm run export
```

Steps 1 to 3 need no Taskade account. Step 4 and the export need a Personal Access Token, see [Environment Variables](#environment-variables).

## What is Workspace DNA?

[Taskade](https://www.taskade.com) is an AI-native workspace where one prompt builds a running app with its own data, AI agents and automations.

[Taskade Genesis](https://www.taskade.com/create) turns one prompt into a running app: projects store the data, AI agents do the thinking, automations run the work across 100+ integrations, and the interface is built for you. This repo is a sample Taskade Genesis App Kit. It stores the **Workspace DNA** of one app as files.

Workspace DNA has three parts: Memory, Intelligence and Execution. The app interface sits on top of them:

| Layer | Folder | What it does |
|-------|--------|-------------|
| **Memory** | `projects/` | Structured data: task trees, checklists, notes |
| **Intelligence** | `agents/` | AI agents with custom commands and personas |
| **Execution** | `automations/` | Trigger-action workflows connecting services |
| **Interface** | `apps/` | Taskade Genesis app UI: React components that the app engine runs |

This repo contains one JSON file per DNA item, in the same format that the Taskade bundle import and export API uses. No build toolchain required to understand or edit.

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
│   └── hello-world.json       # Sample Taskade Genesis app (React + Tailwind)
├── media/
│   └── icon.svg               # App icon
├── scripts/
│   ├── assemble.ts            # Combines folders → workspace.json
│   ├── validate.ts            # Validates against SpaceBundleData schema
│   ├── import.ts              # Uploads to Taskade via API
│   └── export.ts              # Downloads a workspace via API
└── dist/                      # (generated) assembled bundle
    └── workspace.json
```

## How It Maps to Taskade

Each folder maps to one part of a Taskade workspace:

```
GitHub Repo                    Taskade Workspace
═══════════                    ═════════════════
agents/*.json          ──►     AI agents
automations/*.json     ──►     Automations
projects/*.json        ──►     Projects
apps/*.json            ──►     Taskade Genesis app UI
```

Each JSON file is the same data shape that the Taskade bundle API uses (`SpaceBundleData` v1). You can:
- **Export** a workspace from Taskade → get these JSON files
- **Edit** the JSON files in any editor
- **Import** back into Taskade → get a working workspace

Each published App Kit in the [Taskade App Factory](https://www.taskade.com/apps) shows the same parts, with a **Clone App Kit** button that copies them into your workspace:

<p align="center">
  <a href="https://www.taskade.com/apps"><img src="https://www.taskade.com/static_images/newsletter-gifs/2026-04-14-app-kits-share-publish.gif" alt="An App Kit page in the Taskade App Factory: the Recipe Planner Studio app beside its projects, agents, automations and media, with a Clone App Kit button" width="640"></a>
</p>

## Scripts

| Command | What it does |
|---------|-------------|
| `npm run export` | Pull a workspace into local JSON files (bundle export needs the Pro plan or higher, see [pricing](https://www.taskade.com/pricing)) |
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

4. **Add a Taskade Genesis app**: Create `apps/my-app.json` with a `FileSystemTree`:
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
   The file system tree mirrors the file structure of a Taskade Genesis app. Each file node has `{ file: { contents: "..." } }` and directories use `{ directory: { ... } }`.

5. Run `npm run build` to assemble and validate.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TASKADE_API_TOKEN` | For import and export | Personal Access Token (`tskdp_...`) |
| `TASKADE_WORKSPACE_ID` | For import and export | Target or source workspace ID |
| `TASKADE_API_URL` | No | API base URL (default: `https://www.taskade.com`) |

Get your API token at [taskade.com/settings/api](https://www.taskade.com/settings/api).

## Related

- [Build an app with Taskade Genesis](https://www.taskade.com/create)
- [AI app builder](https://www.taskade.com/ai/apps)
- [AI agents](https://www.taskade.com/ai/agents)
- [Taskade App Factory: App Kits you can clone](https://www.taskade.com/apps)
- [Hosted MCP server](https://www.taskade.com/docs/mcp/hosted-mcp) at `https://www.taskade.com/mcp`, part of every paid plan
- [Taskade API Docs](https://www.taskade.com/api/documentation/v1)
- [Taskade MCP Server on GitHub](https://github.com/taskade/mcp)

## License

MIT

---

[Build an app from a prompt](https://www.taskade.com/create) · [Taskade App Factory](https://www.taskade.com/apps) · [Docs](https://www.taskade.com/docs) · [Agent skills](https://github.com/taskade/skills) · [MCP server](https://github.com/taskade/mcp)
