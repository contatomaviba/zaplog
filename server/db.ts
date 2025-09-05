import * as schema from "../shared/schema.js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set.");
}

const url = process.env.DATABASE_URL!;

// Estratégia: usa Neon quando URL aparenta ser Neon; caso contrário, usa pg (Postgres local/gerenciado)
const looksLikeNeon = /neon\.tech|vercel\.(?:db|postgres)/.test(url);

let db: any;

if (looksLikeNeon) {
  const { neon } = await import("@neondatabase/serverless");
  const { drizzle } = await import("drizzle-orm/neon-http");
  const sql = neon(url);
  db = drizzle(sql, { schema });
} else {
  const { Pool } = await import("pg");
  const { drizzle } = await import("drizzle-orm/node-postgres");
  const pool = new Pool({ connectionString: url });
  db = drizzle(pool, { schema });
}

export { db };
