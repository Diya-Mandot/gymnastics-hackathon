import { featureTypeLabels } from "@/lib/labels";
import type { FeatureType } from "@/lib/types";

export function FeatureBadge({ type }: { type: FeatureType }) {
  return (
    <span className={`tag ${type === "fan-favorite" ? "!bg-ink !text-paper" : "!bg-red-soft !text-red-dark"}`}>
      {featureTypeLabels[type]}
    </span>
  );
}

export function DemoBadge({ label = "Sample campaign" }: { label?: string }) {
  return <span className="tag !bg-surface/90 !font-medium !text-muted">{label}</span>;
}

export function NoPaymentNotice({ className = "" }: { className?: string }) {
  return (
    <p className={`flex items-center gap-2 text-xs text-muted ${className}`}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z" stroke="currentColor" strokeWidth="2" />
      </svg>
      Demo contribution · no payment will be processed
    </p>
  );
}

/**
 * What kind of data you're looking at. Text + shape, never colour alone.
 * fictional: made-up people or businesses · simulated: demo actions (no real payment, email or signature)
 * estimate: modelled numbers, not results · live: real records written by this app (demo gifts, deal changes)
 */
const dataKinds = {
  fictional: { label: "Fictional", mark: "◇" },
  simulated: { label: "Simulated", mark: "○" },
  estimate: { label: "Estimate", mark: "≈" },
  live: { label: "Live record", mark: "●" },
} as const;

export type DataKind = keyof typeof dataKinds;

export function DataTag({ kind, children }: { kind: DataKind; children?: React.ReactNode }) {
  const k = dataKinds[kind];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${kind === "live" ? "border-green/50 text-green" : "border-line text-muted"}`}
      title={`${k.label} data`}
    >
      <span aria-hidden="true">{k.mark}</span>
      {children ?? k.label}
    </span>
  );
}
