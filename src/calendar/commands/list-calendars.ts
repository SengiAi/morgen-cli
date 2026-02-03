import chalk from "chalk";
import {
	type CachedCalendar,
	isCacheEnabled,
	writeCalendarCache,
} from "../calendar-cache";
import { getCalendars } from "../morgen-client";

interface ListCalendarsOptions {
	refreshCache?: boolean;
}

export async function listCalendarsCommand(options: ListCalendarsOptions = {}) {
	try {
		console.log(chalk.blue("\n=== MORGEN CALENDARS ===\n"));
		const calendars = await getCalendars();

		// Write to cache if caching is enabled
		if (isCacheEnabled()) {
			const cachedCalendars: CachedCalendar[] = calendars
				.filter((cal) => cal.accountId)
				.map((cal) => ({
					id: cal.id,
					accountId: cal.accountId as string,
					name: cal.name,
					provider: cal.provider,
				}));
			writeCalendarCache(cachedCalendars);
			if (options.refreshCache) {
				console.log(chalk.gray("Calendar cache refreshed.\n"));
			}
		}

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
