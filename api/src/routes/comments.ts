import { Router } from "express";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { comments } from "../db/schema.js";

export const router = Router();

router.get("/:proposalId", async (req, res) => {
  const proposalId = Number(req.params.proposalId);
  try {
    const rows = await db
      .select()
      .from(comments)
      .where(eq(comments.proposalId, proposalId))
      .orderBy(asc(comments.createdAt));
    res.json({ comments: rows });
  } catch (err) {
    res.status(500).json({ error: "failed to load comments", detail: String(err) });
  }
});

router.post("/:proposalId", async (req, res) => {
  const proposalId = Number(req.params.proposalId);
  const { author, body } = req.body ?? {};
  if (!Number.isInteger(proposalId) || proposalId < 0) {
    return res.status(400).json({ error: "invalid proposalId" });
  }
  if (typeof author !== "string" || author.length === 0 || author.length > 128) {
    return res.status(400).json({ error: "author (string, <=128 chars) required" });
  }
  if (typeof body !== "string" || body.trim().length === 0 || body.length > 2000) {
    return res.status(400).json({ error: "body (string, <=2000 chars) required" });
  }
  try {
    const rows = await db
      .insert(comments)
      .values({ proposalId, author, body })
      .returning();
    res.status(201).json({ comment: rows[0] });
  } catch (err) {
    res.status(500).json({ error: "failed to save comment", detail: String(err) });
  }
});

router.get("/", async (_req, res) => {
  try {
    const rows = await db.select().from(comments).orderBy(desc(comments.createdAt)).limit(100);
    res.json({ comments: rows });
  } catch (err) {
    res.status(500).json({ error: "failed to load comments", detail: String(err) });
  }
});
