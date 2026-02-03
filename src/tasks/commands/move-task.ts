import chalk from "chalk";
import { moveTask } from "../tasks-client";

interface MoveTaskOptions {
	id: string;
	previousId?: string;
	parentId?: string;
}

export async function moveTaskCommand(options: MoveTaskOptions) {
	try {
		if (!options.id) {
			console.error(chalk.red("Error: --id is required"));
			process.exit(1);
		}

		const previousId =
			options.previousId === "null" ? null : options.previousId || null;
		const parentId =
			options.parentId === "null" ? null : options.parentId || null;

		await moveTask(options.id, previousId, parentId);

		console.log(chalk.green("Task moved successfully!"));
		console.log(`Task ID: ${chalk.cyan(options.id)}`);
		if (previousId !== null) {
			console.log(`Moved after task: ${chalk.cyan(previousId)}`);
		} else {
			console.log("Moved to first position");
		}
		if (parentId !== null) {
			console.log(`New parent: ${chalk.cyan(parentId)}`);
		} else {
			console.log("Moved to root level");
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
