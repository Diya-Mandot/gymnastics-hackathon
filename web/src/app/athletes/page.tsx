import Image from "next/image";
import Link from "next/link";
import { athletes } from "@/lib/seed";
import { Explore } from "./Explore";

export const metadata = { title: "Explore Athletes" };

export default function AthletesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-14 sm:px-8">
      <p className="text-sm font-semibold text-red-lit">Explore all athletes</p>
      <h1 className="mt-3 font-display text-6xl text-ink sm:text-7xl">Browse the <em>full roster.</em></h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        Already know who you want, or just want to look around? Every athlete gets the same spotlight. Want us to pick?{" "}
        <Link href="/match" className="link text-ink">Get matched instead</Link>.
      </p>
      <div className="relative mt-10 aspect-[16/7] overflow-hidden rounded-[24px] sm:aspect-[16/5]">
        <Image src="/images/arena-crowd.jpg" alt="The Huntsman Center crowd in red on meet night" fill priority sizes="100vw" className="object-cover object-[center_45%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-paper/50 to-transparent" />
      </div>
      <Explore athletes={athletes} />
    </div>
  );
}
