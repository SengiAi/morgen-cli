import "dotenv/config";
import { cleanEnv, str } from "envalid";
import { readConfig } from "./config.js";

/**
 * Load configuration from config file
 */
const config = readConfig();

/**
 * Validated environment variables using envalid
 *
 * Priority (highest to lowest):
 * 1. Environment variables
 * 2. Config file (~/.morgen-cli/config.json)
 * 3. Defaults
 *
 * Note: For CLI usage (--help), the API key is optional.
 * The actual requirement is enforced when making API calls.
 */
export const env = cleanEnv(process.env, {
  MORGEN_API_KEY: str({
    desc: "Morgen API key for authentication",
    default: config.apiKey || "",
  }),
  DEFAULT_ACCOUNT_ID: str({
    desc: "Default account ID to use",
    default: config.defaults?.accountId || "",
  }),
  DEFAULT_CALENDAR_ID: str({
    desc: "Default calendar ID to use",
    default: config.defaults?.calendarId || "",
  }),
  DEFAULT_TIMEZONE: str({
    desc: "Default timezone for events",
    default: config.defaults?.timezone || "Europe/Stockholm",
  }),
});
