import chalk from "chalk";
import { updateTask } from "../tasks-client";

interface UpdateTaskOptions {
  id: string;
  title?: string;
  description?: string;
  due?: string;
  timeZone?: string;
  priority?: string;
}

export async function updateTaskCommand(options: UpdateTaskOptions) {
  try {
    if (!options.id) {
      console.error(chalk.red("Error: --id is required"));
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

    const updates: {
      title?: string;
      description?: string;
      due?: string;
      timeZone?: string;
      priority?: number;
    } = {};

    if (options.title) updates.title = options.title;
    if (options.description !== undefined)
      updates.description = options.description;
    if (options.due) updates.due = options.due;
    if (options.timeZone) updates.timeZone = options.timeZone;
    if (priority !== undefined) updates.priority = priority;

    if (Object.keys(updates).length === 0) {
      console.error(
        chalk.yellow(
          "Warning: No fields to update. Please specify at least one field to update.",
        ),
      );
      process.exit(1);
    }

    await updateTask(options.id, updates);

    console.log(chalk.green("Task updated successfully!"));
    console.log(`Task ID: ${chalk.cyan(options.id)}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(chalk.red(`Error: ${error.message}`));
    } else {
      console.error(chalk.red("An unknown error occurred"));
    }
    process.exit(1);
  }
}
