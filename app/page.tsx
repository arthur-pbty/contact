import { Suspense } from "react";
import ContactPageClient from "./contact-page-client";

function LoadingContact() {
  return (
    <div className="mx-auto w-full max-w-[700px] px-4 py-10 sm:px-6 sm:py-14">
      <div className="animate-pulse rounded-3xl border border-white/40 bg-white/70 p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900/70">
        <div className="h-4 w-36 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mt-4 h-8 w-56 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mt-3 h-4 w-64 rounded bg-slate-200 dark:bg-slate-700" />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="w-full">
      <Suspense fallback={<LoadingContact />}>
        <ContactPageClient />
      </Suspense>
    </main>
  );
}
