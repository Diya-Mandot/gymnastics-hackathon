"use client";

import { useState } from "react";
import { CampaignProgress } from "@/components/CampaignProgress";
import { useLive } from "@/hooks/useLive";
import { tasks } from "@/lib/seed";

const tabs = ["Overview", "Tasks", "Content", "Agreement", "Results"] as const;
type Tab = (typeof tabs)[number];

const content = [
  { title: "Avery’s 45s story", kind: "Video", state: "Approved" },
  { title: "Meet-night QR poster", kind: "Print", state: "Approved" },
  { title: "Instagram Reel cover", kind: "Social", state: "Awaiting athlete approval" },
  { title: "Sponsor offer card", kind: "Social", state: "Draft" },
];

const results = [
  ["QR scans", "1,284"],
  ["Sponsor offer claims", "212"],
  ["Fan actions", "638"],
  ["Story video views", "18.4K"],
  ["Event RSVPs", "146"],
  ["Est. local leads", "90"],
];

export function Workspace() {
  const [tab, setTab] = useState<Tab>("Overview");
  const { campaign } = useLive();

  return (
    <div className="card mt-8 overflow-hidden">
      <div role="tablist" aria-label="Campaign workspace" className="flex gap-6 overflow-x-auto border-b border-line px-6">
        {tabs.map((t) => (
          <button
            key={t}
            role="tab"
            id={`tab-${t}`}
            aria-selected={tab === t}
            aria-controls={`panel-${t}`}
            onClick={() => setTab(t)}
            className={`relative shrink-0 py-4 text-sm font-medium transition-colors ${tab === t ? "text-ink" : "text-muted hover:text-ink"}`}
          >
            {t}
            {tab === t && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-red" />}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="p-6 sm:p-8">
        {tab === "Overview" && (
          <div className="grid gap-10 lg:grid-cols-2">
            <CampaignProgress campaign={campaign} />
            <dl className="divide-y divide-line border-y border-line text-sm">
              {[
                ["Athlete", "Avery Neff"],
                ["Sponsor", `${campaign.sponsorName} (fictional)`],
                ["Community partner", campaign.partner],
                ["Package", "Impact Routine · $15,000"],
                ["Meet-night activation", "Nov 21, Huntsman Center"],
                ["Status", "Live"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-3">
                  <dt className="text-muted">{k}</dt>
                  <dd className="text-right text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
        {tab === "Tasks" && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="text-muted">
                <tr className="border-b border-line">
                  {["Task", "Owner", "Due", "Status", "Approval"].map((h) => <th key={h} scope="col" className="py-3 pr-4 font-normal">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {tasks.map((t) => (
                  <tr key={t.id} className="border-b border-line last:border-0">
                    <td className="py-3 pr-4 text-ink">{t.title}</td>
                    <td className="py-3 pr-4 text-muted">{t.owner}</td>
                    <td className="py-3 pr-4 text-muted">{t.due}</td>
                    <td className="py-3 pr-4 capitalize text-ink">{t.status.replace("-", " ")}</td>
                    <td className="py-3 pr-4 capitalize text-muted">{t.approval.replace("-", " ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tab === "Content" && (
          <ul className="divide-y divide-line border-y border-line">
            {content.map((c) => (
              <li key={c.title} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="text-ink">{c.title}</p>
                  <p className="text-xs text-faint">{c.kind} · made in Adobe Creative Cloud</p>
                </div>
                <span className={`tag !text-[11px] ${c.state === "Approved" ? "!bg-green/15 !text-green" : ""}`}>{c.state}</span>
              </li>
            ))}
          </ul>
        )}
        {tab === "Agreement" && (
          <div className="max-w-2xl space-y-3 leading-relaxed text-ink">
            <p>Sponsor funds a $15,000 Impact Routine. Contributions support Utah gymnasts through Who Rocks the House and their participation in charitable, civic, educational, and community-focused activities.</p>
            <p>The athlete reviews and approves every public post, video and caption before it goes live. Nothing is published automatically.</p>
            <p className="text-sm text-faint">Demo summary, not a legal agreement.</p>
          </div>
        )}
        {tab === "Results" && (
          <div>
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[16px] border border-line bg-line sm:grid-cols-3">
              {results.map(([k, v]) => (
                <div key={k} className="bg-surface p-5">
                  <dd className="font-display text-5xl font-medium text-ink">{v}</dd>
                  <dt className="mt-1 text-sm text-muted">{k}</dt>
                </div>
              ))}
            </dl>
            <p className="mt-5 border-l-2 border-green pl-4 text-ink">
              Renewal recommendation: strong. Family offer claims beat the target by 41%. Suggest a spring Impact Routine with Avery and Camie.
            </p>
            <p className="mt-3 text-xs text-faint">Illustrative sample results for the demo.</p>
          </div>
        )}
      </div>
    </div>
  );
}
