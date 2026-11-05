import Image from "next/image";

/** Full-bleed photo opening used across pages, matching the home hero's treatment. */
export function PageHero({ image, alt, eyebrow, title, children, actions, aside, size = "md", focus = "center" }: {
  image: string;
  alt: string;
  eyebrow: string;
  title: React.ReactNode;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  aside?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  focus?: string;
}) {
  const height = size === "lg" ? "min-h-[78svh]" : size === "md" ? "min-h-[58svh]" : "min-h-[40svh]";
  return (
    <section className={`on-photo relative flex ${height} items-end overflow-hidden bg-paper`}>
      <Image src={image} alt={alt} fill priority sizes="100vw" className="object-cover" style={{ objectPosition: focus }} />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(15_14_13/0.6)_0%,rgb(15_14_13/0.15)_32%,rgb(15_14_13/0.55)_68%,#0f0e0d_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(15_14_13/0.88)_0%,rgb(15_14_13/0.45)_50%,transparent_82%)]" />
      <div className="relative mx-auto grid w-full max-w-7xl items-end gap-10 px-4 pb-12 pt-32 sm:px-8 lg:grid-cols-[1fr_auto] lg:pb-16">
        <div>
          <p className="animate-rise text-sm font-semibold text-red-lit">{eyebrow}</p>
          <h1 className="mt-4 max-w-[16ch] animate-rise font-display text-[clamp(48px,7vw,112px)] text-ink [animation-delay:60ms]">{title}</h1>
          {children && (
            <div className="mt-5 max-w-xl animate-rise text-lg leading-relaxed text-ink/80 [animation-delay:120ms]">{children}</div>
          )}
          {actions && <div className="mt-8 flex animate-rise flex-wrap gap-3 [animation-delay:180ms]">{actions}</div>}
        </div>
        {aside && <div className="w-full animate-rise lg:w-auto [animation-delay:240ms]">{aside}</div>}
      </div>
    </section>
  );
}
