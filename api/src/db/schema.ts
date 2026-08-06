import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const proposalsMeta = sqliteTable("proposals_meta", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  proposalId: integer("proposal_id").notNull().unique(),
  ipfsHash: text("ipfs_hash"),
  title: text("title").notNull(),
  summary: text("summary"),
  category: text("category"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const comments = sqliteTable("comments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  proposalId: integer("proposal_id").notNull(),
  author: text("author").notNull(),
  body: text("body").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const delegateProfiles = sqliteTable("delegate_profiles", {
  address: text("address").primaryKey(),
  ensName: text("ens_name"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  platform: text("platform"),
  twitter: text("twitter"),
});

export const notifications = sqliteTable("notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userAddress: text("user_address").notNull(),
  type: text("type").notNull(),
  proposalId: integer("proposal_id"),
  read: integer("read", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
