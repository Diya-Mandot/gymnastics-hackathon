import Image from "next/image";
import type { Athlete } from "@/lib/types";
import { ChalkArc } from "./ChalkArc";

/**
 * Athlete image. Uses the organizer-supplied Red Rocks photo when set (always with a
 * visible demo-content credit), otherwise an initials square.
 */
export function AthletePortrait({ athlete, className = "", priority = false, credit = true }: {
  athlete: Athlete;
  className?: string;
  priority?: boolean;
  /** Hide the on-photo credit when the surrounding layout states it in text instead. */
  credit?: boolean;
}) {
  // Callers either pass `absolute inset-0` or an explicit size; only default to relative for the latter.
  const position = /\babsolute\b/.test(className) ? "" : "relative";
  const [bg, fg] = athlete.palette;
  const initials = athlete.name.split(" ").map((p) => p[0]).join("");

  if (athlete.photo) {
    return (
      <div className={`${position} @container overflow-hidden ${className}`}>
        <Image
          src={athlete.photo}
          alt={`Red Rocks gymnast shown on the ${athlete.name} demo profile`}
          fill
          priority={priority}
          className="object-cover"
          style={{ objectPosition: athlete.photoFocus ?? "50% 30%" }}
          sizes="(max-width: 768px) 100vw, 40vw"
        />
        {credit && <span className="absolute right-2.5 top-2.5 hidden rounded-full bg-paper/80 px-2.5 py-1 text-[10px] font-medium text-ink/80 backdrop-blur @[220px]:block">
          Real photo · demo profile
        </span>}
      </div>
    );
  }

  return (
    <div className={`${position} @container overflow-hidden ${className}`} style={{ background: bg }} aria-hidden="true">
      <ChalkArc className="absolute inset-x-[6%] top-[14%] h-[55%] w-[88%] opacity-35" dashed />
      <span
        className="absolute inset-0 grid place-items-center font-display text-[40cqw] italic tracking-[-0.02em]"
        style={{ color: fg }}
      >
        {initials}
      </span>
    </div>
  );
}
