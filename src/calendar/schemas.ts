import { z } from "zod";

// Schema for Morgen Calendar
export const MorgenCalendarSchema = z.object({
	id: z.string(),
	name: z.string(),
	accountId: z.string().optional(),
	provider: z.string().optional(),
	color: z.string().optional(),
	readOnly: z.boolean().optional(),
});

export type MorgenCalendar = z.infer<typeof MorgenCalendarSchema>;

// Schema for Morgen Event (flexible for both API responses and requests)
export const MorgenEventSchema = z
	.object({
		id: z.string().optional(),
		calendarId: z.string().optional(),
		accountId: z.string().optional(),
		title: z.string(),
		start: z.string(), // ISO 8601 format
		end: z.string().optional(), // ISO 8601 format - optional for some responses
		description: z.string().optional(),
		location: z.string().optional(),
		timezone: z.string().optional(),
		allDay: z.boolean().optional(),
		status: z.string().optional(),
		recurrence: z.record(z.any()).optional(),
		attendees: z
			.array(
				z.object({
					email: z.string(),
					name: z.string().optional(),
					status: z.string().optional(),
				}),
			)
			.optional(),
		// Allow additional fields that might be in API responses
	})
	.passthrough();

export type MorgenEvent = z.infer<typeof MorgenEventSchema>;

// Schema for Morgen API calendar list response
export const MorgenCalendarsListResponseSchema = z.object({
	data: z.object({
		calendars: z.array(z.unknown()),
	}),
});

// Schema for Morgen API events list response
export const MorgenEventsListResponseSchema = z.object({
	data: z.object({
		events: z.array(z.unknown()),
	}),
});

// Schema for Morgen API event response
export const MorgenEventResponseSchema = z.object({
	data: z.object({
		event: z.unknown(),
	}),
});

// Schema for Morgen Task
export const MorgenTaskSchema = z
	.object({
		"@type": z.string().optional(),
		id: z.string().optional(),
		accountId: z.string().optional(),
		integrationId: z.string().optional(),
		taskListId: z.string().optional(),
		created: z.string().optional(),
		updated: z.string().optional(),
		title: z.string(),
		description: z.string().optional(),
		descriptionContentType: z.string().optional(),
		due: z.string().optional(),
		timeZone: z.string().optional(),
		estimatedDuration: z.string().optional(),
		priority: z.number().optional(),
		progress: z.string().optional(),
		position: z.number().optional(),
		relatedTo: z.record(z.any()).optional(),
		"morgen.so:derived": z.record(z.any()).optional(),
	})
	.passthrough();

export type MorgenTask = z.infer<typeof MorgenTaskSchema>;
