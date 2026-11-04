import Link from "next/link";

export function AdminTabs({ active }: { active: "live" | "revenue" }) {
  const tabs = [
    { id: "live", href: "/admin", label: "Live campaign" },
    { id: "revenue", href: "/admin/revenue", label: "Revenue intelligence" },
  ] as const;
  return (
    <nav className="mb-8 flex gap-6 border-b border-line" aria-label="Admin sections">
      {tabs.map((t) => (
        <Link
          key={t.id}
          href={t.href}
          aria-current={t.id === active ? "page" : undefined}
          className={`relative py-3 text-sm font-medium ${t.id === active ? "text-ink" : "text-muted hover:text-ink"}`}
        >
          {t.label}
          {t.id === active && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-red" />}
        </Link>
      ))}
    </nav>
  );
}
