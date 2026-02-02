import chalk from "chalk";
import { listProviders } from "../morgen-client";

interface ListProvidersOptions {
  json?: boolean;
}

export async function listProvidersCommand(options: ListProvidersOptions = {}) {
  try {
    const { integrations, groups } = await listProviders();

    if (options.json) {
      console.log(JSON.stringify({ integrations, groups }, null, 2));
      return;
    }

    console.log(chalk.green("Available Integration Providers\n"));

    console.log(chalk.bold("Groups:"));
    for (const group of groups as Array<{
      displayName?: string;
      type?: string;
    }>) {
      console.log(
        `  - ${group.displayName || group.type || "Unknown"} (${group.type})`,
      );
    }
    console.log();

    console.log(chalk.bold("Integrations:"));
    for (const integration of integrations as Array<{
      id?: string;
      displayName?: string;
      authId?: string;
      groups?: string[];
    }>) {
      console.log(
        `  ${chalk.cyan(integration.displayName || integration.id || "Unknown")}`,
      );
      console.log(`    ID: ${integration.id || integration.authId || "N/A"}`);
      if (integration.groups && integration.groups.length > 0) {
        console.log(`    Groups: ${integration.groups.join(", ")}`);
      }
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
