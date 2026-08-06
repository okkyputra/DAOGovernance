import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createApp } from "./app.js";
import { migrate } from "./db/migrate.js";

let app: ReturnType<typeof createApp>;

beforeAll(() => {
  migrate();
  app = createApp();
});

describe("api", () => {
  it("reports health", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("creates and lists proposals", async () => {
    const created = await request(app)
      .post("/api/proposals")
      .send({ proposalId: 1, title: "Treasury spend", category: "treasury" });
    expect(created.status).toBe(201);
    expect(created.body.proposal.title).toBe("Treasury spend");

    const listed = await request(app).get("/api/proposals");
    expect(listed.status).toBe(200);
    expect(listed.body.proposals).toHaveLength(1);
  });

  it("rejects proposals without title", async () => {
    const res = await request(app).post("/api/proposals").send({ proposalId: 2 });
    expect(res.status).toBe(400);
  });

  it("adds and lists comments per proposal", async () => {
    const created = await request(app)
      .post("/api/comments/1")
      .send({ author: "0xabc", body: "support this" });
    expect(created.status).toBe(201);

    const listed = await request(app).get("/api/comments/1");
    expect(listed.status).toBe(200);
    expect(listed.body.comments).toHaveLength(1);
    expect(listed.body.comments[0].body).toBe("support this");
  });

  it("upserts delegate profiles", async () => {
    const first = await request(app)
      .put("/api/delegates/0xabc")
      .send({ bio: "founding member" });
    expect(first.status).toBe(200);
    expect(first.body.delegate.bio).toBe("founding member");

    const updated = await request(app)
      .put("/api/delegates/0xabc")
      .send({ bio: "v2 bio", twitter: "@abc" });
    expect(updated.status).toBe(200);
    expect(updated.body.delegate.bio).toBe("v2 bio");
    expect(updated.body.delegate.twitter).toBe("@abc");
  });

  it("manages notifications lifecycle", async () => {
    const created = await request(app)
      .post("/api/notifications")
      .send({ userAddress: "0xabc", type: "voting_closes_soon", proposalId: 1 });
    expect(created.status).toBe(201);
    expect(created.body.notification.read).toBe(false);

    const id = created.body.notification.id;
    const marked = await request(app).post(`/api/notifications/${id}/read`);
    expect(marked.body.notification.read).toBe(true);

    const listed = await request(app).get("/api/notifications?userAddress=0xabc");
    expect(listed.body.notifications).toHaveLength(1);
    expect(listed.body.notifications[0].read).toBe(true);
  });
});
