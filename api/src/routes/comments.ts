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
  if (typeof author !== "string" || author.trim() === "" || typeof body !== "string" || body.trim() === "") {
    return res.status(400).json({ error: "author and body (strings) required" });
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
