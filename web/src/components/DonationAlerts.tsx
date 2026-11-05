"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLive } from "@/hooks/useLive";
import { useAudience } from "./AudienceProvider";

export const ALERT_STEP_KEY = "rtr:alert-step";
export const DEFAULT_ALERT_STEP = 50;

type Toast = { id: string; title: string; body: string; milestone: boolean };

const usd = (n: number) => `$${Math.round(n).toLocaleString()}`;

export function readAlertStep(): number {
  try {
    const v = Number(localStorage.getItem(ALERT_STEP_KEY));
    return v > 0 ? v : DEFAULT_ALERT_STEP;
  } catch {
    return DEFAULT_ALERT_STEP;
  }
}

/**
 * Live gift notifications for the WRTH team: one for every demo gift, and a milestone alert each time the
 * campaign total passes another $X (set on the admin page). Shown on the admin, demo-admin and revenue screens.
 */
export function DonationAlerts() {
  const pathname = usePathname();
  const { audience } = useAudience();
  const onAdminScreen = pathname.startsWith("/admin") || pathname.startsWith("/demo/admin");
  // Only admin screens subscribe to live gifts; public pages never open the extra connection.
  if (!onAdminScreen || !(audience?.group === "team" || pathname.startsWith("/demo/admin"))) return null;
  return <Alerts pathname={pathname} />;
}

function Alerts({ pathname }: { pathname: string }) {
  const { campaign, lastDonation, ready } = useLive();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seen = useRef<string | null>(null);
  const lastRaised = useRef<number | null>(null);


  useEffect(() => {
    if (!ready) return;
    const prev = lastRaised.current;
    lastRaised.current = campaign.raised;
    if (!lastDonation || seen.current === lastDonation.id) return;
    seen.current = lastDonation.id;
    if (prev === null) return; // don't alert for gifts that happened before this screen opened

    const next: Toast[] = [
      {
        id: lastDonation.id,
        title: `New gift: ${usd(lastDonation.amount)}`,
        body: `${lastDonation.supporterName} backed ${lastDonation.athleteName}. Total now ${usd(campaign.raised)}.`,
        milestone: false,
      },
    ];
    const step = readAlertStep();
    const crossed = Math.floor(campaign.raised / step) > Math.floor(prev / step);
    if (crossed) {
      next.push({
        id: `${lastDonation.id}-m`,
        title: `Milestone: ${usd(Math.floor(campaign.raised / step) * step)} raised`,
        body: `The campaign passed another ${usd(step)}. Revenue Intelligence counts it as collected fan funding.`,
        milestone: true,
      });
    }
    setToasts((t) => [...next, ...t].slice(0, 4));
    const ids = next.map((n) => n.id);
    setTimeout(() => setToasts((t) => t.filter((x) => !ids.includes(x.id))), 9000);
  }, [lastDonation, campaign.raised, ready]);

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[60] grid w-[min(360px,calc(100vw-32px))] gap-2" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`card animate-rise p-4 shadow-2xl ${t.milestone ? "!border-red" : ""}`}>
          <div className="flex items-start justify-between gap-3">
            <p className="font-semibold text-ink">{t.milestone ? "★ " : "● "}{t.title}</p>
            <button aria-label="Dismiss" className="text-muted hover:text-ink" onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))}>×</button>
          </div>
          <p className="mt-1 text-sm text-muted">{t.body}</p>
          {!pathname.startsWith("/admin/revenue") && (
            <Link href="/admin/revenue" className="mt-2 inline-block text-sm text-ink link">See it in Revenue</Link>
          )}
          <p className="mt-2 text-[11px] text-faint">Demo gift · no payment processed</p>
        </div>
      ))}
    </div>
  );
}
