import type { AxiosError, AxiosInstance, AxiosResponse } from "axios";

/**
 * Rate limit information parsed from response headers
 */
export interface RateLimitInfo {
	/** Maximum points/requests allowed in the current window */
	limit: number;
	/** Points/requests remaining in the current window */
	remaining: number;
	/** Seconds until the rate limit window resets */
	reset: number;
	/** Seconds to wait before retrying (only present when rate limited) */
	retryAfter?: number;
}

/**
 * Configuration for rate limit handling
 */
export interface RateLimitConfig {
	/** Maximum number of retry attempts (default: 3) */
	maxRetries?: number;
	/** Base delay in ms for exponential backoff (default: 1000) */
	baseDelay?: number;
	/** Maximum delay in ms (default: 60000) */
	maxDelay?: number;
	/** Whether to log rate limit warnings (default: true) */
	logWarnings?: boolean;
}

const DEFAULT_CONFIG: Required<RateLimitConfig> = {
	maxRetries: 3,
	baseDelay: 1000,
	maxDelay: 60000,
	logWarnings: true,
};

/**
 * Parse rate limit headers from an Axios response
 */
export function parseRateLimitHeaders(
	response: AxiosResponse,
): RateLimitInfo | null {
	const headers = response.headers;

	const limit = Number.parseInt(headers["ratelimit-limit"], 10);
	const remaining = Number.parseInt(headers["ratelimit-remaining"], 10);
	const reset = Number.parseInt(headers["ratelimit-reset"], 10);

	if (Number.isNaN(limit) || Number.isNaN(remaining) || Number.isNaN(reset)) {
		return null;
	}

	const info: RateLimitInfo = { limit, remaining, reset };

	const retryAfter = Number.parseInt(headers["retry-after"], 10);
	if (!Number.isNaN(retryAfter)) {
		info.retryAfter = retryAfter;
	}

	return info;
}

/**
 * Calculate delay for retry with exponential backoff
 */
function calculateDelay(
	attempt: number,
	retryAfter: number | undefined,
	config: Required<RateLimitConfig>,
): number {
	// If Retry-After header is present, use it (convert seconds to ms)
	if (retryAfter !== undefined && retryAfter > 0) {
		return Math.min(retryAfter * 1000, config.maxDelay);
	}

	// Exponential backoff: baseDelay * 2^attempt with jitter
	const exponentialDelay = config.baseDelay * 2 ** attempt;
	const jitter = Math.random() * 0.1 * exponentialDelay; // 10% jitter
	return Math.min(exponentialDelay + jitter, config.maxDelay);
}

/**
 * Sleep for a given number of milliseconds
 */
function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if an error is a rate limit error (429)
 */
function isRateLimitError(error: unknown): error is AxiosError {
	if (typeof error !== "object" || error === null) return false;
	const axiosError = error as AxiosError;
	return axiosError.response?.status === 429;
}

/**
 * Add rate limit handling interceptors to an Axios instance
 */
export function addRateLimitInterceptor(
	instance: AxiosInstance,
	config?: RateLimitConfig,
): void {
	const finalConfig = { ...DEFAULT_CONFIG, ...config };

	// Response interceptor to log rate limit warnings
	instance.interceptors.response.use(
		(response) => {
			if (finalConfig.logWarnings) {
				const rateLimitInfo = parseRateLimitHeaders(response);
				if (rateLimitInfo && rateLimitInfo.remaining <= 10) {
					console.warn(
						`[Rate Limit Warning] ${rateLimitInfo.remaining}/${rateLimitInfo.limit} requests remaining. Resets in ${rateLimitInfo.reset}s`,
					);
				}
			}
			return response;
		},
		(error) => Promise.reject(error),
	);
}

/**
 * Execute a request with automatic rate limit retry handling
 * @param requestFn Function that makes the request
 * @param config Rate limit configuration
 * @returns Promise resolving to the response
 */
export async function withRateLimitRetry<T>(
	requestFn: () => Promise<AxiosResponse<T>>,
	config?: RateLimitConfig,
): Promise<AxiosResponse<T>> {
	const finalConfig = { ...DEFAULT_CONFIG, ...config };
	let lastError: AxiosError | undefined;

	for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
		try {
			return await requestFn();
		} catch (error) {
			if (!isRateLimitError(error)) {
				throw error;
			}

			lastError = error;

			if (attempt >= finalConfig.maxRetries) {
				break;
			}

			// Parse retry-after from error response headers
			let retryAfter: number | undefined;
			if (error.response) {
				const rateLimitInfo = parseRateLimitHeaders(error.response);
				retryAfter = rateLimitInfo?.retryAfter;
			}

			const delay = calculateDelay(attempt, retryAfter, finalConfig);

			if (finalConfig.logWarnings) {
				console.warn(
					`[Rate Limited] Retry ${attempt + 1}/${finalConfig.maxRetries} after ${Math.round(delay / 1000)}s`,
				);
			}

			await sleep(delay);
		}
	}

	// All retries exhausted
	throw lastError;
}

/**
 * Create a rate-limited wrapper for an Axios instance
 * This wraps all request methods with automatic retry handling
 */
export function createRateLimitedClient(
	instance: AxiosInstance,
	config?: RateLimitConfig,
): AxiosInstance {
	const finalConfig = { ...DEFAULT_CONFIG, ...config };

	// Add warning interceptor
	addRateLimitInterceptor(instance, finalConfig);

	// Create a proxy that wraps the request method
	const originalRequest = instance.request.bind(instance);

	instance.request = (async <T>(
		requestConfig: Parameters<typeof originalRequest>[0],
	) =>
		withRateLimitRetry<T>(
			() => originalRequest(requestConfig),
			finalConfig,
		)) as typeof instance.request;

	return instance;
}
