import Link from "next/link";
import { Header } from "@/components/Header";
import { ProposalList } from "@/components/ProposalList";
import { StatCards } from "@/components/StatCards";
import { NotDeployedNotice } from "@/components/VotingPowerCard";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function Home() {
  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6">
        <ErrorBoundary>
          <NotDeployedNotice />
          <StatCards />
        </ErrorBoundary>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recent proposals</h2>
            <Link href="/proposals" className="text-sm text-emerald-400 hover:underline">
              View all →
            </Link>
          </div>
          <ErrorBoundary>
            <ProposalList />
          </ErrorBoundary>
        </section>
      </main>
    </>
  );
}
