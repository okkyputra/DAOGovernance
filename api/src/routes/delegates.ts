import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { delegateProfiles } from "../db/schema.js";

export const router = Router();

router.get("/", async (_req, res) => {
  try {
    const delegates = await db.select().from(delegateProfiles);
    res.json({ delegates });
  } catch (err) {
    res.status(500).json({ error: "failed to load delegates", detail: String(err) });
  }
});

router.get("/:address", async (req, res) => {
  const address = req.params.address.toLowerCase();
  try {
    const rows = await db.select().from(delegateProfiles).where(eq(delegateProfiles.address, address));
    if (rows.length === 0) {
      return res.status(404).json({ error: "delegate not found" });
    }
    res.json({ delegate: rows[0] });
  } catch (err) {
    res.status(500).json({ error: "failed to load delegate", detail: String(err) });
  }
});

router.put("/:address", async (req, res) => {
  const address = req.params.address.toLowerCase();
  const { ensName, bio, avatarUrl, platform, twitter } = req.body ?? {};
  try {
    const rows = await db
      .insert(delegateProfiles)
      .values({ address, ensName, bio, avatarUrl, platform, twitter })
      .onConflictDoUpdate({
        target: delegateProfiles.address,
        set: { ensName, bio, avatarUrl, platform, twitter },
      })
      .returning();
    res.json({ delegate: rows[0] });
  } catch (err) {
    res.status(500).json({ error: "failed to save delegate", detail: String(err) });
  }
});

router.delete("/:address", async (req, res) => {
  const address = req.params.address.toLowerCase();
  try {
    await db.delete(delegateProfiles).where(eq(delegateProfiles.address, address));
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: "failed to delete delegate", detail: String(err) });
  }
});
