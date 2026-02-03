import axios, { type AxiosInstance } from "axios";
import { env } from "../env";
import { createRateLimitedClient, type RateLimitConfig } from "../ratelimit";
import type { MorgenCalendar, MorgenEvent } from "./schemas";
import { MorgenCalendarSchema, MorgenEventSchema } from "./schemas";

// Morgen API configuration
const MORGEN_API_BASE = "https://api.morgen.so/v3";
const MORGEN_SYNC_API_BASE = "https://sync.morgen.so/v1";

// Rate limit configuration
const RATE_LIMIT_CONFIG: RateLimitConfig = {
	maxRetries: 3,
	baseDelay: 1000,
	maxDelay: 60000,
	logWarnings: true,
};

// Cached axios instances with rate limiting
let morgenApiInstance: AxiosInstance | null = null;
let morgenSyncApiInstance: AxiosInstance | null = null;

// Helper to get the API key and validate it's present
function getApiKey(): string {
	const apiKey = env.MORGEN_API_KEY;
	if (!apiKey) {
		throw new Error(
			"Morgen API key not configured.\n\n" +
				"Set it up using one of these methods:\n" +
				"  1. Run: morgen-config set apiKey <your-api-key>\n" +
				"  2. Set the MORGEN_API_KEY environment variable\n\n" +
				"Get your API key from: https://platform.morgen.so/",
		);
	}
	return apiKey;
}

// Axios instance factory for Morgen API with rate limiting
function getMorgenApi(): AxiosInstance {
	if (morgenApiInstance) {
		return morgenApiInstance;
	}

	const apiKey = getApiKey();
	const instance = axios.create({
		baseURL: MORGEN_API_BASE,
		headers: {
			accept: "application/json",
			Authorization: `ApiKey ${apiKey}`,
			"Content-Type": "application/json",
		},
	});

	morgenApiInstance = createRateLimitedClient(instance, RATE_LIMIT_CONFIG);
	return morgenApiInstance;
}

// Axios instance factory for Morgen Sync API (RSVP endpoints) with rate limiting
function getMorgenSyncApi(): AxiosInstance {
	if (morgenSyncApiInstance) {
		return morgenSyncApiInstance;
	}

	const apiKey = getApiKey();
	const instance = axios.create({
		baseURL: MORGEN_SYNC_API_BASE,
		headers: {
			accept: "application/json",
			Authorization: `ApiKey ${apiKey}`,
			"Content-Type": "application/json",
		},
	});

	morgenSyncApiInstance = createRateLimitedClient(instance, RATE_LIMIT_CONFIG);
	return morgenSyncApiInstance;
}

/**
 * Make a request to the Morgen API
 * @param endpoint API endpoint
 * @param method HTTP method
 * @param data Request data
 * @param params Query parameters
 * @returns Promise resolving to the API response
 */
export async function makeMorgenRequest<T>(
	endpoint: string,
	method: "GET" | "POST" = "GET",
	data?: Record<string, unknown>,
	params?: Record<string, string>,
): Promise<T> {
	try {
		const response = await getMorgenApi().request({
			method,
			url: endpoint,
			data,
			params,
		});

		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			if (error.response.status === 429) {
				const retryAfter = error.response.headers["retry-after"];
				console.error(
					`Morgen API Rate Limited: Too many requests. ${retryAfter ? `Retry after ${retryAfter}s` : "Please wait before retrying."}`,
				);
			} else {
				console.error(
					`Morgen API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`,
				);
			}
		} else {
			console.error("Error making Morgen request:", error);
		}
		throw error;
	}
}

/**
 * Get all calendars
 * @returns Promise resolving to an array of calendars
 */
export async function getCalendars(): Promise<MorgenCalendar[]> {
	const response = await makeMorgenRequest<{ data: { calendars: unknown[] } }>(
		"/calendars/list",
	);

	// Validate each calendar with Zod schema
	return response.data.calendars.map((calendar) => {
		const result = MorgenCalendarSchema.safeParse(calendar);
		if (!result.success) {
			console.warn(
				`Invalid calendar data: ${JSON.stringify(result.error.format())}`,
			);
			throw new Error("Invalid calendar data received from Morgen API");
		}
		return result.data;
	});
}

/**
 * Get events for a specific calendar
 * @param calendarId Calendar ID
 * @param accountId Account ID
 * @param start Start date (ISO 8601 format)
 * @param end End date (ISO 8601 format)
 * @returns Promise resolving to an array of events
 */
export async function getEvents(
	calendarId: string,
	accountId: string,
	start: string,
	end: string,
): Promise<MorgenEvent[]> {
	const response = await makeMorgenRequest<{ data: { events: unknown[] } }>(
		"/events/list",
		"GET",
		undefined,
		{
			calendarIds: calendarId,
			accountId,
			start,
			end,
		},
	);

	// Validate each event with Zod schema
	return response.data.events.map((event) => {
		const result = MorgenEventSchema.safeParse(event);
		if (!result.success) {
			console.warn(
				`Invalid event data: ${JSON.stringify(result.error.format())}`,
			);
			throw new Error("Invalid event data received from Morgen API");
		}
		return result.data;
	});
}

/**
 * Create a new event
 * @param event Event data
 * @returns Promise resolving to the created event
 */
export async function createEvent(event: MorgenEvent): Promise<MorgenEvent> {
	// Convert end to ISO 8601 duration format
	let duration: string;
	if (event.end && event.start) {
		const start = new Date(event.start);
		const end = new Date(event.end);
		const durationMs = end.getTime() - start.getTime();
		const durationMinutes = Math.round(durationMs / 60000);

		if (durationMinutes < 60) {
			duration = `PT${durationMinutes}M`;
		} else {
			const hours = Math.floor(durationMinutes / 60);
			const minutes = durationMinutes % 60;
			if (minutes === 0) {
				duration = `PT${hours}H`;
			} else {
				duration = `PT${hours}H${minutes}M`;
			}
		}
	} else {
		// Default to 1 hour if no end time
		duration = "PT1H";
	}

	// Extract timezone - default to Stockholm unless UTC is explicitly indicated
	// Stockholm timezone handles DST automatically (CET in winter, CEST in summer)
	let timeZone: string | null = null;
	if (event.timezone) {
		// Use explicitly provided timezone
		timeZone = event.timezone;
	} else if (event.start.endsWith("Z")) {
		// Only if explicitly marked with Z, use UTC
		timeZone = "UTC";
	} else {
		// Default to Europe/Stockholm for all other cases
		// This ensures local Stockholm time is used by default
		timeZone = "Europe/Stockholm";
	}

	// Build payload with required timing fields
	const createPayload: Record<string, unknown> = {
		calendarId: event.calendarId,
		accountId: event.accountId,
		title: event.title,
		start: event.start.replace(/Z$/, "").replace(/[+-]\d{2}:\d{2}$/, ""), // Remove Z and timezone offset for start
		duration,
		timeZone: timeZone || null, // Can be null for floating events
		showWithoutTime: event.allDay || false,
	};

	if (event.description) {
		createPayload.description = event.description;
	}
	if (event.location) {
		createPayload.locations = {
			"1": {
				"@type": "Location",
				name: event.location,
			},
		};
	}

	// Add participants if provided
	if (event.attendees && event.attendees.length > 0) {
		const participants: Record<string, unknown> = {};
		for (const attendee of event.attendees) {
			participants[attendee.email] = {
				"@type": "Participant",
				name: attendee.name || attendee.email,
				email: attendee.email,
				roles: {
					attendee: true,
				},
				participationStatus: attendee.status || "needs-action",
			};
		}
		createPayload.participants = participants;
	}

	// Request Google Meet link if requested
	// According to the Morgen API docs, set "morgen.so:requestVirtualRoom" to "default"
	if (event["morgen.so:requestVirtualRoom"] === "default") {
		createPayload["morgen.so:requestVirtualRoom"] = "default";
	}

	const response = await makeMorgenRequest<{ data: { event: unknown } }>(
		"/events/create",
		"POST",
		createPayload,
	);

	// Validate the response with Zod schema
	const result = MorgenEventSchema.safeParse(response.data.event);
	if (!result.success) {
		console.warn(
			`Invalid event response: ${JSON.stringify(result.error.format())}`,
		);
		throw new Error("Invalid event data received from Morgen API");
	}

	return result.data;
}

/**
 * Update an existing event
 * @param eventId Event ID
 * @param calendarId Calendar ID
 * @param accountId Account ID
 * @param updates Partial event data to update
 * @param seriesUpdateMode How to update recurring events: "all", "future", or "single" (default)
 * @returns Promise resolving to the updated event
 */
export async function updateEvent(
	eventId: string,
	calendarId: string,
	accountId: string,
	updates: Partial<Omit<MorgenEvent, "id" | "calendarId" | "accountId">>,
	seriesUpdateMode: "all" | "future" | "single" = "single",
): Promise<MorgenEvent> {
	// Build the update payload
	const updatePayload: Record<string, unknown> = {
		id: eventId,
		calendarId,
		accountId,
	};

	// Convert end to duration if both start and end are provided
	if (
		updates.start &&
		typeof updates.start === "string" &&
		updates.end &&
		typeof updates.end === "string"
	) {
		const start = new Date(updates.start);
		const end = new Date(updates.end);
		const durationMs = end.getTime() - start.getTime();
		const durationMinutes = Math.round(durationMs / 60000);

		let duration: string;
		if (durationMinutes < 60) {
			duration = `PT${durationMinutes}M`;
		} else {
			const hours = Math.floor(durationMinutes / 60);
			const minutes = durationMinutes % 60;
			if (minutes === 0) {
				duration = `PT${hours}H`;
			} else {
				duration = `PT${hours}H${minutes}M`;
			}
		}

		updatePayload.start = updates.start
			.replace(/Z$/, "")
			.replace(/[+-]\d{2}:\d{2}$/, "");
		updatePayload.duration = duration;

		// Extract timezone - default to Stockholm unless UTC is explicitly indicated
		let timeZone: string | null = null;
		if (updates.timezone && typeof updates.timezone === "string") {
			timeZone = updates.timezone;
		} else if (updates.start.endsWith("Z")) {
			// Only if explicitly marked with Z, use UTC
			timeZone = "UTC";
		} else {
			// Default to Europe/Stockholm for all other cases
			timeZone = "Europe/Stockholm";
		}

		updatePayload.timeZone = timeZone || null;
		updatePayload.showWithoutTime = updates.allDay || false;
	} else if (updates.start && typeof updates.start === "string") {
		// If only start is provided, we still need duration, timeZone, and showWithoutTime
		updatePayload.start = updates.start
			.replace(/Z$/, "")
			.replace(/[+-]\d{2}:\d{2}$/, "");
		// Keep existing duration if not updating, or default to 1 hour
		updatePayload.duration = "PT1H";

		let timeZone: string | null = null;
		if (updates.timezone && typeof updates.timezone === "string") {
			timeZone = updates.timezone;
		} else if (updates.start.endsWith("Z")) {
			// Only if explicitly marked with Z, use UTC
			timeZone = "UTC";
		} else {
			// Default to Europe/Stockholm for all other cases
			timeZone = "Europe/Stockholm";
		}

		updatePayload.timeZone = timeZone || null;
		updatePayload.showWithoutTime = updates.allDay || false;
	}

	// Add other update fields (but not end)
	if (updates.title) {
		updatePayload.title = updates.title;
	}
	if (updates.description !== undefined) {
		updatePayload.description = updates.description;
	}
	if (updates.location !== undefined) {
		updatePayload.locations = {
			"1": {
				"@type": "Location",
				name: updates.location,
			},
		};
	}
	if (updates.allDay !== undefined && !updatePayload.showWithoutTime) {
		updatePayload.showWithoutTime = updates.allDay;
	}

	const response = await makeMorgenRequest<{ data?: { event?: unknown } }>(
		"/events/update",
		"POST",
		updatePayload,
		{ seriesUpdateMode },
	);

	// The update endpoint may return the event in different structures
	// Handle both { data: { event: ... } } and { data: ... }
	let eventData: unknown;
	if (
		response.data &&
		typeof response.data === "object" &&
		"event" in response.data
	) {
		eventData = (response.data as { event: unknown }).event;
	} else if (response.data) {
		eventData = response.data;
	} else {
		eventData = response;
	}

	// Validate the response with Zod schema
	const result = MorgenEventSchema.safeParse(eventData);
	if (!result.success) {
		console.warn(
			`Invalid event response: ${JSON.stringify(result.error.format())}`,
		);
		throw new Error("Invalid event data received from Morgen API");
	}

	return result.data;
}

/**
 * Delete an event
 * @param eventId Event ID
 * @param calendarId Calendar ID
 * @param accountId Account ID
 * @param seriesUpdateMode How to update recurring events: "all", "future", or "single" (default)
 * @returns Promise resolving when event is deleted
 */
export async function deleteEvent(
	eventId: string,
	calendarId: string,
	accountId: string,
	seriesUpdateMode: "all" | "future" | "single" = "single",
): Promise<void> {
	await makeMorgenRequest(
		"/events/delete",
		"POST",
		{
			id: eventId,
			calendarId,
			accountId,
		},
		{ seriesUpdateMode },
	);
}

/**
 * RSVP to an event (accept, decline, or tentatively accept)
 * @param eventId Event ID
 * @param action RSVP action: "accept", "decline", or "tentativelyAccept"
 * @param seriesUpdateMode How to update recurring events: "all", "future", or "single" (default)
 * @param comment Optional comment to send to the organizer
 * @param notifyOrganizer Whether to notify the organizer (default: true)
 * @returns Promise resolving when RSVP is processed
 */
export async function rsvpEvent(
	eventId: string,
	action: "accept" | "decline" | "tentativelyAccept",
	seriesUpdateMode: "all" | "future" | "single" = "single",
	comment?: string,
	notifyOrganizer: boolean = true,
): Promise<void> {
	try {
		const body: Record<string, unknown> = {
			id: eventId,
			notifyOrganizer,
		};

		if (comment) {
			body.comment = comment;
		}

		await getMorgenSyncApi().post(`/events/${action}`, body, {
			params: {
				seriesUpdateMode,
			},
		});
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			console.error(
				`Morgen Sync API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`,
			);
		} else {
			console.error("Error making RSVP request:", error);
		}
		throw error;
	}
}

// ============================================================================
// TASK API FUNCTIONS
// ============================================================================

/**
 * List tasks
 * @param limit Maximum number of tasks to return (max 100)
 * @param updatedAfter Only return tasks updated/created after this ISO 8601 datetime
 * @returns Promise resolving to an array of tasks
 */
export async function listTasks(
	limit: number = 100,
	updatedAfter?: string,
): Promise<{ tasks: unknown[]; labelDefs: unknown[]; spaces: unknown[] }> {
	const params: Record<string, string> = { limit: String(limit) };
	if (updatedAfter) {
		params.updatedAfter = updatedAfter;
	}

	const response = await makeMorgenRequest<{
		data: { tasks: unknown[]; labelDefs?: unknown[]; spaces?: unknown[] };
	}>("/tasks/list", "GET", undefined, params);

	return {
		tasks: response.data.tasks,
		labelDefs: response.data.labelDefs || [],
		spaces: response.data.spaces || [],
	};
}

/**
 * Get a single task by its ID
 * @param taskId The Morgen ID of the task to retrieve
 * @returns Promise resolving to the task
 */
export async function getTask(
	taskId: string,
): Promise<{ task: unknown; labelDefs: unknown[] }> {
	const response = await makeMorgenRequest<{
		data: { task: unknown; labelDefs?: unknown[] };
	}>("/tasks", "GET", undefined, { id: taskId });

	return {
		task: response.data.task,
		labelDefs: response.data.labelDefs || [],
	};
}

/**
 * Create a new task
 * @param taskData Task creation data
 * @returns Promise resolving to the created task ID
 */
export async function createTask(taskData: {
	title: string;
	description?: string;
	descriptionContentType?: "text/plain" | "text/html";
	due?: string;
	timeZone?: string;
	estimatedDuration?: string;
	taskListId?: string;
	priority?: number;
	progress?: "needs-action" | "completed";
	relatedTo?: Record<string, unknown>;
}): Promise<{ id: string }> {
	const response = await makeMorgenRequest<{ data: { id: string } }>(
		"/tasks/create",
		"POST",
		taskData,
	);

	return { id: response.data.id };
}

/**
 * Update an existing task
 * @param taskId The Morgen ID of the task to update
 * @param updates Partial task data to update
 * @returns Promise resolving when task is updated (HTTP 204)
 */
export async function updateTask(
	taskId: string,
	updates: {
		title?: string;
		description?: string;
		due?: string;
		timeZone?: string;
		taskListId?: string;
		priority?: number;
		progress?: string;
		labels?: unknown[];
	},
): Promise<void> {
	await makeMorgenRequest("/tasks/update", "POST", { id: taskId, ...updates });
}

/**
 * Move a task within its list or change its parent
 * @param taskId The Morgen ID of the task to move
 * @param previousId ID of the task this should appear after (use null for first position)
 * @param parentId ID of the parent task (use null for root level)
 * @returns Promise resolving when task is moved (HTTP 204)
 */
export async function moveTask(
	taskId: string,
	previousId: string | null = null,
	parentId: string | null = null,
): Promise<void> {
	const body: Record<string, unknown> = { id: taskId };
	if (previousId !== null) {
		body.previousId = previousId;
	}
	if (parentId !== null) {
		body.parentId = parentId;
	}

	await makeMorgenRequest("/tasks/move", "POST", body);
}

/**
 * Delete a task permanently
 * @param taskId The Morgen ID of the task to delete
 * @returns Promise resolving when task is deleted (HTTP 204)
 */
export async function deleteTask(taskId: string): Promise<void> {
	await makeMorgenRequest("/tasks/delete", "POST", { id: taskId });
}

/**
 * Close (mark as completed) a task
 * @param taskId The Morgen ID of the task to close
 * @param occurrenceStart For recurring tasks: ISO 8601 datetime of the specific occurrence to close
 * @returns Promise resolving when task is closed (HTTP 204)
 */
export async function closeTask(
	taskId: string,
	occurrenceStart?: string,
): Promise<void> {
	const body: Record<string, unknown> = { id: taskId };
	if (occurrenceStart) {
		body.occurrenceStart = occurrenceStart;
	}

	await makeMorgenRequest("/tasks/close", "POST", body);
}

/**
 * Reopen (mark as not completed) a task
 * @param taskId The Morgen ID of the task to reopen
 * @param occurrenceStart For recurring tasks: ISO 8601 datetime of the specific occurrence to reopen
 * @returns Promise resolving when task is reopened (HTTP 204)
 */
export async function reopenTask(
	taskId: string,
	occurrenceStart?: string,
): Promise<void> {
	const body: Record<string, unknown> = { id: taskId };
	if (occurrenceStart) {
		body.occurrenceStart = occurrenceStart;
	}

	await makeMorgenRequest("/tasks/reopen", "POST", body);
}

// ============================================================================
// INTEGRATION API FUNCTIONS
// ============================================================================

/**
 * List connected accounts
 * @returns Promise resolving to an array of connected accounts
 */
export async function listAccounts(): Promise<unknown[]> {
	const response = await makeMorgenRequest<{ data: { accounts: unknown[] } }>(
		"/integrations/accounts/list",
	);

	return response.data.accounts;
}

/**
 * List available integration providers
 * @returns Promise resolving to the list of available providers
 */
export async function listProviders(): Promise<{
	integrations: unknown[];
	groups: unknown[];
}> {
	const response = await makeMorgenRequest<{
		data: { integrations: unknown[]; groups: unknown[] };
	}>("/integrations/list");

	return {
		integrations: response.data.integrations,
		groups: response.data.groups,
	};
}

// ============================================================================
// CALENDAR METADATA FUNCTIONS
// ============================================================================

/**
 * Update calendar metadata (Morgen-specific fields only)
 * @param calendarId The ID of the calendar to update
 * @param accountId The ID of the account the calendar belongs to
 * @param metadata Metadata fields to update (busy, overrideColor, overrideName)
 * @returns Promise resolving when calendar is updated
 */
export async function updateCalendarMetadata(
	calendarId: string,
	accountId: string,
	metadata: {
		busy?: boolean;
		overrideColor?: string;
		overrideName?: string;
	},
): Promise<void> {
	await makeMorgenRequest("/calendars/update", "POST", {
		id: calendarId,
		accountId,
		"morgen.so:metadata": metadata,
	});
}
