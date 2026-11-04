import Image from "next/image";
import type { Athlete } from "@/lib/types";
import { ChalkArc } from "./ChalkArc";

/**
 * Athlete image. Uses the organizer-supplied Red Rocks photo when set (always with a
 * visible demo-content credit), otherwise an initials square.
 */
export function AthletePortrait({ athlete, className = "", priority = false }: {
  athlete: Athlete;
  className?: string;
  priority?: boolean;
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
        <span className="absolute bottom-2.5 right-2.5 hidden rounded-full bg-paper/80 px-2.5 py-1 text-[10px] font-medium text-ink/80 backdrop-blur @[260px]:block">
          Real Red Rocks photo · name, story &amp; stats are demo content
        </span>
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
