import { users, trips, type User, type InsertUser, type Trip, type InsertTrip } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, count } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Trip methods
  getTrip(id: string): Promise<Trip | undefined>;
  getTripsByUserId(userId: string): Promise<Trip[]>;
  getActiveTripsCount(userId: string): Promise<number>;
  createTrip(trip: InsertTrip & { userId: string }): Promise<Trip>;
  updateTrip(id: string, updates: Partial<Trip>): Promise<Trip | undefined>;
  deleteTrip(id: string): Promise<boolean>;
  
  // Statistics
  getTripStats(userId: string): Promise<{
    total: number;
    active: number;
    completed: number;
    drivers: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getTrip(id: string): Promise<Trip | undefined> {
    const [trip] = await db.select().from(trips).where(eq(trips.id, id));
    return trip || undefined;
  }

  async getTripsByUserId(userId: string): Promise<Trip[]> {
    return await db
      .select()
      .from(trips)
      .where(eq(trips.userId, userId))
      .orderBy(desc(trips.createdAt));
  }

  async getActiveTripsCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(trips)
      .where(and(eq(trips.userId, userId), eq(trips.isActive, true)));
    return result.count;
  }

  async createTrip(trip: InsertTrip & { userId: string }): Promise<Trip> {
    const [newTrip] = await db
      .insert(trips)
      .values(trip)
      .returning();
    return newTrip;
  }

  async updateTrip(id: string, updates: Partial<Trip>): Promise<Trip | undefined> {
    const [trip] = await db
      .update(trips)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(trips.id, id))
      .returning();
    return trip || undefined;
  }

  async deleteTrip(id: string): Promise<boolean> {
    const result = await db.delete(trips).where(eq(trips.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getTripStats(userId: string): Promise<{
    total: number;
    active: number;
    completed: number;
    drivers: number;
  }> {
    const allTrips = await this.getTripsByUserId(userId);
    
    const total = allTrips.length;
    const active = allTrips.filter(trip => trip.isActive && trip.status !== 'completed').length;
    const completed = allTrips.filter(trip => trip.status === 'completed').length;
    const drivers = new Set(allTrips.map(trip => trip.driverName)).size;

    return { total, active, completed, drivers };
  }
}

export const storage = new DatabaseStorage();
