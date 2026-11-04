import { PageHero } from "@/components/PageHero";
import { RevenueIntelligence } from "./RevenueIntelligence";

export const metadata = { title: "Revenue Intelligence" };

export default function RevenuePage() {
  return (
    <>
      <PageHero
        image="/images/trophies.jpg"
        alt="Pac-12 championship trophies in front of a red wall"
        eyebrow="Revenue intelligence"
        title={<>Where new NIL money <em>comes from.</em></>}
        size="sm"
        focus="center 45%"
      >
        Test the assumptions behind the NIL funding model: fans, sponsors, costs and break-even.
      </PageHero>
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-8">
        <RevenueIntelligence />
      </div>
    </>
  );
}
