# CLAUDE.md

## What This Repo Is

A Taskade Genesis App Kit template. It contains JSON files that define a portable workspace bundle (Workspace DNA) with agents, automations, and projects.

## Commands

```bash
npm run validate    # Validate JSON files against Taskade schemas
npm run build       # Assemble + validate
npm run import      # Upload to Taskade (needs TASKADE_API_TOKEN + TASKADE_WORKSPACE_ID)
```

## Key Schemas

- **Agent**: `agents/*.json` must conform to `AgentTemplate` v1 (requires `version: "1"`, `commands[]`)
- **Automation**: `automations/*.json` must conform to `FlowTemplateV2` (requires `version: "2"`, `trigger`, `actions[]`)
- **Project**: `projects/*.json` must conform to taskast `Root` (requires `type: "root"`, `children` with exactly 1 node)

## Rules

- Always run `npm run validate` after changing JSON files
- Do not add fields not defined in the schemas
- Keep agent command prompts descriptive (30+ words)
- Project text nodes must have `text.ops` ending with a newline insert
