import chalk from "chalk";
import { listTasks } from "../tasks-client";

interface ListTasksOptions {
  limit?: string;
  updatedAfter?: string;
}

export async function listTasksCommand(options: ListTasksOptions) {
  try {
    const limit = options.limit ? parseInt(options.limit, 10) : 100;
    if (limit > 100) {
      console.warn(
        chalk.yellow("Warning: Limit exceeds maximum of 100. Using 100."),
      );
    }

    const {
      tasks,
      labelDefs: _labelDefs,
      spaces: _spaces,
    } = await listTasks(Math.min(limit, 100), options.updatedAfter);

    console.log(chalk.green(`Found ${tasks.length} task(s)\n`));

    for (const task of tasks as Array<{
      title: string;
      id?: string;
      due?: string;
      progress?: string;
      priority?: number;
    }>) {
      console.log(chalk.bold(`Title: ${task.title}`));
      if (task.id) {
        console.log(`ID: ${task.id}`);
      }
      if (task.due) {
        console.log(`Due: ${chalk.cyan(task.due)}`);
      }
      if (task.progress) {
        const status =
          task.progress === "completed"
            ? chalk.green("✓ Completed")
            : chalk.yellow("○ Pending");
        console.log(`Status: ${status}`);
      }
      if (task.priority !== undefined && task.priority !== 0) {
        console.log(`Priority: ${task.priority} (1=highest, 9=lowest)`);
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
