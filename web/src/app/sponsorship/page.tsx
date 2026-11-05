import Link from "next/link";

const email = "prachiaswani2005@gmail.com";
const tiers = [
  ["Philanthro-Fan", "$5-$600", "A self-serve supporter contribution. Every amount supports Red Rocks gymnasts' community impact."],
  ["Meet-Night Partner", "$1,000", "A conversation package for a sponsored Routine IQ challenge, clearly labelled spotlight, and event report."],
  ["Rotation Partner", "$5,000", "A conversation package for a live rotation activation, athlete-approved content, and campaign measurement."],
  ["Arena Partner", "$10,000", "A conversation package for multi-rotation activation, a fan milestone, and a season-level renewal plan."],
];

export default function SponsorshipInfo() {
  return <main className="mx-auto max-w-6xl px-4 py-12 sm:px-8">
    <p className="label text-red-lit">WRTH sponsorship information</p>
    <h1 className="mt-3 font-display text-6xl text-ink">Build a fan moment that <em>matters.</em></h1>
    <p className="mt-5 max-w-3xl text-lg text-muted">Who Rocks the House supports Red Rocks gymnasts and invites businesses interested in NIL partnerships to connect. Public WRTH giving language welcomes contributions from $5 to $5,000; this platform limits online transactions to $600 and routes larger opportunities to an admin conversation.</p>
    <div className="mt-10 grid gap-5 md:grid-cols-2">
      {tiers.map(([name, price, description]) => <section key={name} className="card p-7"><p className="label">{name}</p><h2 className="mt-2 font-display text-4xl text-ink">{price}</h2><p className="mt-4 text-sm leading-relaxed text-muted">{description}</p><a className="btn btn-red mt-6 w-full" href={`mailto:${email}?subject=${encodeURIComponent(`WRTH sponsorship interest: ${name}`)}&body=${encodeURIComponent(`Hello WRTH Admin,\n\nI am interested in discussing the ${name} opportunity.`)}`}>Request a conversation</a></section>)}
    </div>
    <section className="card mt-8 p-7"><h2 className="font-display text-4xl text-ink">What happens next?</h2><p className="mt-3 max-w-3xl text-muted">WRTH Admin can discuss athlete approvals, actual inventory, pricing, NIL compensation, activation costs, and any required agreements. No sponsorship tier is purchased through the platform.</p><div className="mt-5 flex flex-wrap gap-3"><a className="btn btn-red" href={`mailto:${email}?subject=WRTH%20sponsorship%20conversation`}>Email WRTH Admin</a><Link className="btn btn-line" href="/live">See Rock the Arena</Link></div></section>
  </main>;
}
