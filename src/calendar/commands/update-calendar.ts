import chalk from "chalk";
import { updateCalendarMetadata } from "../morgen-client";

interface UpdateCalendarOptions {
	calendarId: string;
	accountId: string;
	busy?: string;
	color?: string;
	name?: string;
}

export async function updateCalendarCommand(options: UpdateCalendarOptions) {
	try {
		if (!options.calendarId) {
			console.error(chalk.red("Error: --calendar-id is required"));
			process.exit(1);
		}

		if (!options.accountId) {
			console.error(chalk.red("Error: --account-id is required"));
			process.exit(1);
		}

		if (!options.busy && !options.color && !options.name) {
			console.error(
				chalk.yellow(
					"Warning: No fields to update. Please specify at least one of: --busy, --color, --name",
				),
			);
			process.exit(1);
		}

		const metadata: {
			busy?: boolean;
			overrideColor?: string;
			overrideName?: string;
		} = {};

		if (options.busy !== undefined) {
			metadata.busy = options.busy === "true";
		}
		if (options.color) {
			metadata.overrideColor = options.color;
		}
		if (options.name) {
			metadata.overrideName = options.name;
		}

		await updateCalendarMetadata(
			options.calendarId,
			options.accountId,
			metadata,
		);

		console.log(chalk.green("Calendar metadata updated successfully!"));
		console.log(`Calendar ID: ${chalk.cyan(options.calendarId)}`);
		if (metadata.busy !== undefined) {
			console.log(
				`Busy: ${metadata.busy ? chalk.green("Yes") : chalk.red("No")}`,
			);
		}
		if (metadata.overrideColor) {
			console.log(`Color: ${metadata.overrideColor}`);
		}
		if (metadata.overrideName) {
			console.log(`Name: ${metadata.overrideName}`);
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
