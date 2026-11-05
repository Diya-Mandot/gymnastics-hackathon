"use client";

import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();

  function goBack() {
    if (window.history.length > 1) router.back();
    else router.push("/live");
  }

  return <button onClick={goBack} className="fixed left-4 top-20 z-[200] inline-flex items-center gap-2 rounded-full bg-red px-4 py-2.5 text-sm font-semibold text-white shadow-xl hover:bg-red-lit focus:outline-none focus:ring-2 focus:ring-red-lit focus:ring-offset-2 focus:ring-offset-paper sm:left-5" aria-label="Go back to the previous page">
    <span aria-hidden="true">←</span> Back
  </button>;
}
