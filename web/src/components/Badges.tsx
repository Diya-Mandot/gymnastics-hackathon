import { featureTypeLabels } from "@/lib/labels";
import type { FeatureType } from "@/lib/types";

export function FeatureBadge({ type }: { type: FeatureType }) {
  return (
    <span className={`tag ${type === "fan-favorite" ? "!bg-ink !text-paper" : "!bg-red-soft !text-red-dark"}`}>
      {featureTypeLabels[type]}
    </span>
  );
}

export function DemoBadge({ label = "Demo profile" }: { label?: string }) {
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
