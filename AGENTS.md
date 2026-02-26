# AGENTS.md

This repository contains a Taskade Genesis App Kit — a collection of AI agents, automations, and projects that form a portable "Workspace DNA" bundle.

## For AI Assistants

When working with this repo:

1. **JSON files are the source of truth.** Each file in `agents/`, `automations/`, and `projects/` is a standalone JSON definition that maps directly to Taskade's internal data model.

2. **Do not invent new schema fields.** The JSON shapes are defined by Taskade's Zod schemas (`AgentTemplate`, `FlowTemplateV2`, `TaskastRoot`). Only use documented fields.

3. **Validate after changes.** Always run `npm run validate` after modifying any JSON file to catch schema violations early.

4. **Agent commands** are the core unit of agent behavior. Each command has:
   - `id`: snake_case identifier
   - `name`: Human-readable title case
   - `prompt`: Direct instruction to the agent (min 30 words recommended)
   - `mode`: `default`, `plan-and-execute-v1`, or `plan-and-execute-v2`

5. **Project nodes** use the taskast format (similar to Quill Delta). Every text node needs:
   - `type: "text"`
   - `text.ops` array ending with `{ "insert": "\n" }`
   - `children` array (can be empty)

## Project Structure

- `agents/*.json` — AI agent definitions (AgentTemplate v1)
- `automations/*.json` — Automation flow definitions (FlowTemplateV2)
- `projects/*.json` — Project content trees (taskast Root)
- `manifest.json` — App metadata
- `scripts/` — Build, validate, and import tooling
