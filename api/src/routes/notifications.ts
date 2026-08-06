import { Router } from "express";
import { and, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { notifications } from "../db/schema.js";

export const router = Router();

router.get("/", async (req, res) => {
  const userAddress = String(req.query.userAddress ?? "").toLowerCase();
  if (!userAddress) {
    return res.status(400).json({ error: "userAddress query param required" });
  }
  try {
    const rows = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userAddress, userAddress))
      .orderBy(notifications.createdAt);
    res.json({ notifications: rows });
  } catch (err) {
    res.status(500).json({ error: "failed to load notifications", detail: String(err) });
  }
});

router.post("/", async (req, res) => {
  const { userAddress, type, proposalId } = req.body ?? {};
  if (typeof userAddress !== "string" || typeof type !== "string") {
    return res.status(400).json({ error: "userAddress and type (strings) required" });
  }
  try {
    const rows = await db
      .insert(notifications)
      .values({ userAddress: userAddress.toLowerCase(), type, proposalId })
      .returning();
    res.status(201).json({ notification: rows[0] });
  } catch (err) {
    res.status(500).json({ error: "failed to save notification", detail: String(err) });
  }
});

router.post("/:id/read", async (req, res) => {
  const id = Number(req.params.id);
  try {
    const rows = await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id))
      .returning();
    if (rows.length === 0) {
      return res.status(404).json({ error: "notification not found" });
    }
    res.json({ notification: rows[0] });
  } catch (err) {
    res.status(500).json({ error: "failed to update notification", detail: String(err) });
  }
});

router.post("/read-all", async (req, res) => {
  const userAddress = String(req.body?.userAddress ?? "").toLowerCase();
  if (!userAddress) {
    return res.status(400).json({ error: "userAddress required" });
  }
  try {
    const rows = await db
      .update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.userAddress, userAddress), eq(notifications.read, false)))
      .returning();
    res.json({ updated: rows.length });
  } catch (err) {
    res.status(500).json({ error: "failed to update notifications", detail: String(err) });
  }
});
