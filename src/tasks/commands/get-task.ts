import chalk from "chalk";
import { getTask } from "../tasks-client";

interface GetTaskOptions {
  id: string;
}

export async function getTaskCommand(options: GetTaskOptions) {
  try {
    if (!options.id) {
      console.error(chalk.red("Error: --id is required"));
      process.exit(1);
    }

    const { task } = await getTask(options.id);

    const taskData = task as {
      title?: string;
      id?: string;
      due?: string;
      progress?: string;
      priority?: number;
      description?: string;
      timeZone?: string;
      estimatedDuration?: string;
      taskListId?: string;
    };

    console.log(chalk.green("Task details:\n"));
    console.log(chalk.bold(`Title: ${taskData.title || "N/A"}`));
    if (taskData.id) {
      console.log(`ID: ${taskData.id}`);
    }
    if (taskData.description) {
      console.log(`Description: ${taskData.description}`);
    }
    if (taskData.due) {
      console.log(
        `Due: ${chalk.cyan(taskData.due)} ${taskData.timeZone ? `(${taskData.timeZone})` : ""}`,
      );
    }
    if (taskData.estimatedDuration) {
      console.log(`Estimated Duration: ${taskData.estimatedDuration}`);
    }
    if (taskData.progress) {
      const status =
        taskData.progress === "completed"
          ? chalk.green("✓ Completed")
          : chalk.yellow("○ Pending");
      console.log(`Status: ${status}`);
    }
    if (taskData.priority !== undefined && taskData.priority !== 0) {
      console.log(`Priority: ${taskData.priority} (1=highest, 9=lowest)`);
    }
    if (taskData.taskListId) {
      console.log(`Task List ID: ${taskData.taskListId}`);
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
