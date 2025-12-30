# Hume EVI 3 Tools Configuration

## Problem

Hume EVI 3 strictly validates JSON Schema for tool parameters. Tools with empty or optional-only parameters fail validation.

## Solution

Each tool MUST have:
- `"type": "object"`
- `"properties": {...}` with at least one property described
- `"required": [...]` array (can be empty, but must exist)

## Tool Definitions for Hume Dashboard

### 1. search_vault_v2

```json
{
  "name": "search_vault_v2",
  "description": "Search notes in Stas's personal vault by topic, keyword or content. Use when user asks 'What did I write about X?' or 'Find my notes on...'",
  "parameters": "{\"type\":\"object\",\"properties\":{\"query\":{\"type\":\"string\",\"description\":\"The search term to find in notes\"}},\"required\":[\"query\"]}",
  "fallback_content": "Unable to search vault at the moment."
}
```

### 2. get_today_note_v2

**Problem**: No required parameters - EVI 3 validation fails with empty properties.

**Fix**: Add a meaningful optional parameter:

```json
{
  "name": "get_today_note_v2",
  "description": "Get today's daily note with tasks, log entries and plan. Use for questions about today's schedule or recent activities.",
  "parameters": "{\"type\":\"object\",\"properties\":{\"sections\":{\"type\":\"string\",\"description\":\"Optional: filter to specific sections (tasks, log, health). Leave empty for full note.\"}},\"required\":[]}",
  "fallback_content": "Unable to get today's note."
}
```

### 3. read_note_v2

```json
{
  "name": "read_note_v2",
  "description": "Read a specific note from the vault by path or filename. Use when user asks to read a specific note.",
  "parameters": "{\"type\":\"object\",\"properties\":{\"path\":{\"type\":\"string\",\"description\":\"Path or name of the note, e.g. '03-Areas/Goals/weekly.md' or just 'weekly'\"}},\"required\":[\"path\"]}",
  "fallback_content": "Unable to read the note."
}
```

## Configuration Setup

1. Create each tool via Hume API or Dashboard
2. Create EVI config with tools attached:

```json
{
  "evi_version": "3",
  "name": "Cogito Voice Assistant",
  "voice": {
    "provider": "HUME_AI",
    "name": "ITO"
  },
  "language_model": {
    "model_provider": "ANTHROPIC",
    "model_resource": "claude-sonnet-4-5-20250929"
  },
  "tools": [
    { "id": "<search_vault_v2_tool_id>" },
    { "id": "<get_today_note_v2_tool_id>" },
    { "id": "<read_note_v2_tool_id>" }
  ]
}
```

3. Use the config ID in cogito-voice `.env`:
```
NEXT_PUBLIC_HUME_CONFIG_ID=<your_config_id>
```

## Testing

After updating tools in Hume Dashboard:
1. Restart cogito-voice dev server
2. Open browser console
3. Say "What's on my plate today?"
4. Check console for tool call logs
