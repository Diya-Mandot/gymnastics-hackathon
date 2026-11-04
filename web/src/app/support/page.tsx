import Image from "next/image";
import { athletes, supporterTiers } from "@/lib/seed";
import { AthleteCard } from "@/components/AthleteCard";
import { FindYourRoutine } from "./FindYourRoutine";

export const metadata = { title: "Support" };

export default function SupportIndex() {
  return (
    <>
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-12 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:pt-16">
        <div>
          <p className="text-sm font-semibold text-red-lit">For fans and supporters</p>
          <h1 className="mt-5 font-display text-[clamp(44px,6vw,80px)] text-ink">
            Join the routine. Back the athlete. <em>Be part of the impact.</em>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
            Give once, join monthly, or just share a note. 100% of contributions support Utah gymnasts through Who Rocks the
            House.
          </p>
        </div>
        <figure>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[28px]">
            <Image src="/images/fans-utes.jpg" alt="Fans in red spelling U-T-E-S with raised arms under arena lights" fill priority sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" />
          </div>
          <figcaption className="mt-3 text-right text-xs text-faint">Utah fans under the lights</figcaption>
        </figure>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-8">
        <FindYourRoutine />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-8">
        <h2 className="font-display text-5xl text-ink">Choose who to back</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {athletes.map((a) => <AthleteCard key={a.slug} athlete={a} />)}
        </div>
      </section>

      <section className="border-t border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-8">
          <p className="text-sm font-semibold text-red-lit">Supporter tiers</p>
          <h2 className="mt-3 font-display text-5xl text-ink sm:text-6xl">Give once, or stay in the routine.</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {supporterTiers.map((t, i) => (
              <div key={t.id} className={`rounded-[20px] border p-6 ${i === 1 ? "border-ink bg-ink text-paper" : "border-line bg-paper"}`}>
                <p className={i === 1 ? "text-paper/60" : "text-muted"}>{t.name}</p>
                <p className="mt-1 font-display text-5xl font-medium">{t.price}</p>
                <ul className={`mt-5 space-y-2 border-t pt-5 text-sm ${i === 1 ? "border-paper/15 text-paper/80" : "border-line text-muted"}`}>
                  {t.perks.map((p) => <li key={p}>{p}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted">
            Plus premium celebration videos: a 15–30 second birthday, graduation, or good-luck message from an athlete.
          </p>
        </div>
      </section>
    </>
  );
}
