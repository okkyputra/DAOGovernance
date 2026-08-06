import { Header } from "@/components/Header";

export default function Treasury() {
  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
        <h1 className="text-xl font-semibold text-white">Treasury</h1>
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-5 text-sm text-slate-400">
          Treasury dashboard ships in Phase 6. Holdings, outflows, and related proposals will appear here.
        </div>
      </main>
    </>
  );
}
