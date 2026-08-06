import { Header } from "@/components/Header";
import { ProposalsPage } from "@/components/ProposalsPage";

export default function Proposals() {
  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
        <ProposalsPage />
      </main>
    </>
  );
}
