// server/routes.ts
import type { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage.js";
import { loginSchema, registerSchema, insertTripSchema } from "../shared/schema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface AuthedRequest extends Request {
  user?: { userId: string; email: string };
}

function authenticateToken(req: AuthedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token de acesso requerido" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err || !user) return res.status(403).json({ message: "Token inválido" });
    // @ts-expect-error payload genérico
    req.user = user;
    next();
  });
}

export function registerRoutes(app: Express): void {
  // ------- Auth -------
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const data = registerSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) return res.status(400).json({ message: "Email já está em uso" });

      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = await storage.createUser({
        email: data.email,
        password: hashedPassword,
        name: data.name,
        plan: "free",
      });

      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET);
      const { password, ...userResponse } = user as any;
      res.status(201).json({ user: userResponse, token });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const data = loginSchema.parse(req.body);
      const user = await storage.getUserByEmail(data.email);
      if (!user) return res.status(401).json({ message: "Credenciais inválidas" });

      const valid = await bcrypt.compare(data.password, user.password);
      if (!valid) return res.status(401).json({ message: "Credenciais inválidas" });

      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET);
      const { password, ...userResponse } = user as any;
      res.json({ user: userResponse, token });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: AuthedRequest, res: Response) => {
    try {
      const user = await storage.getUser(req.user!.userId);
      if (!user) return res.status(404).json({ message: "Usuário não encontrado" });

      const { password, ...userResponse } = user as any;
      res.json({ user: userResponse });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ------- Trips -------
  app.get("/api/trips", authenticateToken, async (req: AuthedRequest, res: Response) => {
    try {
      const trips = await storage.getTripsByUserId(req.user!.userId);
      res.json({ trips });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/trips", authenticateToken, async (req: AuthedRequest, res: Response) => {
    try {
      const data = insertTripSchema.parse(req.body);
      const user = await storage.getUser(req.user!.userId);
      if (!user) return res.status(404).json({ message: "Usuário não encontrado" });

      if (user.plan === "free") {
        const count = await storage.getActiveTripsCount(req.user!.userId);
        if (count >= 3) {
          return res.status(403).json({
            message: "Limite de viagens atingido para o plano Free. Faça upgrade para criar mais viagens.",
          });
        }
      }

      const trip = await storage.createTrip({ ...data, userId: req.user!.userId });
      res.status(201).json({ trip });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/trips/:id", authenticateToken, async (req: AuthedRequest, res: Response) => {
    try {
      const tripId = req.params.id;
      const updates = req.body;
      const existing = await storage.getTrip(tripId);
      if (!existing || existing.userId !== req.user!.userId) {
        return res.status(404).json({ message: "Viagem não encontrada" });
      }
      const trip = await storage.updateTrip(tripId, updates);
      res.json({ trip });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/trips/:id", authenticateToken, async (req: AuthedRequest, res: Response) => {
    try {
      const tripId = req.params.id;
      const existing = await storage.getTrip(tripId);
      if (!existing || existing.userId !== req.user!.userId) {
        return res.status(404).json({ message: "Viagem não encontrada" });
      }
      const deleted = await storage.deleteTrip(tripId);
      if (deleted) res.json({ message: "Viagem excluída com sucesso" });
      else res.status(404).json({ message: "Viagem não encontrada" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ------- Stats -------
  app.get("/api/stats", authenticateToken, async (req: AuthedRequest, res: Response) => {
    try {
      const stats = await storage.getTripStats(req.user!.userId);
      res.json({ stats });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ------- Diagnóstico -------
  app.get("/api/ping", (_req: Request, res: Response) => {
    res.json({ ok: true, ts: Date.now() });
  });

  app.get("/api/debug/env", (_req: Request, res: Response) => {
    res.json({
      hasJwt: !!process.env.JWT_SECRET,
      hasDbUrl:
        !!process.env.DATABASE_URL ||
        !!process.env.NEON_DATABASE_URL ||
        !!process.env.POSTGRES_URL,
    });
  });
} // <- o arquivo TERMINA aqui. Não deixe nada depois desta chave!
