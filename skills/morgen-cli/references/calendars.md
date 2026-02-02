# Calendar & Events Reference

## Calendar Hierarchy

```
Account (Google, Office 365, etc.)
├── Calendar 1 (Work)
│   └── Events
├── Calendar 2 (Personal)
│   └── Events
└── Calendar 3 (Shared Team)
    └── Events
```

**Key IDs:**
- **Account ID** - The connected integration (e.g., Google account)
- **Calendar ID** - A specific calendar within an account
- **Event ID** - A specific event

## List Calendars

```bash
morgen-calendar list-calendars
# Alias: morgen-calendar lc
```

**Output:** Calendar name, ID, account ID, provider, color.

## List Accounts

```bash
morgen-calendar list-accounts
# Alias: morgen-calendar la
# JSON output: --json
```

## List Events

```bash
morgen-calendar list-events \
  --calendar-id <CAL_ID> \
  --account-id <ACC_ID> \
  --start <ISO_DATE> \
  --end <ISO_DATE>
# Alias: morgen-calendar le
```

| Parameter | Required | Default |
|-----------|----------|---------|
| `--calendar-id` | Yes | - |
| `--account-id` | Yes | - |
| `--start` | No | 7 days ago |
| `--end` | No | 7 days ahead |

**Date format:** ISO 8601 (e.g., `2025-01-28T00:00:00`)

**Examples:**
```bash
# This week
morgen-calendar list-events \
  --calendar-id cal_abc123 \
  --account-id acc_xyz789 \
  --start "2025-01-27T00:00:00" \
  --end "2025-02-02T23:59:59"

# Today only
morgen-calendar list-events \
  --calendar-id cal_abc123 \
  --account-id acc_xyz789 \
  --start "2025-01-28T00:00:00" \
  --end "2025-01-28T23:59:59"
```

## Create Event

```bash
morgen-calendar create-event \
  --calendar-id <CAL_ID> \
  --account-id <ACC_ID> \
  --title <TITLE> \
  --start <DATETIME> \
  --end <DATETIME> \
  [options]
# Alias: morgen-calendar ce
```

**Required:**
| Parameter | Description |
|-----------|-------------|
| `--calendar-id` | Target calendar |
| `--account-id` | Account ID |
| `--title` | Event title |
| `--start` | Start time (ISO 8601) |
| `--end` | End time (ISO 8601) |

**Optional:**
| Parameter | Description |
|-----------|-------------|
| `--description` | Event notes |
| `--location` | Location |
| `--all-day` | Mark as all-day event |
| `--participants` | Comma-separated emails |
| `--google-meet` | Add Google Meet link |
| `--timezone` | IANA timezone (default: Europe/Stockholm) |

**Examples:**

Simple event:
```bash
morgen-calendar create-event \
  --calendar-id cal_abc123 \
  --account-id acc_xyz789 \
  --title "Team Standup" \
  --start "2025-01-28T09:00:00" \
  --end "2025-01-28T09:30:00"
```

With Google Meet and attendees:
```bash
morgen-calendar create-event \
  --calendar-id cal_abc123 \
  --account-id acc_xyz789 \
  --title "Sprint Planning" \
  --start "2025-01-28T10:00:00" \
  --end "2025-01-28T11:00:00" \
  --participants "alice@company.com,bob@company.com" \
  --google-meet \
  --description "Q1 planning session"
```

All-day event:
```bash
morgen-calendar create-event \
  --calendar-id cal_abc123 \
  --account-id acc_xyz789 \
  --title "Company Holiday" \
  --start "2025-02-15T00:00:00" \
  --end "2025-02-16T00:00:00" \
  --all-day
```

Different timezone:
```bash
morgen-calendar create-event \
  --calendar-id cal_abc123 \
  --account-id acc_xyz789 \
  --title "US Team Sync" \
  --start "2025-01-28T09:00:00" \
  --end "2025-01-28T10:00:00" \
  --timezone "America/New_York"
```

## Update Event

```bash
morgen-calendar update-event \
  --event-id <EVENT_ID> \
  --calendar-id <CAL_ID> \
  --account-id <ACC_ID> \
  [fields to update]
# Alias: morgen-calendar ue
```

**Required:** `--event-id`, `--calendar-id`, `--account-id`

**Optional updates:**
| Parameter | Description |
|-----------|-------------|
| `--title` | New title |
| `--start` | New start time |
| `--end` | New end time |
| `--description` | New description |
| `--location` | New location |
| `--all-day` | Make all-day |
| `--series-update-mode` | For recurring: `single`, `future`, `all` |

**Examples:**

Reschedule:
```bash
morgen-calendar update-event \
  --event-id evt_123abc \
  --calendar-id cal_abc123 \
  --account-id acc_xyz789 \
  --start "2025-01-29T14:00:00" \
  --end "2025-01-29T15:00:00"
```

Update single occurrence of recurring event:
```bash
morgen-calendar update-event \
  --event-id evt_123abc \
  --calendar-id cal_abc123 \
  --account-id acc_xyz789 \
  --start "2025-01-30T10:00:00" \
  --end "2025-01-30T11:00:00" \
  --series-update-mode single
```

Update all future occurrences:
```bash
morgen-calendar update-event \
  --event-id evt_123abc \
  --calendar-id cal_abc123 \
  --account-id acc_xyz789 \
  --title "Renamed Weekly Sync" \
  --series-update-mode future
```

## Delete Event

```bash
morgen-calendar delete-event \
  --event-id <EVENT_ID> \
  --calendar-id <CAL_ID> \
  --account-id <ACC_ID> \
  [--series-update-mode <MODE>]
# Alias: morgen-calendar de
```

**Series modes:** `single` (default), `future`, `all`

```bash
# Delete single event
morgen-calendar delete-event \
  --event-id evt_123abc \
  --calendar-id cal_abc123 \
  --account-id acc_xyz789

# Delete all future occurrences of recurring event
morgen-calendar delete-event \
  --event-id evt_123abc \
  --calendar-id cal_abc123 \
  --account-id acc_xyz789 \
  --series-update-mode future
```

## RSVP to Event

```bash
morgen-calendar rsvp-event \
  --event-id <EVENT_ID> \
  --action <ACTION> \
  [options]
# Alias: morgen-calendar rsvp
```

**Actions:** `accept`, `decline`, `tentatively-accept`

**Options:**
| Parameter | Description |
|-----------|-------------|
| `--series-update-mode` | For recurring: `single`, `future`, `all` |
| `--comment` | Message to organizer |
| `--notify-organizer` | `true`/`false` (default: true) |

```bash
# Accept
morgen-calendar rsvp-event --event-id evt_123 --action accept

# Decline with comment
morgen-calendar rsvp-event \
  --event-id evt_123 \
  --action decline \
  --comment "I have a conflict"
```

## Update Calendar Metadata

```bash
morgen-calendar update-calendar \
  --calendar-id <CAL_ID> \
  --account-id <ACC_ID> \
  [options]
# Alias: morgen-calendar uc
```

| Parameter | Description |
|-----------|-------------|
| `--busy` | `true`/`false` - affects availability |
| `--color` | Hex color (e.g., `#FF0000`) |
| `--name` | Custom name override |

## Common Timezones

| Region | Timezone |
|--------|----------|
| US Pacific | `America/Los_Angeles` |
| US Eastern | `America/New_York` |
| UK | `Europe/London` |
| Central Europe | `Europe/Berlin` |
| Sweden | `Europe/Stockholm` |
| Japan | `Asia/Tokyo` |
