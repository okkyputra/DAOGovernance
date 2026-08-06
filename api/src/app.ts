import "dotenv/config";
import express, { type Express } from "express";
import { router as proposalsRouter } from "./routes/proposals.js";
import { router as commentsRouter } from "./routes/comments.js";
import { router as delegatesRouter } from "./routes/delegates.js";
import { router as notificationsRouter } from "./routes/notifications.js";
import { router as ipfsRouter } from "./routes/ipfs.js";

export function createApp(): Express {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/proposals", proposalsRouter);
  app.use("/api/comments", commentsRouter);
  app.use("/api/delegates", delegatesRouter);
  app.use("/api/notifications", notificationsRouter);
  app.use("/api/ipfs", ipfsRouter);

  return app;
}
