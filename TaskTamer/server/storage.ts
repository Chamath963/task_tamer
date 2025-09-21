import { type User, type InsertUser, type WorkSession, type InsertWorkSession, type MonthlyEarnings, type InsertMonthlyEarnings } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Work session methods
  createWorkSession(session: InsertWorkSession): Promise<WorkSession>;
  updateWorkSession(id: string, updates: Partial<WorkSession>): Promise<WorkSession | undefined>;
  getWorkSession(id: string): Promise<WorkSession | undefined>;
  getWorkSessionsByUser(userId: string): Promise<WorkSession[]>;
  getActiveWorkSession(userId: string): Promise<WorkSession | undefined>;
  getTodaysWorkSessions(userId: string): Promise<WorkSession[]>;
  getWorkSessionsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<WorkSession[]>;
  
  // Monthly earnings methods
  createMonthlyEarnings(earnings: InsertMonthlyEarnings): Promise<MonthlyEarnings>;
  updateMonthlyEarnings(userId: string, month: number, year: number, amount: string): Promise<MonthlyEarnings | undefined>;
  getMonthlyEarnings(userId: string, month: number, year: number): Promise<MonthlyEarnings | undefined>;
  getMonthlyEarningsByUser(userId: string): Promise<MonthlyEarnings[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private workSessions: Map<string, WorkSession>;
  private monthlyEarnings: Map<string, MonthlyEarnings>;

  constructor() {
    this.users = new Map();
    this.workSessions = new Map();
    this.monthlyEarnings = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async createWorkSession(insertSession: InsertWorkSession): Promise<WorkSession> {
    const id = randomUUID();
    const session: WorkSession = {
      ...insertSession,
      id,
      duration: insertSession.duration ?? null,
      endTime: insertSession.endTime ?? null,
      isActive: insertSession.isActive ?? false,
      createdAt: new Date()
    };
    this.workSessions.set(id, session);
    return session;
  }

  async updateWorkSession(id: string, updates: Partial<WorkSession>): Promise<WorkSession | undefined> {
    const session = this.workSessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...updates };
    this.workSessions.set(id, updatedSession);
    return updatedSession;
  }

  async getWorkSession(id: string): Promise<WorkSession | undefined> {
    return this.workSessions.get(id);
  }

  async getWorkSessionsByUser(userId: string): Promise<WorkSession[]> {
    return Array.from(this.workSessions.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }

  async getActiveWorkSession(userId: string): Promise<WorkSession | undefined> {
    return Array.from(this.workSessions.values())
      .find(session => session.userId === userId && session.isActive);
  }

  async getTodaysWorkSessions(userId: string): Promise<WorkSession[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    return Array.from(this.workSessions.values())
      .filter(session => 
        session.userId === userId && 
        session.startTime >= startOfDay && 
        session.startTime < endOfDay &&
        !session.isActive
      )
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  async getWorkSessionsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<WorkSession[]> {
    return Array.from(this.workSessions.values())
      .filter(session => 
        session.userId === userId && 
        session.startTime >= startDate && 
        session.startTime <= endDate &&
        !session.isActive
      )
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }

  async createMonthlyEarnings(insertEarnings: InsertMonthlyEarnings): Promise<MonthlyEarnings> {
    const id = randomUUID();
    const earnings: MonthlyEarnings = {
      ...insertEarnings,
      id,
      createdAt: new Date()
    };
    this.monthlyEarnings.set(id, earnings);
    return earnings;
  }

  async updateMonthlyEarnings(userId: string, month: number, year: number, amount: string): Promise<MonthlyEarnings | undefined> {
    const existing = Array.from(this.monthlyEarnings.values())
      .find(e => e.userId === userId && e.month === month && e.year === year);
    
    if (existing) {
      const updated = { ...existing, amount };
      this.monthlyEarnings.set(existing.id, updated);
      return updated;
    }
    
    return this.createMonthlyEarnings({ userId, month, year, amount });
  }

  async getMonthlyEarnings(userId: string, month: number, year: number): Promise<MonthlyEarnings | undefined> {
    return Array.from(this.monthlyEarnings.values())
      .find(e => e.userId === userId && e.month === month && e.year === year);
  }

  async getMonthlyEarningsByUser(userId: string): Promise<MonthlyEarnings[]> {
    return Array.from(this.monthlyEarnings.values())
      .filter(e => e.userId === userId)
      .sort((a, b) => (b.year * 12 + b.month) - (a.year * 12 + a.month));
  }
}

export const storage = new MemStorage();
