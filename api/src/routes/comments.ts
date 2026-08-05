import { Router } from "express";

export const router = Router();

router.get("/:proposalId", (_req, res) => {
  res.json({ comments: [] });
});

router.post("/:proposalId", (_req, res) => {
  res.status(501).json({ error: "Not implemented" });
});
