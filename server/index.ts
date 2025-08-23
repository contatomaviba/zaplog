import express from "express";
import cors from "cors";
import { registerRoutes } from "./routes";

// --- CONFIGURAÇÃO PRINCIPAL ---
const PORT = process.env.PORT || 5000;
const app = express();

// --- CONFIGURAÇÃO DE CORS ---
const allowedOrigins = [
  'https://zaplog-five.vercel.app',  // Sua URL da Vercel
  'http://localhost:5173',           // Seu frontend local
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

// --- MIDDLEWARES ---
app.use(cors(corsOptions));
app.use(express.json());

// --- ROTAS DA API ---
registerRoutes(app);

// --- INICIALIZAÇÃO DO SERVIDOR ---
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

// Exporta o app para a Vercel
export default app;