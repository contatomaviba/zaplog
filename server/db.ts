import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "../shared/schema.js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set in Vercel environment variables.");
}

// Configure Neon to use WebSocket in serverless Node (e.g., Vercel Functions)
neonConfig.webSocketConstructor = ws as any;

const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(sql as any, { schema });
