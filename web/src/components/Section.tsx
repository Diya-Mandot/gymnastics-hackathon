export function SectionHeading({ eyebrow, title, children, align = "left" }: {
  eyebrow?: string;
  title: React.ReactNode;
  children?: React.ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div className={`max-w-3xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      {eyebrow && <p className="text-sm font-semibold text-red-lit">{eyebrow}</p>}
      <h2 className="mt-3 font-display text-[clamp(44px,5.4vw,80px)] text-ink">{title}</h2>
      {children && <p className="mt-4 text-lg leading-relaxed text-muted">{children}</p>}
    </div>
  );
}
