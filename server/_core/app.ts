import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { runWorkbenchHeartbeat } from "../workbenchService";
import { createDailyDeadlineReminders } from "../deadlineReminders";
import { cleanupExpiredReadNotifications } from "../notificationCleanup";
import { createContext } from "./context";
import { sdk } from "./sdk";

/**
 * Builds the Express application with all API routes (tRPC, OAuth, storage,
 * scheduled tasks). Shared by the standalone Node server and the Netlify Function.
 */
export function createApp() {
  const app = express();
  app.set("trust proxy", true);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  app.post("/api/scheduled/deadline-reminders", async (req, res) => {
    try {
      const user = await sdk.authenticateRequest(req);
      if (!user.isCron || !user.taskUid) return res.status(403).json({ error: "cron-only" });
      const result = await createDailyDeadlineReminders();
      return res.json({ ok: true, ...result });
    } catch (error) {
      return res.status(500).json({ error: error instanceof Error ? error.message : "deadline-reminders-failed", timestamp: new Date().toISOString() });
    }
  });
  app.post("/api/scheduled/notification-cleanup", async (req, res) => {
    try {
      const user = await sdk.authenticateRequest(req);
      if (!user.isCron || !user.taskUid) return res.status(403).json({ error: "cron-only" });
      const result = await cleanupExpiredReadNotifications();
      return res.json({ ok: true, ...result });
    } catch (error) {
      return res.status(500).json({ error: error instanceof Error ? error.message : "notification-cleanup-failed", timestamp: new Date().toISOString() });
    }
  });
  app.post("/api/scheduled/simulation-expiry", async (req, res) => {
    try {
      const user = await sdk.authenticateRequest(req);
      if (!user.isCron || !user.taskUid) return res.status(403).json({ error: "cron-only" });
      return res.json({ ok: true, ...await runWorkbenchHeartbeat(user.taskUid) });
    } catch (error) {
      return res.status(500).json({ error: error instanceof Error ? error.message : "simulation-expiry-failed", timestamp: new Date().toISOString() });
    }
  });
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  return app;
}
