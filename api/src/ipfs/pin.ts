export interface PinnedResult {
  cid: string;
  gatewayUrl: string;
}

function gatewayUrl(cid: string): string {
  const gateway = process.env.IPFS_GATEWAY_URL ?? "https://ipfs.io";
  return `${gateway.replace(/\/$/, "")}/ipfs/${cid}`;
}

async function pinViaPinata(content: string): Promise<string> {
  const jwt = process.env.IPFS_PINATA_JWT;
  const url = process.env.IPFS_PINATA_URL ?? "https://api.pinata.cloud/pinning/pinJSONToIPFS";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pinataContent: content }),
  });
  if (!res.ok) {
    throw new Error(`Pinata pin failed: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as { IpfsHash?: string };
  return data.IpfsHash ?? "";
}

export async function pinJson(content: string): Promise<PinnedResult> {
  const cid = await pinViaPinata(content);
  return { cid, gatewayUrl: gatewayUrl(cid) };
}
