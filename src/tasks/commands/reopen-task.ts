import chalk from "chalk";
import { reopenTask } from "../tasks-client";

interface ReopenTaskOptions {
	id: string;
	occurrenceStart?: string;
}

export async function reopenTaskCommand(options: ReopenTaskOptions) {
	try {
		if (!options.id) {
			console.error(chalk.red("Error: --id is required"));
			process.exit(1);
		}

		await reopenTask(options.id, options.occurrenceStart);

		console.log(chalk.green("Task reopened successfully!"));
		console.log(`Task ID: ${chalk.cyan(options.id)}`);
		if (options.occurrenceStart) {
			console.log(`Occurrence: ${chalk.cyan(options.occurrenceStart)}`);
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
