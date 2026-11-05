import Link from "next/link";
import { HeroLive } from "@/components/HeroLive";
import { PageHero } from "@/components/PageHero";
import { PhotoStrip } from "@/components/PhotoStrip";
import { athletes, fanExperiences, supporterTiers, unlockLabel } from "@/lib/seed";
import { AthleteCard } from "@/components/AthleteCard";
import { FindYourRoutine } from "./FindYourRoutine";
import { SupporterOffers, SupporterWelcome } from "./SupporterHub";
import { CardCollection } from "@/components/CardCollection";

export const metadata = { title: "Support" };

export default function SupportIndex() {
  return (
    <>
      <PageHero
        image="/images/fan-signs-2.jpg"
        alt="A family with handmade Red Rocks signs in the Huntsman Center stands"
        eyebrow="For fans and supporters"
        title={<>Back the athlete. <em>Be part of the impact.</em></>}
        focus="center 35%"
        size="lg"
        actions={
          <>
            <Link href="/support/avery" className="btn btn-red">Give $10 demo</Link>
            <a href="#find" className="btn btn-line">Find your routine</a>
          </>
        }
        aside={
          <div className="lg:w-[360px]">
            <HeroLive />
          </div>
        }
      >
        Give once, join monthly, or just share a note. 100% of contributions support Utah gymnasts through Who Rocks the House.
      </PageHero>

      <section className="pb-14 pt-2">
        <PhotoStrip />
      </section>

      <div className="px-4 sm:px-8">
        <SupporterWelcome />
      </div>

      <section id="find" className="mx-auto max-w-7xl scroll-mt-16 px-4 pb-20 sm:px-8">
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
          <div className="mt-10 rounded-[20px] border border-line bg-paper p-6 sm:p-8">
            <p className="label !text-gold">Monthly supporters</p>
            <h3 className="mt-2 font-display text-4xl text-ink">Stay monthly, unlock more.</h3>
            <p className="mt-2 max-w-2xl text-muted">Every month you stay, you unlock another way to get closer to the team.</p>
            <ol className="relative mt-8 grid gap-6 sm:grid-cols-4 sm:gap-4">
              <span className="absolute left-4 right-4 top-5 hidden h-0.5 bg-[linear-gradient(90deg,var(--color-red),var(--color-gold))] sm:block" aria-hidden="true" />
              {fanExperiences.map((x, i) => (
                <li key={x.id} className="relative flex gap-4 sm:flex-col sm:gap-3">
                  <span className={`relative grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 font-display text-lg ${i === 0 ? "border-red bg-red text-white" : "border-gold bg-gold-soft text-gold"}`}>
                    {x.unlockMonth}
                  </span>
                  <span>
                    <b className="block text-sm uppercase tracking-wide text-gold">{unlockLabel(x.unlockMonth)}</b>
                    <span className="mt-1 block text-lg font-semibold text-ink">{x.name}</span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-xs text-faint">Applies to Chalk Circle and Routine Partner. Sample perks for the demo.</p>
          </div>
          <p className="mt-6 text-sm text-muted">
            Anyone can also buy fan experiences one at a time, or fund a small community activity below.
          </p>
        </div>
      </section>
      <CardCollection />
      <SupporterOffers />
    </>
  );
}
