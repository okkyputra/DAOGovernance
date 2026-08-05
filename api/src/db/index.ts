import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";

const url = process.env.DATABASE_URL;

if (!url) {
  console.warn("DATABASE_URL not set — DB calls will fail until configured.");
}

export const db = drizzle(url ?? "postgres://localhost:5432/daogovernance");
