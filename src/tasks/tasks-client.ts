// Re-export all task-related functions from the calendar client
// This keeps the task commands separate but uses the same API client
export {
	closeTask,
	createTask,
	deleteTask,
	getTask,
	listTasks,
	moveTask,
	reopenTask,
	updateTask,
} from "../calendar/morgen-client";
