import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

export const proposalsMeta = pgTable("proposals_meta", {
  id: serial("id").primaryKey(),
  proposalId: integer("proposal_id").notNull().unique(),
  ipfsHash: text("ipfs_hash"),
  title: text("title").notNull(),
  summary: text("summary"),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  proposalId: integer("proposal_id").notNull(),
  author: text("author").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const delegateProfiles = pgTable("delegate_profiles", {
  address: text("address").primaryKey(),
  ensName: text("ens_name"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  platform: text("platform"),
  twitter: text("twitter"),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userAddress: text("user_address").notNull(),
  type: text("type").notNull(),
  proposalId: integer("proposal_id"),
  read: boolean("read").default(false),
});
