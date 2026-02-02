# morgen-cli

> A unified CLI tool for [Morgen](https://morgen.so) calendar and task management.

---

## ⚠️ Disclaimer

**This is NOT an official Morgen product.**

This CLI tool is **NOT officially affiliated with**, endorsed by, or connected to [Morgen AG](https://morgen.so).

- This is an independent open-source project developed by [Sengi AI AB](https://sengi.se)
- The [Morgen API](https://docs.morgen.so/) is **experimental** and subject to change
- Use at your own risk
- Please respect the [Morgan Terms of Service](https://morgen.so/terms) when using this tool

---

## Features

- 📅 **Calendar Management** - List, create, update, and delete events
- ✅ **Task Management** - Full CRUD operations for tasks
- ⚙️ **Configuration** - Store API keys and defaults in `~/.morgen-cli/config.json`
- 🔄 **Recurring Events** - Support for series update modes (all, future, single)
- 📋 **Integration Management** - List connected accounts and providers

## Installation

### Via npm
```bash
npm install -g morgen-cli
```

### Via pnpm
```bash
pnpm add -g morgen-cli
```

## Quick Start

### 1. Set up your API key

Get your API key from [platform.morgen.so](https://platform.morgen.so/).

```bash
# Using the config command
morgen-config set apiKey YOUR_API_KEY_HERE

# Or via environment variable
export MORGEN_API_KEY=YOUR_API_KEY_HERE
```

### 2. List your calendars

```bash
morgen-calendar list-calendars
```

## Commands

### Calendar CLI (`morgen-calendar`)

```bash
# List all calendars
morgen-calendar list-calendars

# List events in a calendar
morgen-calendar list-events --calendar-id <ID> --account-id <ID>

# Create an event
morgen-calendar create-event \
  --calendar-id <ID> \
  --account-id <ID> \
  --title "Team Meeting" \
  --start "2025-03-15T10:00:00" \
  --end "2025-03-15T11:00:00"

# Update an event
morgen-calendar update-event \
  --event-id <ID> \
  --calendar-id <ID> \
  --account-id <ID> \
  --title "Updated Title"

# Delete an event
morgen-calendar delete-event \
  --event-id <ID> \
  --calendar-id <ID> \
  --account-id <ID>

# RSVP to an event
morgen-calendar rsvp-event \
  --event-id <ID> \
  --action accept

# List connected accounts
morgen-calendar list-accounts

# List available providers
morgen-calendar list-providers
```

### Tasks CLI (`morgen-tasks`)

```bash
# List all tasks
morgen-tasks list

# Get a specific task
morgen-tasks get --id <TASK_ID>

# Create a task
morgen-tasks create \
  --title "Review report" \
  --due "2025-03-15T17:00:00" \
  --priority 1

# Update a task
morgen-tasks update \
  --id <TASK_ID> \
  --title "Updated title"

# Move a task
morgen-tasks move \
  --id <TASK_ID> \
  --previous-id <PREVIOUS_ID>

# Delete a task
morgen-tasks delete --id <TASK_ID>

# Mark task as completed
morgen-tasks close --id <TASK_ID>

# Reopen a task
morgen-tasks reopen --id <TASK_ID>
```

### Config CLI (`morgen-config`)

```bash
# Set API key
morgen-config set apiKey YOUR_API_KEY

# Set default values
morgen-config set defaults.accountId <ID>
morgen-config set defaults.calendarId <ID>
morgen-config set defaults.timezone Europe/Berlin

# List all configuration
morgen-config list

# Show configuration status
morgen-config status

# Open config in editor
morgen-config edit

# Show config file path
morgen-config path
```

## Configuration

Configuration is loaded in this priority order:

1. **Environment variables** (highest priority)
2. **Config file** (`~/.morgen-cli/config.json`)
3. **Default values**

### Environment Variables

| Variable | Description |
|----------|-------------|
| `MORGEN_API_KEY` | Your Morgen API key |
| `DEFAULT_ACCOUNT_ID` | Default account ID to use |
| `DEFAULT_CALENDAR_ID` | Default calendar ID to use |
| `DEFAULT_TIMEZONE` | Default timezone (default: Europe/Stockholm) |

### Config File Example

```json
{
  "apiKey": "your-api-key",
  "defaults": {
    "accountId": "your-account-id",
    "calendarId": "your-calendar-id",
    "timezone": "Europe/Stockholm"
  }
}
```

## Development

```bash
# Clone repository
git clone <repository>

# Install dependencies
cd packages/morgen-cli
pnpm install

# Run from source
pnpm dev:calendar --help
pnpm dev:tasks --help
pnpm dev:config --help

# Build
pnpm build

# Type check
pnpm type-check
```

## License

MIT

## Links

- [Morgen API Documentation](https://docs.morgen.so/)
- [Morgen Platform](https://platform.morgen.so/)
