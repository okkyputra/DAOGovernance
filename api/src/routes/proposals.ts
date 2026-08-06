import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { proposalsMeta } from "../db/schema.js";

export const router = Router();

router.get("/", async (_req, res) => {
  try {
    const proposals = await db.select().from(proposalsMeta).orderBy(proposalsMeta.createdAt);
    res.json({ proposals });
  } catch (err) {
    res.status(500).json({ error: "failed to load proposals", detail: String(err) });
  }
});

router.get("/:proposalId", async (req, res) => {
  const proposalId = Number(req.params.proposalId);
  try {
    const rows = await db
      .select()
      .from(proposalsMeta)
      .where(eq(proposalsMeta.proposalId, proposalId));
    if (rows.length === 0) {
      return res.status(404).json({ error: "proposal not found" });
    }
    res.json({ proposal: rows[0] });
  } catch (err) {
    res.status(500).json({ error: "failed to load proposal", detail: String(err) });
  }
});

router.post("/", async (req, res) => {
  const { proposalId, ipfsHash, title, summary, category } = req.body ?? {};
  if (!Number.isInteger(proposalId) || typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ error: "proposalId (int) and title (string) required" });
  }
  try {
    const rows = await db
      .insert(proposalsMeta)
      .values({ proposalId, ipfsHash, title, summary, category })
      .onConflictDoNothing({ target: proposalsMeta.proposalId })
      .returning();
    res.status(201).json({ proposal: rows[0] });
  } catch (err) {
    res.status(500).json({ error: "failed to save proposal", detail: String(err) });
  }
});

router.patch("/:proposalId", async (req, res) => {
  const proposalId = Number(req.params.proposalId);
  const { ipfsHash, title, summary, category } = req.body ?? {};
  try {
    const rows = await db
      .update(proposalsMeta)
      .set({ ipfsHash, title, summary, category })
      .where(eq(proposalsMeta.proposalId, proposalId))
      .returning();
    if (rows.length === 0) {
      return res.status(404).json({ error: "proposal not found" });
    }
    res.json({ proposal: rows[0] });
  } catch (err) {
    res.status(500).json({ error: "failed to update proposal", detail: String(err) });
  }
});
