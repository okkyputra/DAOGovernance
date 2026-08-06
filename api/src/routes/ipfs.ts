import { Router } from "express";
import { pinJson } from "../ipfs/pin.js";

export const router = Router();

router.post("/", async (req, res) => {
  const content = req.body?.content;
  if (typeof content !== "string" || content.trim() === "") {
    return res.status(400).json({ error: "content (string) required" });
  }
  try {
    const result = await pinJson(content);
    res.status(201).json(result);
  } catch (err) {
    res.status(502).json({ error: "IPFS pin failed", detail: String(err) });
  }
});
