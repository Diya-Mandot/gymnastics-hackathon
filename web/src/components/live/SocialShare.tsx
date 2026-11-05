"use client";

import { useState } from "react";
import { useArena } from "@/lib/arena";

export function SocialShare({ title, detail, entityId }: { title: string; detail: string; entityId: string }) {
  const { track } = useArena();
  const [status, setStatus] = useState("");
  async function share() {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350"><rect width="100%" height="100%" fill="#0f0e0d"/><rect x="55" y="55" width="970" height="1240" rx="42" fill="#181716" stroke="#cc0000" stroke-width="8"/><text x="110" y="180" fill="#ff4a3d" font-family="Arial" font-size="34" font-weight="700">ROCK THE ARENA</text><text x="110" y="430" fill="#f3efe8" font-family="Georgia" font-size="94">${title}</text><text x="110" y="550" fill="#a39d94" font-family="Arial" font-size="38">${detail}</text><text x="110" y="1130" fill="#f3efe8" font-family="Arial" font-size="42">Scan. Play. Unlock.</text><text x="110" y="1195" fill="#ff4a3d" font-family="Arial" font-size="30">ROCK THE ROUTINE</text></svg>`;
    const file = new File([svg], "rock-the-arena-share.svg", { type: "image/svg+xml" });
    try {
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ title: "Rock the Arena", text: `${title} ${detail}`, files: [file] });
      else { const url = URL.createObjectURL(file); const link = document.createElement("a"); link.href = url; link.download = file.name; link.click(); URL.revokeObjectURL(url); await navigator.clipboard?.writeText(window.location.origin + "/live"); }
      track("social_share", entityId, { amount: 25, once: true });
      setStatus("Share image ready - +25 Arena points and Social Amplifier badge earned.");
    } catch { setStatus("Share cancelled. Your reward was not claimed."); }
  }
  return <div><button onClick={share} className="btn btn-red w-full">Create & share my Arena moment</button>{status && <p className="mt-2 text-center text-xs text-muted" role="status">{status}</p>}</div>;
}
