# Saving Calendar IDs to Memory

## Why This Is Required

Every calendar command requires `--calendar-id` and `--account-id`. Without these in memory, you must run `list-calendars` before every operation.

**You MUST save calendar information after your first successful `list-calendars`.**

## What to Save

After `morgen-calendar list-calendars`, save:

1. **All calendars with their IDs**
2. **The user's default/primary calendar**
3. **Calendar groups** (all, work, personal)
4. **User's timezone**

## Memory Format

Use this exact format:

```
=== MORGEN CALENDAR CONFIGURATION ===

CALENDARS:
1. [Calendar Name]
   - Calendar ID: [cal_xxxxx]
   - Account ID: [acc_xxxxx]
   - Provider: [google_calendar/office365]

2. [Calendar Name]
   - Calendar ID: [cal_xxxxx]
   - Account ID: [acc_xxxxx]
   - Provider: [provider]

DEFAULT CALENDAR:
- Name: [Primary calendar name]
- Calendar ID: [cal_xxxxx]
- Account ID: [acc_xxxxx]
(Use this for new events unless user specifies otherwise)

CALENDAR GROUPS:
- all: [cal_id1, cal_id2, cal_id3]
- work: [cal_id1, cal_id3]
- personal: [cal_id2]

USER TIMEZONE: [Europe/Stockholm or user's timezone]
```

## Example Memory Entry

```
=== MORGEN CALENDAR CONFIGURATION ===

CALENDARS:
1. Work (Primary)
   - Calendar ID: cal_work_abc123
   - Account ID: acc_google_456
   - Provider: google_calendar

2. Personal
   - Calendar ID: cal_personal_def789
   - Account ID: acc_google_456
   - Provider: google_calendar

3. Team Shared
   - Calendar ID: cal_team_ghi012
   - Account ID: acc_google_456
   - Provider: google_calendar

4. Outlook Work
   - Calendar ID: cal_outlook_jkl345
   - Account ID: acc_microsoft_789
   - Provider: office365

DEFAULT CALENDAR:
- Name: Work (Primary)
- Calendar ID: cal_work_abc123
- Account ID: acc_google_456

CALENDAR GROUPS:
- all: [cal_work_abc123, cal_personal_def789, cal_team_ghi012, cal_outlook_jkl345]
- work: [cal_work_abc123, cal_team_ghi012, cal_outlook_jkl345]
- personal: [cal_personal_def789]

USER TIMEZONE: Europe/Stockholm
```

## How to Use Saved IDs

### "What's on my calendar this week?"

1. Get "all" group from memory
2. Run `list-events` for each calendar
3. Combine and sort chronologically

```bash
morgen-calendar list-events --calendar-id cal_work_abc123 --account-id acc_google_456 --start "..." --end "..."
morgen-calendar list-events --calendar-id cal_personal_def789 --account-id acc_google_456 --start "..." --end "..."
# ... for each calendar
```

### "Schedule a meeting"

Use DEFAULT CALENDAR from memory:

```bash
morgen-calendar create-event \
  --calendar-id cal_work_abc123 \
  --account-id acc_google_456 \
  --title "Meeting" \
  --start "..." --end "..."
```

### "Check my work calendar"

Use "work" group from memory.

## First-Time Setup Flow

1. **Check memory** for saved calendar IDs
2. If not found, run `morgen-calendar list-calendars`
3. Parse output and identify:
   - All calendars
   - Which is primary/default
   - Logical groupings
4. **Ask user if unclear:**
   - "Which calendar should be your default for new events?"
   - "How should I group these calendars?"
5. **Save to memory immediately**
6. Proceed with original command

## When to Refresh

Re-run `list-calendars` and update memory when:
- User mentions adding a new calendar
- A calendar ID returns an error
- User says calendars are wrong or missing
