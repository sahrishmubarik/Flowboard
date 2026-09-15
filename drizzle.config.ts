import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";


dotenv.config({ path: ".env.local" });

export default defineConfig({
  schema: "./src/db/*Schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!, 
  },
  migrations: {
    prefix: "timestamp",
  },
  verbose: true,
  strict: true,
});
