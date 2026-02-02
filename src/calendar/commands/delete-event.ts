import chalk from "chalk";
import { deleteEvent } from "../morgen-client";

interface DeleteEventOptions {
  eventId: string;
  calendarId: string;
  accountId: string;
  seriesUpdateMode?: "all" | "future" | "single";
}

export async function deleteEventCommand(options: DeleteEventOptions) {
  try {
    if (!options.eventId) {
      console.error(chalk.red("Error: --event-id is required"));
      process.exit(1);
    }

    if (!options.calendarId) {
      console.error(chalk.red("Error: --calendar-id is required"));
      process.exit(1);
    }

    if (!options.accountId) {
      console.error(chalk.red("Error: --account-id is required"));
      process.exit(1);
    }

    const seriesUpdateMode = options.seriesUpdateMode || "single";

    await deleteEvent(
      options.eventId,
      options.calendarId,
      options.accountId,
      seriesUpdateMode,
    );

    console.log(chalk.green("Event deleted successfully!"));
    console.log(`Event ID: ${options.eventId}`);
    if (seriesUpdateMode !== "single") {
      console.log(`Series Update Mode: ${chalk.cyan(seriesUpdateMode)}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(chalk.red(`Error: ${error.message}`));
    } else {
      console.error(chalk.red("An unknown error occurred"));
    }
    process.exit(1);
  }
}
