import Image from "next/image";
import Link from "next/link";
import { roster } from "@/lib/roster";

/** The full real 2027 roster with official headshots. Featured athletes link to their campaign profile. */
export function RosterGrid() {
  return (
    <section id="full-roster" className="mx-auto max-w-7xl scroll-mt-16 px-4 pb-20 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-t border-line pt-14">
        <div>
          <p className="text-sm font-semibold text-red-lit">2027 Utah Red Rocks</p>
          <h2 className="mt-2 font-display text-5xl text-ink">The whole <em>team.</em></h2>
          <p className="mt-3 max-w-2xl text-muted">
            All {roster.length} gymnasts on this season’s roster. Photos, hometowns and highlights are from Utah Athletics.
          </p>
        </div>
        <a href="https://utahutes.com/sports/womens-gymnastics/roster" target="_blank" rel="noreferrer" className="btn btn-line text-sm">
          Official roster <span aria-hidden="true">↗</span>
        </a>
      </div>

      <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {roster.map((a) => {
          const href = a.featured ? `/athletes/${a.featured}` : a.profileUrl;
          const external = !a.featured;
          return (
            <li key={a.slug}>
              <a
                href={href}
                {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                className="group card block overflow-hidden p-2 transition-colors hover:border-ink/30 focus-visible:border-ink"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-[14px] bg-white">
                  <Image
                    src={a.photo}
                    alt={`${a.name}, Utah Red Rocks gymnast`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover object-[50%_20%] transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  {a.featured && (
                    <span className="absolute left-2 top-2 rounded-full bg-red px-2.5 py-1 text-[10px] font-semibold text-white">Campaign live</span>
                  )}
                </div>
                <div className="px-1.5 pb-1.5 pt-3">
                  <p className="font-display text-xl leading-tight text-ink">{a.name}</p>
                  <p className="mt-0.5 text-xs text-muted">{a.classYear} · {a.hometown}</p>
                  <p className="mt-2 text-xs leading-snug text-ink/80">{a.highlight}</p>
                  <p className="mt-2 text-xs font-medium text-red-lit">
                    {a.featured ? "See her campaign →" : <>Official bio <span aria-hidden="true">↗</span></>}
                  </p>
                </div>
              </a>
            </li>
          );
        })}
      </ul>
      <p className="mt-6 text-xs text-faint">
        “Campaign live” athletes have a sample campaign on this site. <Link href="/support#cards" className="link">Collect every card</Link>.
      </p>
    </section>
  );
}
