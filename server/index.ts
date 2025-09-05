// server/index.ts
import 'dotenv/config';
import express, { type Express } from "express";
import cors, { type CorsOptions } from "cors";
import { registerRoutes } from "./routes.js";

const app: Express = express();

// domínios fixos conhecidos
const allowedOrigins = new Set<string>([
  "http://localhost:5173",
  "https://zaplog-five.vercel.app", // se ainda usar esse
]);

// helper p/ liberar domínios do Vercel e um domínio custom via env
function isAllowedOrigin(origin?: string): boolean {
  if (!origin) return true; // permite tools (Postman/cURL)

  if (allowedOrigins.has(origin)) return true;

  // Vercel define VERCEL_URL sem protocolo (ex.: zaplog-abc123.vercel.app)
  if (process.env.VERCEL_URL && origin === `https://${process.env.VERCEL_URL}`) {
    return true;
  }

  // Qualquer preview/prod do seu projeto no Vercel (zaplog-*.vercel.app)
  if (/^https:\/\/zaplog-[a-z0-9-]+\.vercel\.app$/.test(origin)) {
    return true;
  }

  // opcional: um domínio do cliente via env (ex.: CLIENT_ORIGIN=https://app.seudominio.com)
  if (process.env.CLIENT_ORIGIN && origin === process.env.CLIENT_ORIGIN) {
    return true;
  }

  return false;
}

const corsOptions: CorsOptions = {
  origin: (origin, cb) => {
    if (isAllowedOrigin(origin)) cb(null, true);
    else cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

registerRoutes(app);

// Em produção (Vercel) não fazemos listen.
// Em dev, ligamos localmente:
if (process.env.NODE_ENV !== "production") {
  const PORT = Number(process.env.PORT) || 5000;
  app.listen(PORT, () => console.log(`🚀 Servidor local na porta ${PORT}`));
}

export default app;
