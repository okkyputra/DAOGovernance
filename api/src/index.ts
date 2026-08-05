import "dotenv/config";
import express from "express";
import { router as proposalsRouter } from "./routes/proposals.js";
import { router as commentsRouter } from "./routes/comments.js";
import { router as delegatesRouter } from "./routes/delegates.js";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/proposals", proposalsRouter);
app.use("/api/comments", commentsRouter);
app.use("/api/delegates", delegatesRouter);

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
