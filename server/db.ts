import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema.js"; // Garanta que a extensão .js está aqui

// A Vercel gerencia as variáveis de ambiente, então a verificação pode ser removida ou mantida
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set in Vercel environment variables.");
}

// Configuração para o ambiente serverless
neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(schema, { client: pool }); // Drizzle ORM v0.29+ style