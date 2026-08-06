"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAccount } from "wagmi";
import { config } from "@/lib/config";
import { shortAddress } from "@/lib/format";

interface CommentEntity {
  id: number;
  proposalId: number;
  author: string;
  body: string;
  createdAt: string;
}

async function fetchComments(proposalId: number): Promise<CommentEntity[]> {
  const res = await fetch(`${config.apiUrl}/api/comments/${proposalId}`);
  if (!res.ok) throw new Error(`comments ${res.status}`);
  const data = (await res.json()) as { comments: CommentEntity[] };
  return data.comments ?? [];
}

async function postComment(proposalId: number, author: string, body: string): Promise<CommentEntity> {
  const res = await fetch(`${config.apiUrl}/api/comments/${proposalId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ author, body }),
  });
  if (!res.ok) throw new Error(`comment post ${res.status}`);
  const data = (await res.json()) as { comment: CommentEntity };
  return data.comment;
}

export function CommentSection({ proposalId }: { proposalId: number }) {
  const { address } = useAccount();
  const [body, setBody] = useState("");
  const queryClient = useQueryClient();

  const { data: comments, isLoading } = useQuery({
    queryKey: ["comments", proposalId],
    queryFn: () => fetchComments(proposalId),
  });

  const mutation = useMutation({
    mutationFn: () => postComment(proposalId, address ?? "anonymous", body),
    onSuccess: () => {
      setBody("");
      queryClient.invalidateQueries({ queryKey: ["comments", proposalId] });
    },
  });

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900 p-5">
      <h2 className="mb-3 text-sm font-semibold text-slate-300">Discussion</h2>

      {isLoading && <p className="text-xs text-slate-500">Loading comments…</p>}

      {comments && comments.length === 0 && (
        <p className="mb-4 text-xs text-slate-500">No comments yet. Start the discussion.</p>
      )}

      {comments && comments.length > 0 && (
        <div className="mb-4 space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="rounded-lg border border-slate-800 bg-slate-950 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-emerald-400">{shortAddress(c.author)}</span>
                <span className="text-xs text-slate-600">
                  {new Date(c.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-300">{c.body}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={address ? "Add a comment…" : "Connect wallet to comment…"}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-600 outline-none focus:border-emerald-500"
        />
        <button
          onClick={() => mutation.mutate()}
          disabled={!address || !body.trim() || mutation.isPending}
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-emerald-400 hover:bg-slate-700 disabled:opacity-40"
        >
          {mutation.isPending ? "Posting…" : "Post"}
        </button>
      </div>
    </section>
  );
}
