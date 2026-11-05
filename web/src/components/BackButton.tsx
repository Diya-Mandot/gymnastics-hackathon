"use client";

import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();

  function goBack() {
    if (window.history.length > 1) router.back();
    else router.push("/live");
  }

  return <button onClick={goBack} className="fixed bottom-20 left-4 z-50 inline-flex items-center gap-2 rounded-full border border-line bg-surface/95 px-4 py-2.5 text-sm font-semibold text-ink shadow-lg backdrop-blur hover:border-red focus:outline-none focus:ring-2 focus:ring-red-lit sm:bottom-5 sm:left-5" aria-label="Go back to the previous page">
    <span aria-hidden="true">←</span> Back
  </button>;
}
