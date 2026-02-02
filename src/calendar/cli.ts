#!/usr/bin/env node
import { Command } from "commander";
import { createEventCommand } from "./commands/create-event";
import { deleteEventCommand } from "./commands/delete-event";
import { listAccountsCommand } from "./commands/list-accounts";
import { listCalendarsCommand } from "./commands/list-calendars";
import { listEventsCommand } from "./commands/list-events";
import { listProvidersCommand } from "./commands/list-providers";
import { rsvpEventCommand } from "./commands/rsvp-event";
import { updateCalendarCommand } from "./commands/update-calendar";
import { updateEventCommand } from "./commands/update-event";
// Import env to validate and load environment variables
import "../env";

const program = new Command();

program
  .name("calendar")
  .description("CLI tool for Morgen calendar management")
  .version("1.0.0");

// List calendars command
program
  .command("list-calendars")
  .alias("lc")
  .description("List all available calendars")
  .action(() => {
    listCalendarsCommand();
  });

// List events command
program
  .command("list-events")
  .alias("le")
  .description("List events in a calendar")
  .requiredOption("--calendar-id <id>", "Calendar ID (required)")
  .requiredOption("--account-id <id>", "Account ID (required)")
  .option(
    "--start <date>",
    "Start date (ISO 8601 format, defaults to 7 days ago)",
  )
  .option(
    "--end <date>",
    "End date (ISO 8601 format, defaults to 7 days from now)",
  )
  .option(
    "--timezone <tz>",
    "Timezone for displaying times (IANA format, e.g., Europe/Stockholm). Defaults to Europe/Stockholm",
  )
  .action((options) => {
    listEventsCommand(options);
  });

// Create event command
program
  .command("create-event")
  .alias("ce")
  .description("Create a new event")
  .requiredOption("--calendar-id <id>", "Calendar ID (required)")
  .requiredOption("--account-id <id>", "Account ID (required)")
  .requiredOption("--title <title>", "Event title (required)")
  .requiredOption(
    "--start <datetime>",
    "Start time in ISO 8601 format, e.g., 2025-11-10T10:00:00Z (required)",
  )
  .requiredOption(
    "--end <datetime>",
    "End time in ISO 8601 format, e.g., 2025-11-10T11:00:00Z (required)",
  )
  .option("--description <text>", "Event description")
  .option("--location <location>", "Event location")
  .option("--all-day", "Mark event as all-day")
  .option(
    "--participants <emails>",
    "Comma-separated list of participant emails",
  )
  .option("--google-meet", "Request Google Meet link for the event")
  .option(
    "--timezone <tz>",
    "Timezone (IANA format, e.g., Europe/Stockholm). Defaults to Europe/Stockholm (uses UTC only if start ends with Z)",
  )
  .action((options) => {
    createEventCommand({
      ...options,
      allDay: options.allDay === true,
      googleMeet: options.googleMeet === true,
    });
  });

// Update event command
program
  .command("update-event")
  .alias("ue")
  .description("Update an existing event")
  .requiredOption("--event-id <id>", "Event ID (required)")
  .requiredOption("--calendar-id <id>", "Calendar ID (required)")
  .requiredOption("--account-id <id>", "Account ID (required)")
  .option("--title <title>", "Event title")
  .option(
    "--start <datetime>",
    "Start time in ISO 8601 format, e.g., 2025-11-10T10:00:00Z",
  )
  .option(
    "--end <datetime>",
    "End time in ISO 8601 format, e.g., 2025-11-10T11:00:00Z",
  )
  .option("--description <text>", "Event description")
  .option("--location <location>", "Event location")
  .option("--all-day", "Mark event as all-day")
  .option(
    "--series-update-mode <mode>",
    'How to update recurring events: "all", "future", or "single" (default: single)',
  )
  .action((options) => {
    updateEventCommand(options);
  });

// Delete event command
program
  .command("delete-event")
  .alias("de")
  .description("Delete an event")
  .requiredOption("--event-id <id>", "Event ID (required)")
  .requiredOption("--calendar-id <id>", "Calendar ID (required)")
  .requiredOption("--account-id <id>", "Account ID (required)")
  .option(
    "--series-update-mode <mode>",
    'How to update recurring events: "all", "future", or "single" (default: single)',
  )
  .action((options) => {
    deleteEventCommand(options);
  });

// RSVP to event command
program
  .command("rsvp-event")
  .alias("rsvp")
  .description("RSVP to an event (accept, decline, or tentatively accept)")
  .requiredOption("--event-id <id>", "Event ID (required)")
  .requiredOption(
    "--action <action>",
    'RSVP action: "accept", "decline", or "tentatively-accept" (required)',
  )
  .option(
    "--series-update-mode <mode>",
    'How to update recurring events: "all", "future", or "single" (default: single)',
  )
  .option("--comment <text>", "Optional comment to send to the organizer")
  .option(
    "--notify-organizer <true|false>",
    "Whether to notify the organizer (default: true)",
  )
  .action((options) => {
    rsvpEventCommand({
      eventId: options.eventId,
      action: options.action,
      seriesUpdateMode: options.seriesUpdateMode,
      comment: options.comment,
      notifyOrganizer:
        options.notifyOrganizer === "false"
          ? false
          : options.notifyOrganizer === "true"
            ? true
            : undefined,
    });
  });

// List accounts command
program
  .command("list-accounts")
  .alias("la")
  .description("List all connected accounts")
  .option("--json", "Output in JSON format")
  .action((options) => {
    listAccountsCommand(options);
  });

// List providers command
program
  .command("list-providers")
  .alias("lp")
  .description("List available integration providers")
  .option("--json", "Output in JSON format")
  .action((options) => {
    listProvidersCommand(options);
  });

// Update calendar command
program
  .command("update-calendar")
  .alias("uc")
  .description("Update calendar metadata (Morgen-specific fields)")
  .requiredOption("--calendar-id <id>", "Calendar ID (required)")
  .requiredOption("--account-id <id>", "Account ID (required)")
  .option("--busy <true|false>", "Whether the calendar affects availability")
  .option("--color <hex>", "Custom color override (hex format)")
  .option("--name <name>", "Custom name override")
  .action((options) => {
    updateCalendarCommand(options);
  });

program.parse();
