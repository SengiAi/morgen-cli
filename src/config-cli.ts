#!/usr/bin/env node
import { existsSync } from "node:fs";
import { Command } from "commander";
import {
	editConfig,
	getConfigPath,
	getConfigValue,
	listConfig,
	readConfig,
	setConfigValue,
} from "./config.js";
// Import env to validate and load environment variables
import "./env.js";

const program = new Command();

program
	.name("morgen-config")
	.description("Manage Morgen CLI configuration")
	.version("1.0.0");

// Get a config value
program
	.command("get <key>")
	.description("Get a configuration value")
	.action((key) => {
		const value = getConfigValue(key);
		if (value === undefined || value === "") {
			console.log(`${key}: (not set)`);
		} else if (key === "apiKey") {
			console.log(`${key}: ******`);
		} else {
			console.log(`${key}: ${value}`);
		}
	});

// Set a config value
program
	.command("set <key> <value>")
	.description("Set a configuration value")
	.action((key, value) => {
		try {
			setConfigValue(key, value);
			console.log(`✓ Set ${key} = ${key === "apiKey" ? "******" : value}`);
		} catch (error) {
			if (error instanceof Error) {
				console.error(`Error: ${error.message}`);
			} else {
				console.error("An unknown error occurred");
			}
			process.exit(1);
		}
	});

// List all config values
program
	.command("list")
	.alias("ls")
	.description("List all configuration values")
	.action(() => {
		const config = listConfig();
		console.log("\nConfiguration:");
		for (const [key, value] of Object.entries(config)) {
			console.log(`  ${key}: ${value}`);
		}
		console.log("");
	});

// Show config file path
program
	.command("path")
	.description("Show the configuration file path")
	.action(() => {
		console.log(getConfigPath());
		if (existsSync(getConfigPath())) {
			console.log("\n✓ Config file exists");
		} else {
			console.log(
				"\n✗ Config file does not exist (will be created on first use)",
			);
		}
	});

// Edit config file in editor
program
	.command("edit")
	.description("Open configuration file in your default editor")
	.action(() => {
		try {
			editConfig();
			console.log(`\nOpened: ${getConfigPath()}`);
		} catch (error) {
			if (error instanceof Error) {
				console.error(`Error: ${error.message}`);
			} else {
				console.error("An unknown error occurred");
			}
			process.exit(1);
		}
	});

// Show current config status
program
	.command("status")
	.description("Show configuration status")
	.action(() => {
		const config = readConfig();
		console.log("\nConfiguration Status:\n");

		// API Key
		if (config.apiKey) {
			console.log("  ✓ API Key: Set (******)");
		} else {
			console.log("  ✗ API Key: Not set");
		}

		// Defaults
		if (config.defaults) {
			console.log("\n  Defaults:");
			if (config.defaults.accountId) {
				console.log(`    ✓ Account ID: ${config.defaults.accountId}`);
			}
			if (config.defaults.calendarId) {
				console.log(`    ✓ Calendar ID: ${config.defaults.calendarId}`);
			}
			if (config.defaults.timezone) {
				console.log(`    ✓ Timezone: ${config.defaults.timezone}`);
			}
		}

		// Config file location
		console.log(`\n  Config file: ${getConfigPath()}`);
		console.log("");
	});

program.parse();
