import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

function createPool() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Close idle connections before Neon drops them on its side.
    idleTimeoutMillis: 30_000,
    // Fail fast instead of hanging if the database is unreachable.
    connectionTimeoutMillis: 10_000,
    keepAlive: true,
  });

  // An idle connection closed by the server must not crash the process.
  pool.on("error", (error) => {
    console.error("Postgres pool error:", error);
  });

  return pool;
}

// Reuse one pool across hot reloads in development.
const globalForDb = globalThis as unknown as { pgPool?: Pool };

const pool = globalForDb.pgPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalForDb.pgPool = pool;
}

export const db = drizzle(pool);
