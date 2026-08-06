import { Header } from "@/components/Header";
import { TreasuryDashboard } from "@/components/TreasuryDashboard";

export default function Treasury() {
  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
        <h1 className="text-xl font-semibold text-white">Treasury</h1>
        <TreasuryDashboard />
      </main>
    </>
  );
}
