import { defineConfig, env } from "prisma/config";

try {
  process.loadEnvFile();
} catch {
  // no .env file present (e.g. in production/CI) — rely on real env vars instead
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
