import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema.js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set in Vercel environment variables.");
}

// Configuração essencial para o Neon funcionar na Vercel
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Revertendo para a sintaxe original que funcionava
export const db = drizzle(pool, { schema });