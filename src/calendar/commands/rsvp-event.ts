import chalk from "chalk";
import { rsvpEvent } from "../morgen-client";

interface RsvpEventOptions {
  eventId: string;
  action: "accept" | "decline" | "tentatively-accept";
  seriesUpdateMode?: "all" | "future" | "single";
  comment?: string;
  notifyOrganizer?: boolean;
}

export async function rsvpEventCommand(options: RsvpEventOptions) {
  try {
    if (!options.eventId) {
      console.error(chalk.red("Error: --event-id is required"));
      process.exit(1);
    }

    if (!options.action) {
      console.error(chalk.red("Error: --action is required"));
      process.exit(1);
    }

    // Validate action
    const validActions = ["accept", "decline", "tentatively-accept"];
    if (!validActions.includes(options.action)) {
      console.error(
        chalk.red(`Error: --action must be one of: ${validActions.join(", ")}`),
      );
      process.exit(1);
    }

    // Map CLI action to API action
    const apiAction =
      options.action === "tentatively-accept"
        ? "tentativelyAccept"
        : options.action;

    const seriesUpdateMode = options.seriesUpdateMode || "single";
    const notifyOrganizer =
      options.notifyOrganizer !== undefined ? options.notifyOrganizer : true;

    await rsvpEvent(
      options.eventId,
      apiAction as "accept" | "decline" | "tentativelyAccept",
      seriesUpdateMode,
      options.comment,
      notifyOrganizer,
    );

    const actionDisplay =
      options.action === "tentatively-accept"
        ? "tentatively accepted"
        : `${options.action}ed`;

    console.log(chalk.green(`Event ${actionDisplay} successfully!`));
    console.log(chalk.bold(`\nEvent ID: ${options.eventId}`));
    console.log(`Action: ${chalk.cyan(apiAction)}`);
    if (options.comment) {
      console.log(`Comment: ${options.comment}`);
    }
    console.log(`Series Update Mode: ${seriesUpdateMode}`);
    console.log(`Notify Organizer: ${notifyOrganizer}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(chalk.red(`Error: ${error.message}`));
    } else {
      console.error(chalk.red("An unknown error occurred"));
    }
    process.exit(1);
  }
}
