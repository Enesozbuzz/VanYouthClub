import { config } from "dotenv";

// Loads .env for standalone scripts (seed, migrations). Next.js loads .env
// automatically, so this is a no-op there.
config();

export const DATABASE_URL = process.env.DATABASE_URL;
