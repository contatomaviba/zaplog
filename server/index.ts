import express from "express";
import cors from "cors";
import { registerRoutes } from "./routes.js"; // A correção está aqui

const PORT = process.env.PORT || 5000;
const app = express();

const allowedOrigins = [
  'https://zaplog-five.vercel.app',
  'http://localhost:5173',
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

app.use(cors(corsOptions));
app.use(express.json());

registerRoutes(app);

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor local rodando na porta ${PORT}`);
  });
}

export default app;