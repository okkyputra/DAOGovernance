import { describe, it, expect } from "vitest";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";

import * as schema from "./schema.js";

const sqlite = new Database(":memory:");
const db = drizzle(sqlite, { schema });
sqlite.exec(`
  CREATE TABLE proposals_meta (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    proposal_id INTEGER NOT NULL UNIQUE,
    ipfs_hash TEXT, title TEXT NOT NULL, summary TEXT, category TEXT,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    proposal_id INTEGER NOT NULL, author TEXT NOT NULL, body TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE delegate_profiles (
    address TEXT PRIMARY KEY, ens_name TEXT, bio TEXT, avatar_url TEXT,
    platform TEXT, twitter TEXT
  );
  CREATE TABLE notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_address TEXT NOT NULL, type TEXT NOT NULL, proposal_id INTEGER,
    read INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL
  );
`);

describe("schema", () => {
  it("defines the off-chain tables from the build plan", () => {
    expect(Object.keys(schema.proposalsMeta)).not.toHaveLength(0);
    expect(Object.keys(schema.comments)).not.toHaveLength(0);
    expect(Object.keys(schema.delegateProfiles)).not.toHaveLength(0);
    expect(Object.keys(schema.notifications)).not.toHaveLength(0);
  });

  it("exposes the planned columns", () => {
    expect("ipfsHash" in schema.proposalsMeta).toBe(true);
    expect("proposalId" in schema.comments).toBe(true);
    expect("ensName" in schema.delegateProfiles).toBe(true);
    expect("read" in schema.notifications).toBe(true);
  });

  it("inserts and reads a comment round-trip", async () => {
    const [row] = await db
      .insert(schema.comments)
      .values({ proposalId: 1, author: "0xabc", body: "hello" })
      .returning();
    expect(row.author).toBe("0xabc");
    expect(row.body).toBe("hello");
  });
});
