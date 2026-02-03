import chalk from "chalk";
import { createTask } from "../tasks-client";

interface CreateTaskOptions {
	title: string;
	description?: string;
	due?: string;
	timeZone?: string;
	priority?: string;
	parentId?: string;
}

export async function createTaskCommand(options: CreateTaskOptions) {
	try {
		if (!options.title) {
			console.error(chalk.red("Error: --title is required"));
			process.exit(1);
		}

		// Validate priority
		let priority: number | undefined;
		if (options.priority) {
			priority = parseInt(options.priority, 10);
			if (Number.isNaN(priority) || priority < 0 || priority > 9) {
				console.error(
					chalk.red("Error: --priority must be a number between 0 and 9"),
				);
				process.exit(1);
			}
		}

		const taskData: {
			title: string;
			description?: string;
			due?: string;
			timeZone?: string;
			priority?: number;
			relatedTo?: Record<string, unknown>;
		} = {
			title: options.title,
		};

		if (options.description) {
			taskData.description = options.description;
		}
		if (options.due) {
			taskData.due = options.due;
		}
		if (options.timeZone) {
			taskData.timeZone = options.timeZone;
		}
		if (priority !== undefined) {
			taskData.priority = priority;
		}
		if (options.parentId) {
			taskData.relatedTo = {
				[options.parentId]: {
					"@type": "Relation",
					relation: { parent: true },
				},
			};
		}

		const { id } = await createTask(taskData);

		console.log(chalk.green("Task created successfully!"));
		console.log(`Task ID: ${chalk.cyan(id)}`);
		console.log(`Title: ${chalk.bold(options.title)}`);
	} catch (error) {
		if (error instanceof Error) {
			console.error(chalk.red(`Error: ${error.message}`));
		} else {
			console.error(chalk.red("An unknown error occurred"));
		}
		process.exit(1);
	}
}
