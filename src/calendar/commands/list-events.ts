import chalk from "chalk";
import { getEvents } from "../morgen-client";

interface ListEventsOptions {
  calendarId: string;
  accountId: string;
  start?: string;
  end?: string;
}

export async function listEventsCommand(options: ListEventsOptions) {
  try {
    if (!options.calendarId) {
      console.error(chalk.red("Error: --calendar-id is required"));
      process.exit(1);
    }

    if (!options.accountId) {
      console.error(chalk.red("Error: --account-id is required"));
      process.exit(1);
    }

    // Default to current week if start/end not provided
    const now = new Date();
    const startDate =
      options.start ||
      new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 7,
      ).toISOString();
    const endDate =
      options.end ||
      new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 7,
      ).toISOString();

    console.log(
      chalk.blue(`\n=== EVENTS FOR CALENDAR: ${options.calendarId} ===\n`),
    );
    const events = await getEvents(
      options.calendarId,
      options.accountId,
      startDate,
      endDate,
    );

    if (events.length === 0) {
      console.log(chalk.yellow("No events found."));
      return;
    }

    for (const event of events) {
      console.log(chalk.bold(event.title));
      if (event.id) {
        console.log(`  ID: ${event.id}`);
      }
      console.log(`  Start: ${event.start}`);

      // Calculate end time and duration
      let endTime: string | undefined = event.end;
      let duration: string | undefined;

      // Check if duration exists in the event data (schema uses passthrough, so it should be preserved)
      if (
        "duration" in event &&
        typeof (event as Record<string, unknown>).duration === "string"
      ) {
        duration = (event as Record<string, unknown>).duration as string;

        // If end is not provided, calculate it from duration
        if (!endTime) {
          // Parse ISO 8601 duration (e.g., "PT1H", "PT30M", "PT1H30M")
          const durationMatch = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
          if (durationMatch) {
            const hours = parseInt(durationMatch[1] || "0", 10);
            const minutes = parseInt(durationMatch[2] || "0", 10);
            const startDate = new Date(event.start);
            const endDate = new Date(startDate);
            endDate.setHours(endDate.getHours() + hours);
            endDate.setMinutes(endDate.getMinutes() + minutes);
            endTime = endDate.toISOString();
          }
        }
      } else if (endTime) {
        // If duration is not provided but end is, calculate duration from start and end
        const startDate = new Date(event.start);
        const endDate = new Date(endTime);
        const durationMs = endDate.getTime() - startDate.getTime();
        const durationMinutes = Math.round(durationMs / 60000);

        if (durationMinutes > 0) {
          const hours = Math.floor(durationMinutes / 60);
          const minutes = durationMinutes % 60;
          const durationParts: string[] = [];
          if (hours > 0) {
            durationParts.push(`${hours}h`);
          }
          if (minutes > 0) {
            durationParts.push(`${minutes}m`);
          }
          if (durationParts.length > 0) {
            duration = durationParts.join(" ");
          }
        }
      }

      if (endTime) {
        console.log(`  End: ${endTime}`);
      }
      if (duration) {
        // Format duration nicely (if it's ISO 8601 format, parse it)
        if (duration.startsWith("PT")) {
          const durationMatch = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
          if (durationMatch) {
            const hours = parseInt(durationMatch[1] || "0", 10);
            const minutes = parseInt(durationMatch[2] || "0", 10);
            const durationParts: string[] = [];
            if (hours > 0) {
              durationParts.push(`${hours}h`);
            }
            if (minutes > 0) {
              durationParts.push(`${minutes}m`);
            }
            if (durationParts.length > 0) {
              duration = durationParts.join(" ");
            }
          }
        }
        console.log(`  Duration: ${duration}`);
      }

      if (event.description) {
        console.log(`  Description: ${event.description}`);
      }
      if (event.location) {
        console.log(`  Location: ${event.location}`);
      }
      if (event.allDay) {
        console.log(`  All Day: Yes`);
      }
      if (event.attendees && event.attendees.length > 0) {
        console.log(`  Attendees:`);
        for (const attendee of event.attendees) {
          const status = attendee.status || "needs-action";
          const statusColor =
            status === "accepted"
              ? chalk.green
              : status === "declined"
                ? chalk.red
                : status === "tentative"
                  ? chalk.yellow
                  : chalk.gray;
          console.log(
            `    - ${attendee.name || attendee.email} (${statusColor(status)})`,
          );
        }
      }
      // Check for participants in raw event data (Morgen API might return it differently)
      if (
        typeof event === "object" &&
        event !== null &&
        "participants" in event &&
        typeof (event as Record<string, unknown>).participants === "object"
      ) {
        const participants = (event as Record<string, unknown>)
          .participants as Record<string, unknown>;
        const participantEntries = Object.entries(participants);
        if (participantEntries.length > 0) {
          console.log(`  Participants:`);
          for (const [email, participantData] of participantEntries) {
            if (
              participantData &&
              typeof participantData === "object" &&
              "participationStatus" in participantData
            ) {
              const status = (
                participantData as { participationStatus: string }
              ).participationStatus;
              const statusColor =
                status === "accepted"
                  ? chalk.green
                  : status === "declined"
                    ? chalk.red
                    : status === "tentative"
                      ? chalk.yellow
                      : chalk.gray;
              const name =
                "name" in participantData &&
                typeof participantData.name === "string"
                  ? participantData.name
                  : email;
              console.log(`    - ${name} (${statusColor(status)})`);
            }
          }
        }
      }
      console.log();
    }

    console.log(chalk.gray(`Total: ${events.length} event(s)\n`));
  } catch (error) {
    if (error instanceof Error) {
      console.error(chalk.red(`Error: ${error.message}`));
    } else {
      console.error(chalk.red("An unknown error occurred"));
    }
    process.exit(1);
  }
}
