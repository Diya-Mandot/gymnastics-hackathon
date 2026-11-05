"use client";

import { AssetStudio } from "@/components/AssetStudio";
import { useEffect, useState } from "react";
import { AiSections, SourceTag, Sparkle } from "@/components/AiSections";
import { useTextStream } from "@/hooks/useTextStream";
import type { Role } from "@/hooks/useRole";
import { MEDIA_KIT_SECTIONS } from "@/lib/ai/mediaKit";
import { campaignTypeLabels } from "@/lib/labels";
import type { Athlete, CampaignType } from "@/lib/types";

export type KitStatus = "none" | "pending" | "approved" | "changes-requested";
type SavedKit = { text: string; status: KitStatus; source: "live" | "sample" | null; at: string };

const kitKey = (slug: string) => `rtr:mediakit:${slug}`;

export function loadKit(slug: string): SavedKit | null {
  try {
    const raw = localStorage.getItem(kitKey(slug));
    return raw ? (JSON.parse(raw) as SavedKit) : null;
  } catch {
    return null;
  }
}

function saveKit(slug: string, kit: SavedKit) {
  try {
    localStorage.setItem(kitKey(slug), JSON.stringify(kit));
  } catch {}
}

export function useKitStatus(slug: string): KitStatus {
  const [status, setStatus] = useState<KitStatus>("none");
  useEffect(() => setStatus(loadKit(slug)?.status ?? "none"), [slug]);
  return status;
}

const FORMATS: CampaignType[] = ["video", "social", "community-event", "meet-night", "in-person"];

export function BrandStudio({ athlete, role }: { athlete: Athlete; role: Role }) {
  const [transcript, setTranscript] = useState(athlete.storyTranscript);
  const [interests, setInterests] = useState("");
  const [prefs, setPrefs] = useState<CampaignType[]>(athlete.campaignTypes);
  const [kitStatus, setKitStatus] = useState<KitStatus>("none");
  const { status, text, source, start, setText, setStatus } = useTextStream("/api/media-kit");

  // Restore a saved kit for this athlete.
  useEffect(() => {
    const saved = loadKit(athlete.slug);
    if (saved) {
      setText(saved.text);
      setStatus("done");
      setKitStatus(saved.status);
    }
  }, [athlete.slug, setText, setStatus]);

  async function generate() {
    setKitStatus("none");
    const out = await start({ athleteSlug: athlete.slug, transcript, interests, preferences: prefs });
    if (out) {
      saveKit(athlete.slug, { text: out.text, status: "pending", source: out.source, at: new Date().toISOString() });
      setKitStatus("pending");
    }
  }

  function decide(next: KitStatus) {
    setKitStatus(next);
    saveKit(athlete.slug, { text, status: next, source, at: new Date().toISOString() });
  }

  const streaming = status === "streaming";

  return (
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      {/* Inputs */}
      <section className="card h-fit p-6" aria-label="Media kit inputs">
        <p className="flex items-center gap-2 text-sm font-semibold text-red-lit">
          <Sparkle /> AI Brand Studio
        </p>
        <h2 className="mt-2 font-display text-3xl text-ink">
          Turn {athlete.firstName}’s story into a <em>media kit.</em>
        </h2>
        <label className="mt-6 block">
          <span className="text-sm text-muted">Story Seed transcript</span>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={7}
            className="mt-2 w-full rounded-[16px] border border-line bg-paper p-4 text-[15px] leading-relaxed text-ink outline-none focus:border-ink"
          />
        </label>
        <label className="mt-4 block">
          <span className="text-sm text-muted">Interests outside the gym (optional)</span>
          <input
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="e.g. baking, hiking the Wasatch, little sister’s soccer games"
            className="input mt-2"
          />
        </label>
        <fieldset className="mt-4">
          <legend className="text-sm text-muted">Campaign formats she’s open to</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {FORMATS.map((f) => {
              const on = prefs.includes(f);
              return (
                <button
                  key={f}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setPrefs((p) => (on ? p.filter((x) => x !== f) : [...p, f]))}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${on ? "border-ink bg-ink text-paper" : "border-line text-muted hover:text-ink"}`}
                >
                  {campaignTypeLabels[f]}
                </button>
              );
            })}
          </div>
        </fieldset>
        <p className="mt-5 text-xs text-faint">
          Uses only approved profile data: reach, engagement, Utah audience share, causes and past work. Demo profile data.
        </p>
        <button onClick={generate} disabled={streaming || !transcript.trim()} className="btn btn-red mt-5 w-full">
          {streaming ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
              Building media kit…
            </>
          ) : (
            <>
              <Sparkle /> {text ? "Regenerate media kit" : "Generate media kit"}
            </>
          )}
        </button>
      </section>

      {/* Output + approval */}
      <section className="card p-6 sm:p-8" aria-label="Generated media kit" aria-live="polite" aria-busy={streaming}>
        {!text && status !== "error" && (
          <div className="grid gap-3 sm:grid-cols-2">
            {MEDIA_KIT_SECTIONS.map((s) => (
              <div key={s} className="rounded-[14px] border border-dashed border-line px-4 py-6 text-sm text-faint">
                {s}
              </div>
            ))}
          </div>
        )}
        {status === "error" && <p role="alert" className="text-sm text-red-lit">Couldn’t reach the drafting service. Try again.</p>}
        {text && (
          <>
            <div className="mb-6 flex flex-wrap items-center gap-2 text-xs">
              <ApprovalTag status={kitStatus} name={athlete.firstName} streaming={streaming} />
              <SourceTag source={source} />
            </div>
            <AiSections text={text} streaming={streaming} wide={["Sponsor-ready bio", "Sponsor pitch", "Recommended package"]} />
            {!streaming && kitStatus !== "none" && (
              <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-line pt-6">
                {role === "athlete" ? (
                  kitStatus === "approved" ? (
                    <p className="text-sm text-green">✓ You approved this media kit. WRTH can now share it with sponsors.</p>
                  ) : (
                    <>
                      <button className="btn btn-red" onClick={() => decide("approved")}>Approve media kit</button>
                      <button className="btn btn-line" onClick={() => decide("changes-requested")}>Request changes</button>
                    </>
                  )
                ) : kitStatus === "approved" ? (
                  role === "staff" ? (
                    <button className="btn btn-ink" onClick={() => alert("Demo: media kit shared with the sponsor pipeline. Nothing is emailed automatically.")}>
                      Share with sponsors
                    </button>
                  ) : (
                    <p className="text-sm text-muted">Approved by {athlete.firstName}. A WRTH manager can share it with sponsors.</p>
                  )
                ) : (
                  <p className="text-sm text-muted">
                    {kitStatus === "changes-requested" ? `${athlete.firstName} requested changes. Edit inputs and regenerate.` : `Waiting for ${athlete.firstName} to approve. Switch to the athlete role to approve.`}
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </section>
      <AssetStudio athlete={athlete} canApprove={role === "athlete"} />
    </div>
  );
}

function ApprovalTag({ status, name, streaming }: { status: KitStatus; name: string; streaming: boolean }) {
  if (streaming) return <span className="tag !bg-red-soft !text-red-dark">Drafting…</span>;
  if (status === "approved") return <span className="tag !bg-green/15 !text-green">Approved by {name}</span>;
  if (status === "changes-requested") return <span className="tag">Changes requested by {name}</span>;
  return <span className="tag !bg-red-soft !text-red-dark">Draft · awaiting {name}’s approval</span>;
}
