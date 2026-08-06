import { Header } from "@/components/Header";
import { DelegatesPage } from "@/components/DelegatesPage";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function Delegates() {
  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
        <ErrorBoundary>
          <DelegatesPage />
        </ErrorBoundary>
      </main>
    </>
  );
}
