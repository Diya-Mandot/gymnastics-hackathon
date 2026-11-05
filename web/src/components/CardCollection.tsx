"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { roster } from "@/lib/roster";

const KEY = "rtr:cards:v2"; // v2: the real 2027 roster

export function CardCollection() {
  const [collected, setCollected] = useState<string[]>([]);

  useEffect(() => {
    try {
      setCollected(JSON.parse(localStorage.getItem(KEY) ?? "[]"));
    } catch {}
  }, []);

  function collect(slug: string) {
    setCollected((current) => {
      const next = current.includes(slug) ? current : [...current, slug];
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  return (
    <section id="cards" className="mx-auto max-w-7xl scroll-mt-16 px-4 py-24 sm:px-8">
      <p className="text-sm font-semibold text-red-lit">Digital trading cards</p>
      <h2 className="mt-3 max-w-4xl font-display text-5xl text-ink sm:text-6xl">Collect the whole <em>roster.</em></h2>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
        One card for every Red Rock on the 2027 team. Scan a card at a meet or tap below to add it. Your collection stays on this device.
      </p>

      <div className="card mt-8 flex items-center justify-between gap-4 p-5">
        <span className="text-muted">Your collection</span>
        <div className="flex flex-1 items-center justify-end gap-4">
          <div className="hidden h-1.5 max-w-xs flex-1 overflow-hidden rounded-full bg-line sm:block" aria-hidden="true">
            <div className="h-full bg-red transition-all" style={{ width: `${(collected.length / roster.length) * 100}%` }} />
          </div>
          <b className="font-display text-4xl">{collected.length}/{roster.length}</b>
        </div>
      </div>

      <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {roster.map((a, index) => {
          const has = collected.includes(a.slug);
          return (
            <li key={a.slug} className={`card flex flex-col overflow-hidden p-2 ${has ? "!border-red" : ""}`}>
              <div className="relative aspect-[.72] overflow-hidden rounded-[12px] bg-white">
                <Image src={a.photo} alt={`${a.name} trading card`} fill sizes="(max-width: 640px) 50vw, 20vw" className="object-cover object-[50%_18%]" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0f0e0d] via-[#0f0e0d]/70 to-transparent p-3 pt-14">
                  <p className="text-[10px] font-semibold tracking-wide text-[#ff8f85]">RED ROCKS · {String(index + 1).padStart(2, "0")}</p>
                  <h3 className="mt-0.5 font-display text-2xl leading-tight text-white">{a.name}</h3>
                  <p className="mt-0.5 text-[11px] text-white/75">{a.classYear} · {a.hometown}</p>
                </div>
                {has && <span className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-red text-sm text-white" aria-hidden="true">✓</span>}
              </div>
              <div className="flex flex-1 flex-col gap-2 px-1 pb-1 pt-3">
                <button
                  className={`btn w-full !px-3 !py-2 text-sm ${has ? "btn-ink" : "btn-red"}`}
                  onClick={() => collect(a.slug)}
                  aria-pressed={has}
                  aria-label={has ? `${a.name} card collected` : `Collect ${a.name}'s card`}
                >
                  {has ? "Collected ✓" : "Collect card"}
                </button>
                {a.featured ? (
                  <div className="flex gap-2">
                    <Link className="btn btn-line flex-1 !px-2 !py-2 text-xs" href={`/support/${a.featured}`}>Back {a.name.split(" ")[0]}</Link>
                    <Link className="btn btn-line flex-1 !px-2 !py-2 text-xs" href={`/athletes/${a.featured}`}>Profile</Link>
                  </div>
                ) : (
                  <a className="btn btn-line w-full !px-2 !py-2 text-xs" href={a.profileUrl} target="_blank" rel="noreferrer">
                    Official bio <span aria-hidden="true">↗</span>
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <section className="card mt-10 p-7">
        <p className="label">Supporter pathway</p>
        <h3 className="mt-3 font-display text-4xl text-ink">A card scan becomes a relationship.</h3>
        <p className="mt-3 max-w-2xl text-muted">
          At a meet, each printed card has a QR code that opens the athlete’s page and a quick way to back her. Gifts on this site are
          demo transactions; nothing is charged.
        </p>
        <Link className="btn btn-red mt-6" href="/demo">Open the live QR demo</Link>
      </section>
    </section>
  );
}
