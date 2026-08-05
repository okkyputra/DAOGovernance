import { Header } from "@/components/Header";

const stats = [
  { label: "Total proposals", value: "0" },
  { label: "Active", value: "0" },
  { label: "Treasury value", value: "$0.00" },
  { label: "Voting power", value: "—" },
];

export default function Home() {
  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-lg border border-slate-800 bg-slate-900 p-5"
            >
              <p className="text-sm text-slate-400">{s.label}</p>
              <p className="mt-1 text-2xl font-semibold text-white">{s.value}</p>
            </div>
          ))}
        </div>

        <section className="rounded-lg border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-lg font-semibold text-white">Recent proposals</h2>
          <p className="mt-2 text-sm text-slate-400">
            No proposals yet. Connect a wallet to create the first one once the
            Governor contract is deployed.
          </p>
        </section>
      </main>
    </>
  );
}
