import chalk from "chalk";
import { getOrFetchCalendarsGroupedByAccount } from "../calendar-cache";
import { readConfig } from "../../config";
import { getEvents } from "../morgen-client";
import type { MorgenEvent } from "../schemas";

interface ListEventsOptions {
	calendarId?: string;
	accountId?: string;
	all?: boolean;
	refreshCache?: boolean;
	start?: string;
	end?: string;
	timezone?: string;
}

/**
 * Event with calendar name for display in --all mode
 */
interface EventWithCalendar extends MorgenEvent {
	calendarName: string;
}

/**
 * Get the effective timezone to use for display
 * Priority: CLI option > config default > system timezone
 */
function getEffectiveTimezone(optionTimezone?: string): string {
	if (optionTimezone) {
		return optionTimezone;
	}

	const config = readConfig();
	if (config.defaults?.timezone) {
		return config.defaults.timezone;
	}

	// Fall back to system timezone
	return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Convert an ISO 8601 timestamp to a specific timezone and format for display
 *
 * IMPORTANT: Morgen API returns times in the event's local timezone, but may include
 * a misleading "Z" suffix. The actual time value represents local time, not UTC.
 * We strip any timezone suffix and interpret the time in the event's timezone.
 *
 * @param isoString ISO 8601 timestamp (time value is in event's local timezone)
 * @param targetTimezone IANA timezone identifier to display in (e.g., "Europe/Stockholm")
 * @param eventTimezone The event's timezone from API (e.g., "Europe/Stockholm")
 * @returns Formatted date string in the target timezone
 */
function formatDateTimeInTimezone(
	isoString: string,
	targetTimezone: string,
	eventTimezone?: string,
): string {
	try {
		// Strip any timezone suffix (Z or +HH:MM) - Morgen API times are local, not UTC
		const bareTime = isoString.replace(/Z$|[+-]\d{2}:\d{2}$/, "");

		// Extract date/time components
		const match = bareTime.match(
			/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/,
		);
		if (!match) {
			return isoString;
		}

		const [, year, month, day, hour, minute, second = "00"] = match;

		// Determine the source timezone (event's timezone or fall back to target)
		const sourceTimezone = eventTimezone || targetTimezone;

		// If source and target timezones are the same, just format the time directly
		if (sourceTimezone === targetTimezone) {
			return `${year}-${month}-${day} ${hour}:${minute}`;
		}

		// Need to convert between timezones
		// Step 1: Get the UTC offset for the source timezone at this date/time
		const sourceOffset = getTimezoneOffsetMinutes(
			Number.parseInt(year, 10),
			Number.parseInt(month, 10) - 1,
			Number.parseInt(day, 10),
			Number.parseInt(hour, 10),
			Number.parseInt(minute, 10),
			sourceTimezone,
		);

		// Step 2: Calculate the UTC timestamp
		// Local time = UTC + offset, so UTC = Local time - offset
		const localMs = Date.UTC(
			Number.parseInt(year, 10),
			Number.parseInt(month, 10) - 1,
			Number.parseInt(day, 10),
			Number.parseInt(hour, 10),
			Number.parseInt(minute, 10),
			Number.parseInt(second, 10),
		);
		const utcMs = localMs - sourceOffset * 60000;

		// Step 3: Format in the target timezone
		const date = new Date(utcMs);
		const formatter = new Intl.DateTimeFormat("sv-SE", {
			timeZone: targetTimezone,
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		});

		return formatter.format(date).replace(",", "");
	} catch {
		return isoString;
	}
}

/**
 * Add duration (hours and minutes) to a local time string
 * Returns a new local time string in the same format
 * This avoids timezone conversion issues that occur with Date objects
 */
function addDurationToLocalTime(
	localTimeStr: string,
	hours: number,
	minutes: number,
): string {
	// Strip any timezone suffix
	const bareTime = localTimeStr.replace(/Z$|[+-]\d{2}:\d{2}$/, "");

	// Parse the time components
	const match = bareTime.match(
		/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/,
	);
	if (!match) {
		return localTimeStr;
	}

	const [, year, month, day, hour, minute, second = "00"] = match;
	let y = Number.parseInt(year, 10);
	let mo = Number.parseInt(month, 10);
	let d = Number.parseInt(day, 10);
	let h = Number.parseInt(hour, 10);
	let mi = Number.parseInt(minute, 10);

	// Add the duration
	mi += minutes;
	h += hours;

	// Handle overflow
	while (mi >= 60) {
		mi -= 60;
		h += 1;
	}
	while (h >= 24) {
		h -= 24;
		d += 1;
	}

	// Simple day overflow (not handling month/year boundaries precisely, but good enough for display)
	const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	// Leap year check
	if ((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0) {
		daysInMonth[1] = 29;
	}
	while (d > daysInMonth[mo - 1]) {
		d -= daysInMonth[mo - 1];
		mo += 1;
		if (mo > 12) {
			mo = 1;
			y += 1;
		}
	}

	return `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}T${String(h).padStart(2, "0")}:${String(mi).padStart(2, "0")}:${second}`;
}

/**
 * Calculate duration string from start and end times
 * Both times should be in the same timezone (local times from the API)
 */
function calculateDurationString(
	startStr: string,
	endStr: string,
): string | undefined {
	// Strip timezone suffixes
	const bareStart = startStr.replace(/Z$|[+-]\d{2}:\d{2}$/, "");
	const bareEnd = endStr.replace(/Z$|[+-]\d{2}:\d{2}$/, "");

	const startMatch = bareStart.match(
		/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/,
	);
	const endMatch = bareEnd.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);

	if (!startMatch || !endMatch) {
		return undefined;
	}

	// Convert to minutes since midnight (simplified, same-day assumption)
	const startMinutes =
		Number.parseInt(startMatch[4], 10) * 60 +
		Number.parseInt(startMatch[5], 10);
	const endMinutes =
		Number.parseInt(endMatch[4], 10) * 60 + Number.parseInt(endMatch[5], 10);

	// Handle day boundary (end is next day)
	let durationMinutes = endMinutes - startMinutes;
	if (durationMinutes < 0) {
		durationMinutes += 24 * 60; // Add a day
	}

	if (durationMinutes <= 0) {
		return undefined;
	}

	const hours = Math.floor(durationMinutes / 60);
	const minutes = durationMinutes % 60;
	const parts: string[] = [];
	if (hours > 0) {
		parts.push(`${hours}h`);
	}
	if (minutes > 0) {
		parts.push(`${minutes}m`);
	}
	return parts.length > 0 ? parts.join(" ") : undefined;
}

/**
 * Get the UTC offset in minutes for a specific timezone at a specific date/time
 * Positive = ahead of UTC, negative = behind UTC
 */
function getTimezoneOffsetMinutes(
	year: number,
	month: number,
	day: number,
	hour: number,
	minute: number,
	timezone: string,
): number {
	// Create a date formatter that shows the offset
	const formatter = new Intl.DateTimeFormat("en-US", {
		timeZone: timezone,
		timeZoneName: "longOffset",
	});

	// Use a reference date to get the offset
	// We need to approximate the correct UTC time to get accurate DST handling
	const refDate = new Date(Date.UTC(year, month, day, hour, minute, 0));
	const parts = formatter.formatToParts(refDate);
	const offsetPart = parts.find((p) => p.type === "timeZoneName");

	if (offsetPart) {
		// Parse "GMT+01:00" or "GMT-05:00" or "GMT" (for UTC)
		if (offsetPart.value === "GMT") {
			return 0;
		}
		const offsetMatch = offsetPart.value.match(/GMT([+-])(\d{2}):(\d{2})/);
		if (offsetMatch) {
			const [, sign, hours, minutes] = offsetMatch;
			const totalMinutes =
				Number.parseInt(hours, 10) * 60 + Number.parseInt(minutes, 10);
			return sign === "+" ? totalMinutes : -totalMinutes;
		}
	}

	return 0;
}

/**
 * Display a single event
 */
function displayEvent(
	event: MorgenEvent,
	targetTimezone: string,
	calendarName?: string,
): void {
	// Get the event's timezone from the raw data (Morgen API may use "timeZone" field)
	const eventTimezone =
		event.timezone ||
		((event as Record<string, unknown>).timeZone as string | undefined);

	console.log(chalk.bold(event.title));
	if (calendarName) {
		console.log(`  Calendar: ${calendarName}`);
	}
	if (event.id) {
		console.log(`  ID: ${event.id}`);
	}
	console.log(
		`  Start: ${formatDateTimeInTimezone(event.start, targetTimezone, eventTimezone)}`,
	);

	// Calculate end time and duration
	let endTime: string | undefined = event.end;
	let duration: string | undefined;

	// Check if duration exists in the event data (schema uses passthrough, so it should be preserved)
	if (
		"duration" in event &&
		typeof (event as Record<string, unknown>).duration === "string"
	) {
		duration = (event as Record<string, unknown>).duration as string;

		// If end is not provided, calculate it from duration
		if (!endTime) {
			// Parse ISO 8601 duration (e.g., "PT1H", "PT30M", "PT1H30M")
			const durationMatch = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
			if (durationMatch) {
				const durationHours = Number.parseInt(durationMatch[1] || "0", 10);
				const durationMinutes = Number.parseInt(durationMatch[2] || "0", 10);
				// Calculate end time by adding duration to start time string directly
				// This avoids timezone conversion issues with Date objects
				endTime = addDurationToLocalTime(
					event.start,
					durationHours,
					durationMinutes,
				);
			}
		}
	} else if (endTime) {
		// If duration is not provided but end is, calculate duration display string
		duration = calculateDurationString(event.start, endTime);
	}

	if (endTime) {
		console.log(
			`  End: ${formatDateTimeInTimezone(endTime, targetTimezone, eventTimezone)}`,
		);
	}
	if (duration) {
		// Format duration nicely (if it's ISO 8601 format, parse it)
		if (duration.startsWith("PT")) {
			const durationMatch = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
			if (durationMatch) {
				const hours = Number.parseInt(durationMatch[1] || "0", 10);
				const minutes = Number.parseInt(durationMatch[2] || "0", 10);
				const durationParts: string[] = [];
				if (hours > 0) {
					durationParts.push(`${hours}h`);
				}
				if (minutes > 0) {
					durationParts.push(`${minutes}m`);
				}
				if (durationParts.length > 0) {
					duration = durationParts.join(" ");
				}
			}
		}
		console.log(`  Duration: ${duration}`);
	}

	if (event.description) {
		console.log(`  Description: ${event.description}`);
	}
	if (event.location) {
		console.log(`  Location: ${event.location}`);
	}
	if (event.allDay) {
		console.log(`  All Day: Yes`);
	}
	if (event.attendees && event.attendees.length > 0) {
		console.log(`  Attendees:`);
		for (const attendee of event.attendees) {
			const status = attendee.status || "needs-action";
			const statusColor =
				status === "accepted"
					? chalk.green
					: status === "declined"
						? chalk.red
						: status === "tentative"
							? chalk.yellow
							: chalk.gray;
			console.log(
				`    - ${attendee.name || attendee.email} (${statusColor(status)})`,
			);
		}
	}
	// Check for participants in raw event data (Morgen API might return it differently)
	if (
		typeof event === "object" &&
		event !== null &&
		"participants" in event &&
		typeof (event as Record<string, unknown>).participants === "object"
	) {
		const participants = (event as Record<string, unknown>)
			.participants as Record<string, unknown>;
		const participantEntries = Object.entries(participants);
		if (participantEntries.length > 0) {
			console.log(`  Participants:`);
			for (const [email, participantData] of participantEntries) {
				if (
					participantData &&
					typeof participantData === "object" &&
					"participationStatus" in participantData
				) {
					const status = (participantData as { participationStatus: string })
						.participationStatus;
					const statusColor =
						status === "accepted"
							? chalk.green
							: status === "declined"
								? chalk.red
								: status === "tentative"
									? chalk.yellow
									: chalk.gray;
					const name =
						"name" in participantData &&
						typeof participantData.name === "string"
							? participantData.name
							: email;
					console.log(`    - ${name} (${statusColor(status)})`);
				}
			}
		}
	}
	console.log();
}

/**
 * Fetch events from all calendars grouped by account
 */
async function fetchAllCalendarEvents(
	options: ListEventsOptions,
	startDate: string,
	endDate: string,
): Promise<{
	events: EventWithCalendar[];
	accountCount: number;
	calendarCount: number;
	apiCalls: number;
	failedAccounts: string[];
}> {
	// Get calendars grouped by account (from cache or API)
	const calendarsByAccount = await getOrFetchCalendarsGroupedByAccount(
		options.refreshCache,
	);

	const allEvents: EventWithCalendar[] = [];
	const failedAccounts: string[] = [];
	let apiCalls = 0;

	// Create a map of calendarId -> calendarName for quick lookup
	const calendarNameMap = new Map<string, string>();
	let totalCalendars = 0;
	for (const calendars of calendarsByAccount.values()) {
		for (const cal of calendars) {
			calendarNameMap.set(cal.id, cal.name);
			totalCalendars++;
		}
	}

	// Make one API call per account with all calendar IDs for that account
	for (const [accountId, calendars] of calendarsByAccount.entries()) {
		const calendarIds = calendars.map((cal) => cal.id);

		try {
			apiCalls++;
			const events = await getEvents(calendarIds, accountId, startDate, endDate);

			// Add calendar name to each event
			for (const event of events) {
				const calendarId = event.calendarId;
				const calendarName = calendarId
					? calendarNameMap.get(calendarId) || "Unknown Calendar"
					: "Unknown Calendar";
				allEvents.push({ ...event, calendarName });
			}
		} catch (error) {
			// Log the error and continue with other accounts
			const accountCalendarNames = calendars.map((c) => c.name).join(", ");
			failedAccounts.push(`${accountId} (${accountCalendarNames})`);
			console.error(
				chalk.yellow(
					`Warning: Failed to fetch events for account ${accountId}: ${error instanceof Error ? error.message : "Unknown error"}`,
				),
			);
		}
	}

	// Sort events by start time
	allEvents.sort((a, b) => a.start.localeCompare(b.start));

	return {
		events: allEvents,
		accountCount: calendarsByAccount.size,
		calendarCount: totalCalendars,
		apiCalls,
		failedAccounts,
	};
}

export async function listEventsCommand(options: ListEventsOptions) {
	try {
		// Get the target timezone for display
		const targetTimezone = getEffectiveTimezone(options.timezone);

		// Default to current week if start/end not provided
		const now = new Date();
		const startDate =
			options.start ||
			new Date(
				now.getFullYear(),
				now.getMonth(),
				now.getDate() - 7,
			).toISOString();
		const endDate =
			options.end ||
			new Date(
				now.getFullYear(),
				now.getMonth(),
				now.getDate() + 7,
			).toISOString();

		if (options.all) {
			// --all mode: fetch events from all calendars
			console.log(chalk.blue("\n=== EVENTS FROM ALL CALENDARS ==="));

			const result = await fetchAllCalendarEvents(options, startDate, endDate);
			const apiPoints = result.apiCalls * 10;

			console.log(
				chalk.gray(
					`Accounts: ${result.accountCount} | Calendars: ${result.calendarCount} | API calls: ${result.apiCalls} (${apiPoints} points)`,
				),
			);
			console.log(chalk.gray(`Timezone: ${targetTimezone}\n`));

			if (result.events.length === 0) {
				console.log(chalk.yellow("No events found."));
			} else {
				for (const event of result.events) {
					displayEvent(event, targetTimezone, event.calendarName);
				}
				console.log(chalk.gray(`Total: ${result.events.length} event(s)\n`));
			}

			// Show warning for failed accounts at the end
			if (result.failedAccounts.length > 0) {
				console.log(
					chalk.yellow(
						`\nWarning: Failed to fetch events from ${result.failedAccounts.length} account(s):`,
					),
				);
				for (const account of result.failedAccounts) {
					console.log(chalk.yellow(`  - ${account}`));
				}
			}

			// Exit with error if all accounts failed
			if (
				result.failedAccounts.length > 0 &&
				result.failedAccounts.length === result.accountCount
			) {
				process.exit(1);
			}
		} else {
			// Single calendar mode (original behavior)
			if (!options.calendarId) {
				console.error(chalk.red("Error: --calendar-id is required"));
				process.exit(1);
			}

			if (!options.accountId) {
				console.error(chalk.red("Error: --account-id is required"));
				process.exit(1);
			}

			console.log(
				chalk.blue(`\n=== EVENTS FOR CALENDAR: ${options.calendarId} ===`),
			);
			console.log(chalk.gray(`Timezone: ${targetTimezone}\n`));

			const events = await getEvents(
				options.calendarId,
				options.accountId,
				startDate,
				endDate,
			);

			if (events.length === 0) {
				console.log(chalk.yellow("No events found."));
				return;
			}

			for (const event of events) {
				displayEvent(event, targetTimezone);
			}

			console.log(chalk.gray(`Total: ${events.length} event(s)\n`));
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
