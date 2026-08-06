import { config } from "./config";

interface ApiResult<T> {
  data?: T;
  error?: string;
}

export async function postProposalMeta(input: {
  proposalId: number;
  title: string;
  summary?: string;
  ipfsHash?: string;
}): Promise<ApiResult<unknown>> {
  try {
    const res = await fetch(`${config.apiUrl}/api/proposals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...input, category: "proposal" }),
    });
    if (!res.ok) return { error: `API ${res.status}` };
    return { data: await res.json() };
  } catch (err) {
    return { error: String(err) };
  }
}

export async function pinToIpfs(content: string): Promise<{ cid?: string; gatewayUrl?: string; error?: string }> {
  try {
    const res = await fetch(`${config.apiUrl}/api/ipfs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) return { error: `IPFS ${res.status}` };
    return await res.json();
  } catch (err) {
    return { error: String(err) };
  }
}

export async function addComment(proposalId: number, author: string, body: string) {
  const res = await fetch(`${config.apiUrl}/api/comments/${proposalId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ author, body }),
  });
  return res.ok ? res.json() : null;
}
