"use client";

import { useEffect, useState } from "react";
import { ALERT_STEP_KEY, DEFAULT_ALERT_STEP, readAlertStep } from "./DonationAlerts";

/** Lets the team choose how often a milestone alert fires: "every $X raised". */
export function AlertStepSetting() {
  const [step, setStep] = useState(DEFAULT_ALERT_STEP);
  useEffect(() => setStep(readAlertStep()), []);
  return (
    <label className="flex items-center gap-2 text-sm text-muted">
      Alert every
      <span className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-faint">$</span>
        <input
          type="number"
          min={10}
          step={10}
          value={step}
          onChange={(e) => {
            const v = Math.max(10, Math.round(Number(e.target.value) || DEFAULT_ALERT_STEP));
            setStep(v);
            try { localStorage.setItem(ALERT_STEP_KEY, String(v)); } catch {}
          }}
          className="input !h-9 !w-28 !pl-6 !pr-3"
          aria-label="Milestone alert amount"
        />
      </span>
      raised
    </label>
  );
}
