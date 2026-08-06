import { Header } from "@/components/Header";
import { ProposalDetail } from "@/components/ProposalDetail";

export default function ProposalPage() {
  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
        <ProposalDetail />
      </main>
    </>
  );
}
