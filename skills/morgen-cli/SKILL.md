---
name: morgen-cli
description: Manage calendars and tasks via the Morgen CLI. List events across multiple calendars, create meetings with Google Meet, invite attendees, reschedule events, and manage tasks. Use when the user mentions calendar, schedule, meetings, events, tasks, morgen, "what's on my calendar", "schedule a meeting", or "add a task".
allowed-tools: Bash(morgen-calendar:*) Bash(morgen-tasks:*) Bash(morgen-config:*)
---

# Morgen CLI

Command-line interface for Morgen calendar and task management.

## Critical: First-Time Setup

**Before using any morgen commands:**

1. Check if CLI is installed: `which morgen-calendar`
2. Check if API key is configured: `morgen-config status`
3. If not set up, see [references/install.md](references/install.md)

## Critical: Save Calendar IDs to Memory

**After your first successful `morgen-calendar list-calendars`, you MUST save calendar IDs to memory.**

Without saved IDs, you must run `list-calendars` before every operation. See [references/memory-setup.md](references/memory-setup.md) for the exact format.

## Three CLI Tools

| Tool | Purpose |
|------|---------|
| `morgen-calendar` | Calendar and event management |
| `morgen-tasks` | Task management |
| `morgen-config` | Configuration |

## Quick Reference

### List All Calendars (Do This First)

```bash
morgen-calendar list-calendars
```

Returns calendar IDs, account IDs, and providers. **Save these to memory.**

### List Events

```bash
morgen-calendar list-events \
  --calendar-id <CAL_ID> \
  --account-id <ACC_ID> \
  --start "2025-01-27T00:00:00" \
  --end "2025-02-02T23:59:59"
```

Default range: 7 days ago to 7 days ahead.

### Create Event

```bash
morgen-calendar create-event \
  --calendar-id <CAL_ID> \
  --account-id <ACC_ID> \
  --title "Meeting Title" \
  --start "2025-01-28T10:00:00" \
  --end "2025-01-28T11:00:00"
```

**With Google Meet:**
```bash
morgen-calendar create-event \
  --calendar-id <CAL_ID> \
  --account-id <ACC_ID> \
  --title "Video Call" \
  --start "2025-01-28T14:00:00" \
  --end "2025-01-28T15:00:00" \
  --google-meet
```

**With attendees:**
```bash
morgen-calendar create-event \
  --calendar-id <CAL_ID> \
  --account-id <ACC_ID> \
  --title "Team Sync" \
  --start "2025-01-28T10:00:00" \
  --end "2025-01-28T11:00:00" \
  --participants "alice@example.com,bob@example.com" \
  --google-meet
```

### Move/Reschedule Event

```bash
morgen-calendar update-event \
  --event-id <EVENT_ID> \
  --calendar-id <CAL_ID> \
  --account-id <ACC_ID> \
  --start "2025-01-29T10:00:00" \
  --end "2025-01-29T11:00:00"
```

For recurring events, add `--series-update-mode single|future|all`.

### Delete Event

```bash
morgen-calendar delete-event \
  --event-id <EVENT_ID> \
  --calendar-id <CAL_ID> \
  --account-id <ACC_ID>
```

### RSVP to Event

```bash
morgen-calendar rsvp-event --event-id <EVENT_ID> --action accept
# Actions: accept, decline, tentatively-accept
```

### Tasks

```bash
morgen-tasks list                           # List all tasks
morgen-tasks create --title "Task name"     # Create task
morgen-tasks close --id <TASK_ID>           # Complete task
```

## Listing Events Across Multiple Calendars

The CLI queries one calendar at a time. To show "what's on this week" across all calendars:

1. Get calendar IDs from memory
2. Run `list-events` for each calendar
3. Combine and sort results chronologically

```bash
# For each calendar in your saved group:
morgen-calendar list-events --calendar-id <CAL1> --account-id <ACC1> --start "..." --end "..."
morgen-calendar list-events --calendar-id <CAL2> --account-id <ACC2> --start "..." --end "..."
```

## Timezone Handling

- Default: `Europe/Stockholm`
- Override: `--timezone "America/New_York"`
- UTC: Use `Z` suffix: `--start "2025-01-28T15:00:00Z"`

## Deep-Dive References

| Reference | Description |
|-----------|-------------|
| [references/install.md](references/install.md) | Installation, API key setup, configuration |
| [references/calendars.md](references/calendars.md) | Complete calendar and events reference |
| [references/tasks.md](references/tasks.md) | Complete tasks reference |
| [references/memory-setup.md](references/memory-setup.md) | **Critical** - How to save calendar IDs |

## Error Troubleshooting

| Error | Solution |
|-------|----------|
| "API key not configured" | `morgen-config set apiKey YOUR_KEY` |
| "Calendar not found" | Run `list-calendars` to get correct IDs |
| Command not found | `npm install -g morgen-cli` |
