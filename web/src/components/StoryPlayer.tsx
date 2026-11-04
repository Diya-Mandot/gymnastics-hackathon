"use client";

import { useState } from "react";
import type { Athlete } from "@/lib/types";
import { AthletePortrait } from "./AthletePortrait";

/** Story Seed video slot. Shows the transcript until the 45s edit from creative is dropped in at athlete.storyUrl. */
export function StoryPlayer({ athlete }: { athlete: Athlete }) {
  const [open, setOpen] = useState(false);

  if (open && athlete.storyUrl) {
    return (
      <div className="overflow-hidden rounded-[20px] bg-black">
        <video src={athlete.storyUrl} controls autoPlay playsInline className="aspect-video w-full" />
      </div>
    );
  }

  return (
    <div className="card grid min-h-[340px] overflow-hidden p-3 sm:grid-cols-[0.9fr_1.1fr]">
      <div className="relative min-h-[220px] overflow-hidden rounded-[14px]">
        <AthletePortrait athlete={athlete} className="absolute inset-0" />
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="absolute bottom-4 left-4 grid h-14 w-14 place-items-center rounded-full bg-surface text-ink shadow-[0_8px_24px_-8px_rgb(28_26_23/0.4)] transition-transform hover:scale-105"
            aria-label={`Play ${athlete.firstName}'s story`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 4.5v15l13-7.5-13-7.5Z" fill="currentColor" />
            </svg>
          </button>
        )}
      </div>
      <div className="flex flex-col justify-center p-5 sm:p-7">
        <p className="text-sm font-semibold text-red-lit">Story Seed · 45 seconds</p>
        {!open ? (
          <>
            <p className="mt-3 font-display text-4xl text-ink">Why confidence matters to {athlete.firstName}</p>
            <button onClick={() => setOpen(true)} className="mt-6 self-start text-sm font-semibold text-ink link">
              Read the transcript
            </button>
          </>
        ) : (
          <>
            <p className="mt-3 text-lg leading-relaxed text-ink">“{athlete.storyTranscript}”</p>
            <p className="mt-4 text-xs text-faint">Video edit in production with the creative team.</p>
            <button onClick={() => setOpen(false)} className="mt-4 self-start text-sm text-muted link">Close</button>
          </>
        )}
      </div>
    </div>
  );
}
