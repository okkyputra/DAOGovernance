import { describe, it, expect } from "vitest";

import { comments, delegateProfiles, notifications, proposalsMeta } from "./schema.js";

describe("schema", () => {
  it("defines the off-chain tables from the build plan", () => {
    expect(Object.keys(proposalsMeta)).not.toHaveLength(0);
    expect(Object.keys(comments)).not.toHaveLength(0);
    expect(Object.keys(delegateProfiles)).not.toHaveLength(0);
    expect(Object.keys(notifications)).not.toHaveLength(0);
  });

  it("exposes the planned columns", () => {
    expect("ipfsHash" in proposalsMeta).toBe(true);
    expect("proposalId" in comments).toBe(true);
    expect("ensName" in delegateProfiles).toBe(true);
    expect("read" in notifications).toBe(true);
  });
});
