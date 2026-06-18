import { readFileSync, existsSync } from "node:fs";
import { spawn } from "node:child_process";

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return;
  }

  const contents = readFileSync(filePath, "utf8");

  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const equalsIndex = trimmed.indexOf("=");

    if (equalsIndex === -1) {
      continue;
    }

    let key = trimmed.slice(0, equalsIndex).trim();
    let value = trimmed.slice(equalsIndex + 1).trim();

    if (key.startsWith("export ")) {
      key = key.slice(7).trim();
    }

    if (!key || process.env[key] !== undefined) {
      continue;
    }

    const isQuoted =
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"));

    if (isQuoted) {
      value = value.slice(1, -1);
    } else {
      const commentIndex = value.indexOf(" #");

      if (commentIndex !== -1) {
        value = value.slice(0, commentIndex).trimEnd();
      }
    }

    process.env[key] = value;
  }
}

const command = process.argv[2];

if (!command || !["dev", "start"].includes(command)) {
  console.error("Usage: node ./scripts/next-with-port.mjs <dev|start> [next args...]");
  process.exit(1);
}

const nodeEnv = command === "dev" ? "development" : "production";
const envFiles = [
  `.env.${nodeEnv}.local`,
  nodeEnv === "test" ? null : ".env.local",
  `.env.${nodeEnv}`,
  ".env",
].filter(Boolean);

for (const envFile of envFiles) {
  loadEnvFile(envFile);
}

const nextArgs = process.argv.slice(3);
const hasExplicitPort = nextArgs.some((arg) =>
  arg === "-p" ||
  arg === "--port" ||
  arg.startsWith("--port=") ||
  arg.startsWith("-p="),
);

const port = process.env.PORT?.trim();

if (port && !hasExplicitPort) {
  nextArgs.unshift(port);
  nextArgs.unshift("--port");
}

const child = spawn("next", [command, ...nextArgs], {
  stdio: "inherit",
  env: process.env,
});

child.on("error", (error) => {
  console.error(`Failed to start Next.js: ${error.message}`);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
