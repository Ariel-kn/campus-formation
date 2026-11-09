import { defineConfig } from "drizzle-kit";

// `drizzle-kit generate` only reads the schema and never connects, so a missing
// DATABASE_URL must not block it. PLACEHOLDER: the fallback URL is never used to
// connect; set DATABASE_URL to run `drizzle-kit migrate` against a real database.
const connectionString =
  process.env.DATABASE_URL || "mysql://placeholder:placeholder@localhost:3306/placeholder";

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    url: connectionString,
  },
});
