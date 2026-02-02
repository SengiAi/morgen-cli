import chalk from "chalk";
import { createEvent } from "../morgen-client";
import type { MorgenEvent } from "../schemas";

interface CreateEventOptions {
  calendarId: string;
  accountId: string;
  title: string;
  start: string;
  end: string;
  description?: string;
  location?: string;
  allDay?: boolean;
  participants?: string;
  googleMeet?: boolean;
  timezone?: string;
}

export async function createEventCommand(options: CreateEventOptions) {
  try {
    if (!options.calendarId) {
      console.error(chalk.red("Error: --calendar-id is required"));
      process.exit(1);
    }

    if (!options.accountId) {
      console.error(chalk.red("Error: --account-id is required"));
      process.exit(1);
    }

    if (!options.title) {
      console.error(chalk.red("Error: --title is required"));
      process.exit(1);
    }

    if (!options.start) {
      console.error(chalk.red("Error: --start is required (ISO 8601 format)"));
      process.exit(1);
    }

    if (!options.end) {
      console.error(chalk.red("Error: --end is required (ISO 8601 format)"));
      process.exit(1);
    }

    const event: MorgenEvent & { "morgen.so:requestVirtualRoom"?: string } = {
      calendarId: options.calendarId,
      accountId: options.accountId,
      title: options.title,
      start: options.start,
      end: options.end,
      description: options.description,
      location: options.location,
      allDay: options.allDay,
      timezone: options.timezone,
    };

    // Add participants if provided
    if (options.participants) {
      const participantEmails = options.participants
        .split(",")
        .map((e) => e.trim());
      event.attendees = participantEmails.map((email) => ({
        email,
      }));
    }

    // Request Google Meet if enabled
    if (options.googleMeet) {
      event["morgen.so:requestVirtualRoom"] = "default";
    }

    const createdEvent = await createEvent(event);

    console.log(chalk.green("Event created successfully!"));
    console.log(chalk.bold(`\nTitle: ${createdEvent.title}`));
    if (createdEvent.id) {
      console.log(`ID: ${createdEvent.id}`);
    }
    console.log(`Start: ${createdEvent.start}`);
    console.log(`End: ${createdEvent.end}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(chalk.red(`Error: ${error.message}`));
    } else {
      console.error(chalk.red("An unknown error occurred"));
    }
    process.exit(1);
  }
}
