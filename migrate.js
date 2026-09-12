import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function run() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error(" DATABASE_URL is not defined");
    process.exit(1);
  }

  console.log(" Connecting to database...");

  const client = new pg.Client({
    connectionString,
  });

  try {
    await client.connect();

    console.log("Database connected");
    console.log("Applying migrations...\n");

    const db = drizzle(client);

    await migrate(db, {
      migrationsFolder: "./src/db/migrations",
    });

    console.log("\ Migrations completed successfully");
  } catch (error) {
    console.error("\n MIGRATION FAILED\n");

    console.error("Error name:");
    console.error(error?.name);

    console.error("\nError message:");
    console.error(error?.message);

    console.error("\nError code:");
    console.error(error?.code);

    if (error?.cause) {
      console.error("\n PostgreSQL cause:");
      console.error("Message:", error.cause.message);
      console.error("Code:", error.cause.code);
      console.error("Detail:", error.cause.detail);
      console.error("Hint:", error.cause.hint);
      console.error("Table:", error.cause.table);
      console.error("Column:", error.cause.column);
    }

    console.error("\nFull error:");
    console.error(error);

    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

run();