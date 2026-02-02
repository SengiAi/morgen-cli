# Tasks Reference

## Task Properties

| Property | Description |
|----------|-------------|
| ID | Unique identifier |
| Title | Task name |
| Description | Detailed notes |
| Due | Due date (LocalDateTime format) |
| Timezone | IANA timezone |
| Priority | 0 (undefined), 1 (highest) to 9 (lowest) |
| Status | Pending or Completed |
| Parent ID | For subtasks |

## List Tasks

```bash
morgen-tasks list
# Alias: morgen-tasks ls
```

| Option | Description |
|--------|-------------|
| `--limit <n>` | Max tasks (default: 100, max: 100) |
| `--updated-after <date>` | Filter by update time |

```bash
# List all
morgen-tasks list

# List 10 most recent
morgen-tasks list --limit 10

# Tasks updated this week
morgen-tasks list --updated-after "2025-01-21T00:00:00"
```

## Get Single Task

```bash
morgen-tasks get --id <TASK_ID>
```

## Create Task

```bash
morgen-tasks create --title <TITLE> [options]
# Alias: morgen-tasks new
```

| Parameter | Required | Description |
|-----------|----------|-------------|
| `--title` | Yes | Task title |
| `--description` | No | Notes |
| `--due` | No | Due date (YYYY-MM-DDTHH:mm:ss) |
| `--timezone` | No | IANA timezone |
| `--priority` | No | 0-9 (1=highest) |
| `--parent-id` | No | Parent task for subtasks |

**Examples:**

Simple task:
```bash
morgen-tasks create --title "Review quarterly report"
```

With due date and priority:
```bash
morgen-tasks create \
  --title "Submit expense report" \
  --due "2025-01-31T17:00:00" \
  --priority 2
```

Full details:
```bash
morgen-tasks create \
  --title "Prepare presentation" \
  --description "Create slides for Q1 planning. Include budget forecasts." \
  --due "2025-01-30T09:00:00" \
  --timezone "America/New_York" \
  --priority 1
```

Subtask:
```bash
# Create parent
morgen-tasks create --title "Project Alpha"

# Create subtasks
morgen-tasks create --title "Write docs" --parent-id task_parent123
morgen-tasks create --title "Setup CI/CD" --parent-id task_parent123
```

## Update Task

```bash
morgen-tasks update --id <TASK_ID> [fields]
```

| Parameter | Description |
|-----------|-------------|
| `--title` | New title |
| `--description` | New description |
| `--due` | New due date |
| `--timezone` | New timezone |
| `--priority` | New priority (0-9) |

```bash
morgen-tasks update --id task_abc123 --title "Updated title"

morgen-tasks update \
  --id task_abc123 \
  --due "2025-02-01T12:00:00" \
  --priority 3
```

## Move Task

```bash
morgen-tasks move --id <TASK_ID> [options]
```

| Parameter | Description |
|-----------|-------------|
| `--previous-id` | Task to appear after ("null" for first) |
| `--parent-id` | Parent task ("null" for root level) |

```bash
# Move to first position
morgen-tasks move --id task_abc123 --previous-id null

# Make subtask of another task
morgen-tasks move --id task_abc123 --parent-id task_parent456

# Move to root level
morgen-tasks move --id task_abc123 --parent-id null
```

## Complete Task

```bash
morgen-tasks close --id <TASK_ID>
# Alias: morgen-tasks done
```

For recurring tasks:
```bash
morgen-tasks close --id <TASK_ID> --occurrence-start "2025-01-28T09:00:00"
```

## Reopen Task

```bash
morgen-tasks reopen --id <TASK_ID>
```

For recurring tasks:
```bash
morgen-tasks reopen --id <TASK_ID> --occurrence-start "2025-01-28T09:00:00"
```

## Delete Task

```bash
morgen-tasks delete --id <TASK_ID>
# Alias: morgen-tasks rm
```

**Warning:** Permanent deletion, no undo.

## Priority Levels

| Value | Meaning |
|-------|---------|
| 0 | Undefined |
| 1 | Highest |
| 2-4 | High |
| 5 | Medium |
| 6-8 | Low |
| 9 | Lowest |

## Date Format

Tasks use LocalDateTime format (no timezone in string):
```
YYYY-MM-DDTHH:mm:ss
```

Examples:
- `2025-01-28T09:00:00` - 9:00 AM
- `2025-01-28T17:30:00` - 5:30 PM

Use `--timezone` to specify timezone:
```bash
morgen-tasks create \
  --title "Call US team" \
  --due "2025-01-28T09:00:00" \
  --timezone "America/New_York"
```
