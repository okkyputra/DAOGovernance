"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchProposals, fetchProposal, fetchDelegates } from "@/lib/subgraph";

export function useProposals(state?: string) {
  return useQuery({
    queryKey: ["proposals", state ?? "all"],
    queryFn: () => fetchProposals(state),
    staleTime: 30_000,
    retry: 1,
  });
}

export function useProposal(id: string | undefined) {
  return useQuery({
    queryKey: ["proposal", id],
    queryFn: () => fetchProposal(id!),
    enabled: !!id,
    staleTime: 15_000,
    retry: 1,
  });
}

export function useDelegates() {
  return useQuery({
    queryKey: ["delegates"],
    queryFn: () => fetchDelegates(),
    staleTime: 60_000,
    retry: 1,
  });
}
