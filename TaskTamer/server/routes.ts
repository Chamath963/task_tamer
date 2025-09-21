import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertWorkSessionSchema, insertMonthlyEarningsSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email) || 
                          await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      const user = await storage.createUser(userData);
      const { password, ...userWithoutPassword } = user;
      
      // Set session
      (req.session as any).userId = user.id;
      
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(400).json({ message: "Invalid user data", error });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set session
      (req.session as any).userId = user.id;
      
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(400).json({ message: "Login failed", error });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    const { password, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  });

  // Middleware to check authentication
  const requireAuth = async (req: any, res: any, next: any) => {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    req.userId = userId;
    next();
  };

  // Work session routes
  app.post("/api/sessions", requireAuth, async (req: any, res) => {
    try {
      const sessionData = insertWorkSessionSchema.parse({
        ...req.body,
        userId: req.userId
      });
      
      // Check if there's already an active session
      const activeSession = await storage.getActiveWorkSession(req.userId);
      if (activeSession) {
        return res.status(400).json({ message: "There is already an active session" });
      }
      
      const session = await storage.createWorkSession(sessionData);
      res.json({ session });
    } catch (error) {
      res.status(400).json({ message: "Invalid session data", error });
    }
  });

  app.put("/api/sessions/:id", requireAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const session = await storage.getWorkSession(id);
      if (!session || session.userId !== req.userId) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      const updatedSession = await storage.updateWorkSession(id, updates);
      res.json({ session: updatedSession });
    } catch (error) {
      res.status(400).json({ message: "Update failed", error });
    }
  });

  app.get("/api/sessions/active", requireAuth, async (req: any, res) => {
    try {
      const activeSession = await storage.getActiveWorkSession(req.userId);
      res.json({ session: activeSession });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active session", error });
    }
  });

  app.get("/api/sessions/today", requireAuth, async (req: any, res) => {
    try {
      const sessions = await storage.getTodaysWorkSessions(req.userId);
      res.json({ sessions });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch today's sessions", error });
    }
  });

  app.get("/api/sessions", requireAuth, async (req: any, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      let sessions;
      if (startDate && endDate) {
        sessions = await storage.getWorkSessionsByDateRange(
          req.userId, 
          new Date(startDate as string), 
          new Date(endDate as string)
        );
      } else {
        sessions = await storage.getWorkSessionsByUser(req.userId);
      }
      
      res.json({ sessions });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sessions", error });
    }
  });

  // Monthly earnings routes
  app.post("/api/earnings", requireAuth, async (req: any, res) => {
    try {
      const earningsData = insertMonthlyEarningsSchema.parse({
        ...req.body,
        userId: req.userId
      });
      
      const earnings = await storage.updateMonthlyEarnings(
        req.userId,
        earningsData.month,
        earningsData.year,
        earningsData.amount
      );
      
      res.json({ earnings });
    } catch (error) {
      res.status(400).json({ message: "Invalid earnings data", error });
    }
  });

  app.get("/api/earnings", requireAuth, async (req: any, res) => {
    try {
      const earnings = await storage.getMonthlyEarningsByUser(req.userId);
      res.json({ earnings });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch earnings", error });
    }
  });

  // Analytics routes
  app.get("/api/analytics/metrics", requireAuth, async (req: any, res) => {
    try {
      const sessions = await storage.getWorkSessionsByUser(req.userId);
      const earnings = await storage.getMonthlyEarningsByUser(req.userId);
      
      // Calculate metrics
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      
      const currentMonthEarnings = earnings.find(e => e.month === currentMonth && e.year === currentYear);
      const previousMonthEarnings = earnings.find(e => e.month === previousMonth && e.year === previousYear);
      
      // Get last 30 days of sessions
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const recentSessions = sessions.filter(s => s.startTime >= thirtyDaysAgo && !s.isActive);
      
      // Calculate averages
      const totalHours = recentSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 3600; // convert to hours
      const totalDays = Math.max(1, recentSessions.length > 0 ? 30 : 1);
      const avgDailyHours = totalHours / totalDays;
      
      const currentEarningsAmount = currentMonthEarnings ? parseFloat(currentMonthEarnings.amount) : 0;
      const avgDailyIncome = currentEarningsAmount / new Date(currentYear, currentMonth, 0).getDate();
      
      // Calculate work streak (consecutive days with sessions)
      let workStreak = 0;
      const today = new Date();
      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        const startOfDay = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate());
        const endOfDay = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate() + 1);
        
        const hasWork = sessions.some(s => 
          s.startTime >= startOfDay && 
          s.startTime < endOfDay && 
          !s.isActive
        );
        
        if (hasWork) {
          workStreak++;
        } else if (i > 0) { // Allow today to be empty
          break;
        }
      }
      
      const metrics = {
        avgDailyIncome: Math.round(avgDailyIncome),
        avgDailyHours: Math.round(avgDailyHours * 10) / 10,
        workStreak,
        monthlyEarnings: currentEarningsAmount,
        monthlyHours: Math.round(totalHours),
        incomeChange: previousMonthEarnings ? 
          Math.round(((currentEarningsAmount - parseFloat(previousMonthEarnings.amount)) / parseFloat(previousMonthEarnings.amount)) * 100) : 0,
        hoursChange: Math.round((avgDailyHours - 5.5) * 10) / 10 // assuming 5.5h baseline
      };
      
      res.json({ metrics });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch metrics", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
