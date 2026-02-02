import chalk from "chalk";
import { listAccounts } from "../morgen-client";

interface ListAccountsOptions {
  json?: boolean;
}

export async function listAccountsCommand(options: ListAccountsOptions = {}) {
  try {
    const accounts = await listAccounts();

    if (options.json) {
      console.log(JSON.stringify(accounts, null, 2));
      return;
    }

    console.log(chalk.green(`Found ${accounts.length} connected account(s)\n`));

    for (const account of accounts as Array<{
      id?: string;
      integrationId?: string;
      providerUserDisplayName?: string;
      providerUserId?: string;
      shouldReconnect?: boolean;
      isConnectedSync?: boolean;
    }>) {
      console.log(
        chalk.bold(
          `Account: ${account.providerUserDisplayName || account.providerUserId || "Unknown"}`,
        ),
      );
      if (account.id) {
        console.log(`ID: ${account.id}`);
      }
      if (account.integrationId) {
        console.log(`Provider: ${chalk.cyan(account.integrationId)}`);
      }
      if (account.shouldReconnect !== undefined) {
        const status = account.shouldReconnect
          ? chalk.red("⚠ Needs reconnection")
          : chalk.green("✓ Connected");
        console.log(`Status: ${status}`);
      }
      if (account.isConnectedSync !== undefined) {
        console.log(
          `Sync Service: ${account.isConnectedSync ? "Connected" : "Not connected"}`,
        );
      }
      console.log();
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
