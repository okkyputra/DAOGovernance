import { sqlite } from "./index.js";

const DDL = `
CREATE TABLE IF NOT EXISTS proposals_meta (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  proposal_id INTEGER NOT NULL UNIQUE,
  ipfs_hash TEXT,
  title TEXT NOT NULL,
  summary TEXT,
  category TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  proposal_id INTEGER NOT NULL,
  author TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

CREATE TABLE IF NOT EXISTS delegate_profiles (
  address TEXT PRIMARY KEY,
  ens_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  platform TEXT,
  twitter TEXT
);

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_address TEXT NOT NULL,
  type TEXT NOT NULL,
  proposal_id INTEGER,
  read INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);
`;

export function migrate() {
  sqlite.exec(DDL);
}
