import express from "express";
import cors from "cors";
import { registerRoutes } from "./routes.js";

const PORT = process.env.PORT || 5000;
const app = express();

// --- CONFIGURAÇÃO DE CORS ---
const allowedOrigins = [
  "https://zaplog-five.vercel.app",  // Produção (Vercel)
  "http://localhost:5173",           // Desenvolvimento local
];

const corsOptions = {
  origin: (origin: string | undefined, callback: Function) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

// --- MIDDLEWARES ---
app.use(cors(corsOptions));
app.use(express.json());

// --- ROTAS ---
registerRoutes(app);

// --- RODA LOCALMENTE, MAS NÃO NA VERCEL ---
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor local rodando na porta ${PORT}`);
  });
}

// --- EXPORTA PARA A VERCEL (serverless) ---
export default app;
