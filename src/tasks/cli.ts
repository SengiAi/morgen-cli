#!/usr/bin/env node
import { Command } from "commander";
import { closeTaskCommand } from "./commands/close-task";
import { createTaskCommand } from "./commands/create-task";
import { deleteTaskCommand } from "./commands/delete-task";
import { getTaskCommand } from "./commands/get-task";
import { listTasksCommand } from "./commands/list-tasks";
import { moveTaskCommand } from "./commands/move-task";
import { reopenTaskCommand } from "./commands/reopen-task";
import { updateTaskCommand } from "./commands/update-task";
// Import env to validate and load environment variables
import "../env";

const program = new Command();

program
	.name("tasks")
	.description("CLI tool for Morgen task management")
	.version("1.0.0");

// List tasks command
program
	.command("list")
	.alias("ls")
	.description("List all tasks")
	.option("--limit <n>", "Maximum number of tasks to return (max 100)")
	.option(
		"--updated-after <date>",
		"Only return tasks updated/created after this ISO 8601 datetime",
	)
	.action((options) => {
		listTasksCommand(options);
	});

// Get task command
program
	.command("get")
	.description("Get a single task by ID")
	.requiredOption("--id <id>", "Task ID (required)")
	.action((options) => {
		getTaskCommand(options);
	});

// Create task command
program
	.command("create")
	.alias("new")
	.description("Create a new task")
	.requiredOption("--title <title>", "Task title (required)")
	.option("--description <text>", "Task description")
	.option(
		"--due <datetime>",
		'Due date in LocalDateTime format (YYYY-MM-DDTHH:mm:ss), e.g., "2025-03-15T17:00:00"',
	)
	.option(
		"--timezone <tz>",
		"IANA timezone for the due date (e.g., Europe/Stockholm)",
	)
	.option(
		"--priority <0-9>",
		"Priority: 0 (undefined), 1 (highest) to 9 (lowest)",
	)
	.option("--parent-id <id>", "Parent task ID (for creating subtasks)")
	.action((options) => {
		createTaskCommand(options);
	});

// Update task command
program
	.command("update")
	.description("Update an existing task")
	.requiredOption("--id <id>", "Task ID (required)")
	.option("--title <title>", "Updated task title")
	.option("--description <text>", "Updated task description")
	.option(
		"--due <datetime>",
		"Updated due date in LocalDateTime format (YYYY-MM-DDTHH:mm:ss)",
	)
	.option("--timezone <tz>", "Updated timezone")
	.option("--priority <0-9>", "Updated priority (0-9)")
	.action((options) => {
		updateTaskCommand(options);
	});

// Move task command
program
	.command("move")
	.description("Move a task within its list or change its parent")
	.requiredOption("--id <id>", "Task ID (required)")
	.option(
		"--previous-id <id>",
		'ID of the task this should appear after (use "null" for first position)',
	)
	.option(
		"--parent-id <id>",
		'ID of the parent task (use "null" for root level)',
	)
	.action((options) => {
		moveTaskCommand(options);
	});

// Delete task command
program
	.command("delete")
	.alias("rm")
	.description("Delete a task permanently")
	.requiredOption("--id <id>", "Task ID (required)")
	.action((options) => {
		deleteTaskCommand(options);
	});

// Close task command
program
	.command("close")
	.alias("done")
	.description("Mark a task as completed")
	.requiredOption("--id <id>", "Task ID (required)")
	.option(
		"--occurrence-start <datetime>",
		"For recurring tasks: ISO 8601 datetime of the specific occurrence to close",
	)
	.action((options) => {
		closeTaskCommand(options);
	});

// Reopen task command
program
	.command("reopen")
	.description("Mark a completed task as not completed")
	.requiredOption("--id <id>", "Task ID (required)")
	.option(
		"--occurrence-start <datetime>",
		"For recurring tasks: ISO 8601 datetime of the specific occurrence to reopen",
	)
	.action((options) => {
		reopenTaskCommand(options);
	});

program.parse();
