# API — Off-chain backend

Express + Drizzle + SQLite. Holds non-critical data only: proposal metadata, comments, delegate profiles, notifications. Nothing that affects on-chain outcomes.

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health` | liveness check |
| GET/POST | `/api/proposals` | list / create proposal meta |
| GET/PATCH | `/api/proposals/:proposalId` | read / update proposal meta |
| GET/POST | `/api/comments/:proposalId` | list / add comments |
| GET/PUT/DELETE | `/api/delegates/:address` | delegate profile CRUD (PUT upserts) |
| GET/POST | `/api/notifications` | list (by `?userAddress=`) / create notifications |
| POST | `/api/notifications/:id/read` | mark one notification read |
| POST | `/api/notifications/read-all` | mark all read for a user |
| POST | `/api/ipfs` | pin JSON to IPFS via Pinata, returns `{ cid, gatewayUrl }` |

## Usage

```bash
npm install
cp .env.example .env
npm run dev          # http://localhost:3001
npm test             # vitest, uses in-memory SQLite
npm run build        # tsc -> dist/
```

SQLite DB auto-creates tables at startup (see `src/db/migrate.ts`). Path from `DATABASE_URL` (default `./data/dao.db`), `:memory:` for tests.
