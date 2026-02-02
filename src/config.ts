import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { edit } from "external-editor";

// Config directory and file paths
const CONFIG_DIR = join(homedir(), ".morgen-cli");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

// Config schema
interface MorgenConfig {
  apiKey: string;
  defaults?: {
    accountId?: string;
    calendarId?: string;
    timezone?: string;
  };
}

// Default config
const DEFAULT_CONFIG: MorgenConfig = {
  apiKey: "",
  defaults: {},
};

/**
 * Get the config file path
 */
export function getConfigPath(): string {
  return CONFIG_FILE;
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
 * Read config from file
 * Returns merged config with defaults for missing fields
 */
export function readConfig(): MorgenConfig {
  if (!existsSync(CONFIG_FILE)) {
    return { ...DEFAULT_CONFIG };
  }

  try {
    const content = readFileSync(CONFIG_FILE, "utf-8");
    const parsed = JSON.parse(content) as Partial<MorgenConfig>;
    return {
      apiKey: parsed.apiKey || "",
      defaults: {
        accountId: parsed.defaults?.accountId,
        calendarId: parsed.defaults?.calendarId,
        timezone: parsed.defaults?.timezone,
      },
    };
  } catch (_error) {
    // If config is malformed, return defaults
    return { ...DEFAULT_CONFIG };
  }
}

/**
 * Write config to file
 */
export function writeConfig(config: MorgenConfig): void {
  ensureConfigDir();
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
}

/**
 * Set a config value
 * Supports dot notation for nested keys (e.g., "defaults.accountId")
 */
export function setConfigValue(key: string, value: string): void {
  const config = readConfig();

  if (key === "apiKey") {
    config.apiKey = value;
  } else if (key.startsWith("defaults.")) {
    const subKey = key.slice(9); // Remove "defaults." prefix
    if (!config.defaults) {
      config.defaults = {};
    }
    (config.defaults as Record<string, string>)[subKey] = value;
  } else {
    throw new Error(`Unknown config key: ${key}`);
  }

  writeConfig(config);
}

/**
 * Get a config value by key
 * Supports dot notation for nested keys
 */
export function getConfigValue(key: string): string | undefined {
  const config = readConfig();

  if (key === "apiKey") {
    return config.apiKey || undefined;
  } else if (key.startsWith("defaults.")) {
    const subKey = key.slice(9);
    return config.defaults?.[subKey as keyof typeof config.defaults];
  }

  return undefined;
}

/**
 * List all config values (with masked API key)
 */
export function listConfig(): Record<string, string> {
  const config = readConfig();
  const result: Record<string, string> = {};

  result.apiKey = config.apiKey ? "******" : "(not set)";

  if (config.defaults) {
    for (const [key, value] of Object.entries(config.defaults)) {
      if (value) {
        result[`defaults.${key}`] = value;
      }
    }
  }

  return result;
}

/**
 * Open config file in editor
 */
export function editConfig(): void {
  ensureConfigDir();

  if (!existsSync(CONFIG_FILE)) {
    writeConfig({ ...DEFAULT_CONFIG });
  }

  edit(CONFIG_FILE);
}
