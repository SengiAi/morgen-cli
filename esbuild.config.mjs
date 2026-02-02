import esbuild from "esbuild";
import { clean } from "esbuild-plugin-clean";
import { copy } from "esbuild-plugin-copy";
import { rmSync, cpSync, chmodSync } from "node:fs";

const isProduction = process.env.NODE_ENV === "production";

// Common build options
const commonOptions = {
  bundle: true,
  platform: "node",
  target: "node18",
  format: "cjs", // Use CommonJS for better Node.js CLI compatibility
  sourcemap: !isProduction,
  treeShaking: true,
  minify: isProduction,
  external: [], // Bundle everything for standalone CLI
  plugins: [clean({ clean: ["./dist"] })],
};

// Build calendar CLI
async function buildCalendar() {
  await esbuild.build({
    ...commonOptions,
    entryPoints: ["src/calendar/cli.ts"],
    outfile: "dist/morgen-calendar.cjs",
  });
  chmodSync("dist/morgen-calendar.cjs", 0o755); // Make executable
}

// Build tasks CLI
async function buildTasks() {
  await esbuild.build({
    ...commonOptions,
    entryPoints: ["src/tasks/cli.ts"],
    outfile: "dist/morgen-tasks.cjs",
  });
  chmodSync("dist/morgen-tasks.cjs", 0o755); // Make executable
}

// Build config CLI
async function buildConfig() {
  await esbuild.build({
    ...commonOptions,
    entryPoints: ["src/config-cli.ts"],
    outfile: "dist/morgen-config.cjs",
  });
  chmodSync("dist/morgen-config.cjs", 0o755); // Make executable
}

// Main build function
async function build() {
  // Clean dist folder first (manually, to ensure clean slate)
  rmSync("./dist", { recursive: true, force: true });

  // Build all CLIs in parallel
  await Promise.all([buildCalendar(), buildTasks(), buildConfig()]);

  // Copy .env.example to dist
  cpSync(".env.example", "dist/.env.example");

  console.log("✓ Built calendar CLI: dist/morgen-calendar.cjs");
  console.log("✓ Built tasks CLI: dist/morgen-tasks.cjs");
  console.log("✓ Built config CLI: dist/morgen-config.cjs");
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
