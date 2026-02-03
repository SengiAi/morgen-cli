import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { getCalendars } from "./morgen-client";

// Cache directory and file paths
const CONFIG_DIR = join(homedir(), ".morgen-cli");
const CACHE_FILE = join(CONFIG_DIR, "calendars-cache.json");

// Cache TTL in minutes
const CACHE_TTL_MINUTES = 60;

// Cache version for future migrations
const CACHE_VERSION = "1.0";

/**
 * Cached calendar data
 */
export interface CachedCalendar {
	id: string;
	accountId: string;
	name: string;
	provider?: string;
}

/**
 * Calendar cache structure
 */
export interface CalendarCache {
	version: string;
	cachedAt: string; // ISO 8601 timestamp
	ttlMinutes: number;
	calendars: CachedCalendar[];
}

/**
 * Check if calendar caching is enabled
 * Enabled by default, disable with MORGEN_DISABLE_CALENDAR_CACHE=true
 */
export function isCacheEnabled(): boolean {
	const disableCache = process.env.MORGEN_DISABLE_CALENDAR_CACHE;
	return !disableCache || disableCache.toLowerCase() !== "true";
}

/**
 * Check if the cache is stale (older than TTL)
 */
export function isCacheStale(cache: CalendarCache): boolean {
	const cachedAt = new Date(cache.cachedAt);
	const now = new Date();
	const ageMinutes = (now.getTime() - cachedAt.getTime()) / (1000 * 60);
	return ageMinutes >= cache.ttlMinutes;
}

/**
 * Ensure config directory exists
 */
function ensureConfigDir(): void {
	if (!existsSync(CONFIG_DIR)) {
		mkdirSync(CONFIG_DIR, { recursive: true });
	}
}

/**
 * Read calendar cache from file
 * Returns null if cache doesn't exist or is invalid
 */
export function readCalendarCache(): CalendarCache | null {
	if (!existsSync(CACHE_FILE)) {
		return null;
	}

	try {
		const content = readFileSync(CACHE_FILE, "utf-8");
		const parsed = JSON.parse(content) as CalendarCache;

		// Validate cache structure
		if (
			parsed.version !== CACHE_VERSION ||
			!parsed.cachedAt ||
			!Array.isArray(parsed.calendars)
		) {
			return null;
		}

		return parsed;
	} catch {
		// If cache is malformed, return null
		return null;
	}
}

/**
 * Write calendars to cache
 */
export function writeCalendarCache(calendars: CachedCalendar[]): void {
	ensureConfigDir();

	const cache: CalendarCache = {
		version: CACHE_VERSION,
		cachedAt: new Date().toISOString(),
		ttlMinutes: CACHE_TTL_MINUTES,
		calendars,
	};

	writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), "utf-8");
}

/**
 * Invalidate (delete) the calendar cache
 */
export function invalidateCache(): void {
	if (existsSync(CACHE_FILE)) {
		unlinkSync(CACHE_FILE);
	}
}

/**
 * Get calendars grouped by account ID
 * Returns a Map of accountId -> calendarId[]
 * Returns null if cache is disabled, stale, or doesn't exist
 */
export function getCalendarsGroupedByAccount(): Map<
	string,
	CachedCalendar[]
> | null {
	if (!isCacheEnabled()) {
		return null;
	}

	const cache = readCalendarCache();
	if (!cache || isCacheStale(cache)) {
		return null;
	}

	const grouped = new Map<string, CachedCalendar[]>();
	for (const calendar of cache.calendars) {
		const existing = grouped.get(calendar.accountId) || [];
		existing.push(calendar);
		grouped.set(calendar.accountId, existing);
	}

	return grouped;
}

/**
 * Get calendars, using cache if available and fresh, otherwise fetch from API
 * If forceRefresh is true, always fetch from API
 */
export async function getOrFetchCalendars(
	forceRefresh = false,
): Promise<CachedCalendar[]> {
	// Check cache first (unless force refresh or cache disabled)
	if (!forceRefresh && isCacheEnabled()) {
		const cache = readCalendarCache();
		if (cache && !isCacheStale(cache)) {
			return cache.calendars;
		}
	}

	// Fetch from API
	const calendars = await getCalendars();

	// Transform to CachedCalendar format
	const cachedCalendars: CachedCalendar[] = calendars
		.filter((cal) => cal.accountId) // Only include calendars with accountId
		.map((cal) => ({
			id: cal.id,
			accountId: cal.accountId as string,
			name: cal.name,
			provider: cal.provider,
		}));

	// Write to cache if caching is enabled
	if (isCacheEnabled()) {
		writeCalendarCache(cachedCalendars);
	}

	return cachedCalendars;
}

/**
 * Get calendars grouped by account, fetching from API if needed
 * If forceRefresh is true, always fetch from API
 */
export async function getOrFetchCalendarsGroupedByAccount(
	forceRefresh = false,
): Promise<Map<string, CachedCalendar[]>> {
	const calendars = await getOrFetchCalendars(forceRefresh);

	const grouped = new Map<string, CachedCalendar[]>();
	for (const calendar of calendars) {
		const existing = grouped.get(calendar.accountId) || [];
		existing.push(calendar);
		grouped.set(calendar.accountId, existing);
	}

	return grouped;
}
