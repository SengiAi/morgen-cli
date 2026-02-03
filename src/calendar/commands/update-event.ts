import chalk from "chalk";
import { invalidateCache } from "../calendar-cache";
import { updateEvent } from "../morgen-client";
import type { MorgenEvent } from "../schemas";

interface UpdateEventOptions {
	eventId: string;
	calendarId: string;
	accountId: string;
	title?: string;
	start?: string;
	end?: string;
	description?: string;
	location?: string;
	allDay?: boolean;
	seriesUpdateMode?: "all" | "future" | "single";
}

export async function updateEventCommand(options: UpdateEventOptions) {
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

		// Build update data with only provided fields
		const updateData: Partial<
			Omit<MorgenEvent, "id" | "calendarId" | "accountId">
		> = {};

		if (options.title) updateData.title = options.title;
		if (options.start) updateData.start = options.start;
		if (options.end) updateData.end = options.end;
		if (options.description !== undefined)
			updateData.description = options.description;
		if (options.location !== undefined) updateData.location = options.location;
		if (options.allDay !== undefined) updateData.allDay = options.allDay;

		if (Object.keys(updateData).length === 0) {
			console.error(
				chalk.yellow(
					"Warning: No fields to update. Please specify at least one field to update.",
				),
			);
			process.exit(1);
		}

		const seriesUpdateMode = options.seriesUpdateMode || "single";

		const updatedEvent = await updateEvent(
			options.eventId,
			options.calendarId,
			options.accountId,
			updateData,
			seriesUpdateMode,
		);

		// Invalidate calendar cache after successful event update
		invalidateCache();

		console.log(chalk.green("Event updated successfully!"));
		console.log(chalk.bold(`\nTitle: ${updatedEvent.title}`));
		if (updatedEvent.id) {
			console.log(`ID: ${updatedEvent.id}`);
		}
		console.log(`Start: ${updatedEvent.start}`);
		console.log(`End: ${updatedEvent.end}`);
	} catch (error) {
		if (error instanceof Error) {
			console.error(chalk.red(`Error: ${error.message}`));
		} else {
			console.error(chalk.red("An unknown error occurred"));
		}
		process.exit(1);
	}
}
