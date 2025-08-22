import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, registerSchema, insertTripSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware to verify JWT token
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token de acesso requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }
    req.user = user;
    next();
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email já está em uso' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        plan: "free"
      });

      // Generate token
      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET);
      
      // Return user without password
      const { password, ...userResponse } = user;
      res.status(201).json({ user: userResponse, token });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }

      // Check password
      const validPassword = await bcrypt.compare(validatedData.password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }

      // Generate token
      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET);
      
      // Return user without password
      const { password, ...userResponse } = user;
      res.json({ user: userResponse, token });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      
      const { password, ...userResponse } = user;
      res.json({ user: userResponse });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Trip routes
  app.get('/api/trips', authenticateToken, async (req: any, res) => {
    try {
      const trips = await storage.getTripsByUserId(req.user.userId);
      res.json({ trips });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/trips', authenticateToken, async (req: any, res) => {
    try {
      const validatedData = insertTripSchema.parse(req.body);
      
      // Get user to check plan
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      // Check plan limits for free users
      if (user.plan === 'free') {
        const activeTripsCount = await storage.getActiveTripsCount(req.user.userId);
        if (activeTripsCount >= 3) {
          return res.status(403).json({ 
            message: 'Limite de viagens atingido para o plano Free. Faça upgrade para criar mais viagens.' 
          });
        }
      }

      const trip = await storage.createTrip({
        ...validatedData,
        userId: req.user.userId
      });
      
      res.status(201).json({ trip });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put('/api/trips/:id', authenticateToken, async (req: any, res) => {
    try {
      const tripId = req.params.id;
      const updates = req.body;
      
      // Check if trip belongs to user
      const existingTrip = await storage.getTrip(tripId);
      if (!existingTrip || existingTrip.userId !== req.user.userId) {
        return res.status(404).json({ message: 'Viagem não encontrada' });
      }

      const trip = await storage.updateTrip(tripId, updates);
      res.json({ trip });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete('/api/trips/:id', authenticateToken, async (req: any, res) => {
    try {
      const tripId = req.params.id;
      
      // Check if trip belongs to user
      const existingTrip = await storage.getTrip(tripId);
      if (!existingTrip || existingTrip.userId !== req.user.userId) {
        return res.status(404).json({ message: 'Viagem não encontrada' });
      }

      const deleted = await storage.deleteTrip(tripId);
      if (deleted) {
        res.json({ message: 'Viagem excluída com sucesso' });
      } else {
        res.status(404).json({ message: 'Viagem não encontrada' });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Statistics route
  app.get('/api/stats', authenticateToken, async (req: any, res) => {
    try {
      const stats = await storage.getTripStats(req.user.userId);
      res.json({ stats });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
