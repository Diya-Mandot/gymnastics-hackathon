"use client";

import { QRCodeSVG } from "qrcode.react";
import { useEffect, useRef, useState } from "react";
import type { AssetCopy } from "@/lib/ai/assets";
import type { Athlete } from "@/lib/types";

// Adobe-ready graphics: Claude writes the copy, this lays it out as SVG with live (editable) text and the
// athlete's photo embedded, so each file opens in Adobe Illustrator or uploads to Adobe Express as-is.

type Format = { id: keyof Omit<AssetCopy, "altText">; label: string; w: number; h: number; use: string };
const formats: Format[] = [
  { id: "post", label: "Instagram post", w: 1080, h: 1080, use: "Feed post" },
  { id: "story", label: "Instagram story", w: 1080, h: 1920, use: "Story / Reel cover" },
  { id: "poster", label: "Meet-night QR poster", w: 1275, h: 1650, use: "Letter size, prints at 150 dpi" },
  { id: "card", label: "Trading card", w: 750, h: 1050, use: "Card back / digital card" },
];

const C = { ink: "#0f0e0d", cream: "#f3efe8", red: "#cc0000", muted: "#b9b2a8" };
const SERIF = "'Instrument Serif', Georgia, serif";
const SANS = "Geist, 'Helvetica Neue', Arial, sans-serif";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Greedy word wrap by approximate character width. */
function wrap(text: string, maxChars: number) {
  const lines: string[] = [];
  let cur = "";
  for (const word of text.split(/\s+/)) {
    if ((cur + " " + word).trim().length > maxChars && cur) {
      lines.push(cur);
      cur = word;
    } else cur = (cur + " " + word).trim();
  }
  if (cur) lines.push(cur);
  return lines;
}

function textBlock(text: string, x: number, y: number, size: number, maxChars: number, attrs: string, lh = 1.08) {
  return wrap(text, maxChars)
    .map((l, i) => `<text x="${x}" y="${y + i * size * lh}" font-size="${size}" ${attrs}>${esc(l)}</text>`)
    .join("");
}

function buildSvg(f: Format, copy: AssetCopy, a: Athlete, photo: string, qr: string) {
  const { w, h } = f;
  const shade = `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0.35" stop-color="${C.ink}" stop-opacity="0"/><stop offset="1" stop-color="${C.ink}" stop-opacity="0.95"/></linearGradient></defs>`;
  const img = (ih: number) => `<image href="${photo}" x="0" y="0" width="${w}" height="${ih}" preserveAspectRatio="xMidYMin slice"/>`;
  const brand = (y: number) => `<text x="${w * 0.06}" y="${y}" font-family="${SANS}" font-size="${w * 0.026}" font-weight="700" letter-spacing="3" fill="${C.cream}">ROCK THE ROUTINE · RED ROCKS NIL</text>`;
  const pad = w * 0.06;

  if (f.id === "post" || f.id === "story") {
    const c = copy[f.id];
    const hs = f.id === "post" ? 96 : 120;
    const top = f.id === "post" ? h * 0.52 : h * 0.6;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${shade}
<rect width="${w}" height="${h}" fill="${C.ink}"/>${img(h)}<rect width="${w}" height="${h}" fill="url(#g)"/>
<rect x="0" y="0" width="${w}" height="14" fill="${C.red}"/>${brand(70)}
<text x="${pad}" y="${top}" font-family="${SANS}" font-size="${w * 0.03}" font-weight="700" fill="${C.red}" letter-spacing="2">${esc(c.kicker.toUpperCase())}</text>
${textBlock(c.headline, pad, top + hs * 1.1, hs, f.id === "post" ? 18 : 15, `font-family="${SERIF}" fill="${C.cream}"`, 0.98)}
${textBlock(c.body, pad, top + hs * 1.1 + wrap(c.headline, f.id === "post" ? 18 : 15).length * hs + 30, w * 0.034, 46, `font-family="${SANS}" fill="${C.muted}"`, 1.35)}
<rect x="${pad}" y="${h - 150}" rx="40" width="${c.cta.length * w * 0.022 + 120}" height="80" fill="${C.red}"/>
<text x="${pad + 60}" y="${h - 98}" font-family="${SANS}" font-size="${w * 0.032}" font-weight="700" fill="#fff">${esc(c.cta)}</text>
<text x="${w - pad}" y="${h - 98}" text-anchor="end" font-family="${SANS}" font-size="${w * 0.024}" fill="${C.muted}">${esc(a.name)}</text></svg>`;
  }

  if (f.id === "poster") {
    const c = copy.poster;
    const ph = h * 0.5;
    const q = w * 0.3;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${shade}
<rect width="${w}" height="${h}" fill="${C.ink}"/>${img(ph)}<rect width="${w}" height="${ph}" fill="url(#g)"/>
<rect x="0" y="0" width="${w}" height="18" fill="${C.red}"/>${brand(80)}
${textBlock(c.headline, pad, ph + 140, 130, 16, `font-family="${SERIF}" fill="${C.cream}"`, 0.98)}
${textBlock(c.body, pad, ph + 140 + wrap(c.headline, 16).length * 128 + 40, 38, 40, `font-family="${SANS}" fill="${C.muted}"`, 1.35)}
<rect x="${w - pad - q - 24}" y="${h - pad - q - 24}" width="${q + 48}" height="${q + 48}" rx="24" fill="${C.cream}"/>
<svg x="${w - pad - q}" y="${h - pad - q}" width="${q}" height="${q}">${qr}</svg>
<text x="${pad}" y="${h - pad - 20}" font-family="${SANS}" font-size="44" font-weight="700" fill="${C.red}">${esc(c.cta)} →</text></svg>`;
  }

  const c = copy.card;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${shade}
<rect width="${w}" height="${h}" rx="36" fill="${C.ink}"/>
<clipPath id="r"><rect x="24" y="24" width="${w - 48}" height="${h * 0.62}" rx="22"/></clipPath>
<g clip-path="url(#r)"><image href="${photo}" x="24" y="24" width="${w - 48}" height="${h * 0.62}" preserveAspectRatio="xMidYMin slice"/></g>
<rect x="24" y="24" width="${w - 48}" height="${h * 0.62}" rx="22" fill="url(#g)"/>
<text x="56" y="${h * 0.62 - 20}" font-family="${SERIF}" font-size="72" fill="${C.cream}">${esc(c.title)}</text>
<text x="56" y="${h * 0.62 + 90}" font-family="${SANS}" font-size="22" font-weight="700" letter-spacing="3" fill="${C.red}">${esc(c.statLabel.toUpperCase())}</text>
<text x="56" y="${h * 0.62 + 160}" font-family="${SERIF}" font-size="64" fill="${C.cream}">${esc(c.stat)}</text>
${textBlock(c.line, 56, h * 0.62 + 230, 28, 40, `font-family="${SANS}" fill="${C.muted}"`, 1.35)}
<text x="56" y="${h - 50}" font-family="${SANS}" font-size="20" font-weight="700" letter-spacing="3" fill="${C.muted}">ROCK THE ROUTINE · ${esc(a.specialty.toUpperCase())}</text></svg>`;
}

async function toDataUrl(src: string) {
  const blob = await (await fetch(src)).blob();
  return new Promise<string>((resolve) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.readAsDataURL(blob);
  });
}

function download(name: string, href: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = name;
  a.click();
}

async function downloadPng(svg: string, f: Format, name: string) {
  const img = new Image();
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  await img.decode();
  const canvas = document.createElement("canvas");
  canvas.width = f.w;
  canvas.height = f.h;
  canvas.getContext("2d")!.drawImage(img, 0, 0, f.w, f.h);
  canvas.toBlob((b) => b && download(name, URL.createObjectURL(b)), "image/png");
}

export function AssetStudio({ athlete, canApprove }: { athlete: Athlete; canApprove: boolean }) {
  const [campaign, setCampaign] = useState("Confidence Starts Here");
  const [sponsor, setSponsor] = useState("BrightPath Family Wellness");
  const [state, setState] = useState<"idle" | "working" | "done">("idle");
  const [copy, setCopy] = useState<AssetCopy | null>(null);
  const [source, setSource] = useState<"live" | "sample" | null>(null);
  const [svgs, setSvgs] = useState<Record<string, string>>({});
  const [approved, setApproved] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  // Rebuild the files whenever new copy arrives.
  useEffect(() => {
    if (!copy) return;
    let alive = true;
    (async () => {
      const photo = athlete.photo ? await toDataUrl(athlete.photo).catch(() => "") : "";
      const qr = qrRef.current?.innerHTML ?? "";
      const out = Object.fromEntries(formats.map((f) => [f.id, buildSvg(f, copy, athlete, photo, qr)]));
      if (alive) {
        setSvgs(out);
        setState("done");
      }
    })();
    return () => {
      alive = false;
    };
  }, [copy, athlete]);

  async function generate() {
    setState("working");
    setApproved(false);
    const res = await fetch("/api/assets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ athleteSlug: athlete.slug, campaign, sponsor }) });
    const data = (await res.json()) as { source: "live" | "sample"; copy: AssetCopy };
    setSource(data.source);
    setCopy(data.copy);
  }

  const qrUrl = typeof window === "undefined" ? `/support/${athlete.slug}` : `${window.location.origin}/support/${athlete.slug}?src=poster`;

  return (
    <section className="card p-6 lg:col-span-2" aria-label="Adobe asset generator">
      <div ref={qrRef} className="hidden" aria-hidden="true">
        <QRCodeSVG value={qrUrl} size={256} level="M" fgColor={C.ink} bgColor={C.cream} marginSize={0} />
      </div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-red-lit">Adobe asset generator</p>
          <h2 className="mt-2 font-display text-4xl text-ink">Real design files, not just words.</h2>
          <p className="mt-2 text-sm text-muted">
            AI writes the copy, then the app lays out four files with {athlete.firstName}’s photo. Download SVG to edit every
            word in Adobe Illustrator or Adobe Express, or PNG to post as-is. Nothing publishes until {athlete.firstName} approves.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-xs text-muted">Campaign<input value={campaign} onChange={(e) => setCampaign(e.target.value)} className="input mt-1 !h-10 !w-56" /></label>
          <label className="text-xs text-muted">Sponsor<input value={sponsor} onChange={(e) => setSponsor(e.target.value)} className="input mt-1 !h-10 !w-56" /></label>
          <button className="btn btn-red" onClick={generate} disabled={state === "working"}>
            {state === "working" ? "Designing…" : state === "done" ? "Regenerate assets" : "Generate Adobe assets"}
          </button>
        </div>
      </div>

      {state !== "idle" && (
        <>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs">
            {source && <span className="tag">{source === "live" ? "Copy written live by Claude" : "Offline sample copy (no AI key)"}</span>}
            <span className={`tag ${approved ? "!bg-green/15 !text-green" : "!bg-red-soft !text-red-dark"}`}>{approved ? `Approved by ${athlete.firstName}` : `Draft · awaiting ${athlete.firstName}’s approval`}</span>
            {canApprove && !approved && state === "done" && <button className="btn btn-ink !py-1.5 text-sm" onClick={() => setApproved(true)}>Approve assets</button>}
            <a href="https://new.express.adobe.com/" target="_blank" rel="noreferrer" className="link text-sm text-ink">Open Adobe Express ↗</a>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {formats.map((f) => (
              <figure key={f.id} className="flex flex-col rounded-[16px] border border-line p-3">
                <div className="grid flex-1 place-items-center rounded-[10px] bg-sand-soft p-2" style={{ minHeight: 220 }}>
                  {svgs[f.id] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgs[f.id])}`} alt={f.id === "post" && copy ? copy.altText : `${f.label} for ${athlete.name}`} className="max-h-72 w-auto rounded-md shadow-lg" />
                  ) : (
                    <span className="text-sm text-muted">Designing…</span>
                  )}
                </div>
                <figcaption className="mt-3">
                  <p className="text-sm font-semibold text-ink">{f.label}</p>
                  <p className="text-xs text-faint">{f.w}×{f.h} · {f.use}</p>
                  <div className="mt-2 flex gap-2">
                    <button className="btn btn-line !px-3 !py-1.5 text-xs" disabled={!svgs[f.id]} onClick={() => download(`${athlete.slug}-${f.id}.svg`, `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgs[f.id])}`)}>SVG</button>
                    <button className="btn btn-line !px-3 !py-1.5 text-xs" disabled={!svgs[f.id]} onClick={() => downloadPng(svgs[f.id], f, `${athlete.slug}-${f.id}.png`)}>PNG</button>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-4 text-xs text-faint">
            Files are generated in your browser and are not uploaded anywhere. Generating directly inside Adobe (Firefly) would need
            WRTH’s Adobe API credentials.
          </p>
        </>
      )}
    </section>
  );
}
