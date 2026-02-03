# Installation & Setup

## Step 1: Install the CLI

```bash
npm install -g morgen-cli
```

Or with pnpm:
```bash
pnpm add -g morgen-cli
```

This installs three tools: `morgen-calendar`, `morgen-tasks`, `morgen-config`.

**Verify installation:**
```bash
which morgen-calendar
morgen-calendar --version
```

## Step 2: Get Your API Key

1. Go to https://platform.morgen.so/
2. Sign in with your Morgen account
3. Generate an API key
4. Copy the key for the next step

## Step 3: Configure the API Key

**Recommended method:**
```bash
morgen-config set apiKey YOUR_API_KEY_HERE
```

**Alternative - environment variable:**
```bash
export MORGEN_API_KEY=YOUR_API_KEY_HERE
```

## Step 4: Verify Setup

```bash
morgen-config status
```

Expected output:
```
API Key:           Set
Default Account:   Not set
Default Calendar:  Not set
Default Timezone:  Not set
Config File:       ~/.morgen-cli/config.json (exists)
```

## Step 5: Test Connection

```bash
morgen-calendar list-calendars
```

If you see your calendars, setup is complete.

## Optional: Set Defaults

```bash
morgen-config set defaults.calendarId YOUR_PRIMARY_CALENDAR_ID
morgen-config set defaults.accountId YOUR_ACCOUNT_ID
morgen-config set defaults.timezone America/New_York
```

## Configuration File

**Location:** `~/.morgen-cli/config.json`

```json
{
  "apiKey": "your-api-key",
  "defaults": {
    "accountId": "optional-default-account",
    "calendarId": "optional-default-calendar",
    "timezone": "Europe/Stockholm"
  }
}
```

## Config Commands

```bash
morgen-config list          # View all config
morgen-config get apiKey    # Get specific value
morgen-config set key value # Set value
morgen-config path          # Show config file path
morgen-config edit          # Open in editor
morgen-config status        # Show summary
```

## Troubleshooting

### Command not found

Ensure npm global bin is in PATH:
```bash
export PATH="$(npm config get prefix)/bin:$PATH"
```

### 401 Unauthorized

API key is invalid. Generate a new one at https://platform.morgen.so/

### No calendars found

Connect calendar accounts in the Morgen app first, then retry.

### 429 Rate Limited

The CLI automatically retries with exponential backoff. If you see repeated rate limit errors:
- Wait a few minutes before retrying
- Use `updatedAfter` filters when syncing tasks to reduce API calls
- Cache calendar/account IDs to avoid repeated `list-calendars` calls

**Rate limits:** 100 points per 15 minutes. List endpoints cost 10 points, others cost 1 point.
