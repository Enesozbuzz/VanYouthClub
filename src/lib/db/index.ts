import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import { DATABASE_URL } from "./env";

const connectionString = DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Reuse the pool across hot-reloads in development.
const globalForDb = globalThis as unknown as { vycPool: Pool | undefined };

export const pool =
  globalForDb.vycPool ??
  new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.vycPool = pool;
}

export const db = drizzle(pool, { schema });

export * from "./schema";
