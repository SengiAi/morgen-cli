import chalk from "chalk";
import { getCalendars } from "../morgen-client";

export async function listCalendarsCommand() {
  try {
    console.log(chalk.blue("\n=== MORGEN CALENDARS ===\n"));
    const calendars = await getCalendars();

    if (calendars.length === 0) {
      console.log(chalk.yellow("No calendars found."));
      return;
    }

    for (const calendar of calendars) {
      console.log(chalk.bold(calendar.name));
      console.log(`  ID: ${calendar.id}`);
      if (calendar.accountId) {
        console.log(`  Account ID: ${calendar.accountId}`);
      }
      if (calendar.provider) {
        console.log(`  Provider: ${calendar.provider}`);
      }
      if (calendar.color) {
        console.log(`  Color: ${calendar.color}`);
      }
      console.log();
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
