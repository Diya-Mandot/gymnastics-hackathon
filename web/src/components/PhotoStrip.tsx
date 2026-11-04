import Image from "next/image";

// Team, crowd and venue shots. The four profile photos are kept out so no face appears under two captions.
const photos = [
  { src: "/images/arena-crowd.jpg", alt: "The Huntsman Center crowd in red", caption: "Huntsman Center", w: 1.33 },
  { src: "/images/gymnast-leap.jpg", alt: "A Red Rocks gymnast in a split leap above a packed arena", caption: "Split leap", w: 1.5 },
  { src: "/images/dumke-team.jpg", alt: "The Red Rocks team outside the Dumke Gymnastics Center", caption: "Dumke Center", w: 0.8 },
  { src: "/images/team-huddle.jpg", alt: "Red Rocks gymnasts huddled with their coaches during a meet", caption: "Meet-day huddle", w: 1.15 },
  { src: "/images/trophies.jpg", alt: "Pac-12 championship trophies", caption: "Conference titles", w: 0.8 },
  { src: "/images/team-celebrate.jpg", alt: "Red Rocks gymnasts laughing and celebrating together", caption: "The team", w: 0.8 },
];

export function PhotoStrip() {
  const row = [...photos, ...photos]; // doubled for a seamless loop
  return (
    <div className="group relative overflow-hidden py-2" aria-label="Photos from Red Rocks meets">
      <div className="flex w-max animate-marquee gap-4 group-hover:[animation-play-state:paused]">
        {row.map((p, i) => (
          <figure key={i} className="relative h-[220px] shrink-0 overflow-hidden rounded-[18px] sm:h-[280px]" style={{ aspectRatio: p.w }} aria-hidden={i >= photos.length}>
            <Image src={p.src} alt={i < photos.length ? p.alt : ""} fill sizes="420px" className="object-cover" />
            <figcaption className="absolute bottom-3 left-3 rounded-full bg-paper/85 px-3 py-1.5 text-xs font-medium text-ink backdrop-blur">
              {p.caption}
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-paper to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-paper to-transparent" />
    </div>
  );
}
