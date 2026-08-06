import { Header } from "@/components/Header";

export default function NewProposal() {
  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
        <h1 className="text-xl font-semibold text-white">Create proposal</h1>
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-5 text-sm text-slate-400">
          Proposal wizard ships in Phase 5. You&apos;ll be able to choose an action type, build calldata, write a
          description, and submit on-chain.
        </div>
      </main>
    </>
  );
}
