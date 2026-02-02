import chalk from "chalk";
import { deleteTask } from "../tasks-client";

interface DeleteTaskOptions {
  id: string;
}

export async function deleteTaskCommand(options: DeleteTaskOptions) {
  try {
    if (!options.id) {
      console.error(chalk.red("Error: --id is required"));
      process.exit(1);
    }

    await deleteTask(options.id);

    console.log(chalk.green("Task deleted successfully!"));
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
