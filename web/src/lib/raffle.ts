"use client";

// Tonight's raffle. Only signed-in fans who played the in-arena QR game get an entry.
// Demo: entries are kept in this browser, one per account. The prize and draw are sample content.

export const RAFFLE = {
  prize: "Signed Red Rocks leotard + post-meet floor photo",
  drawAt: "End of the meet, on the arena screen",
};

export type RaffleEntry = { ticket: string; enteredAt: string };

const key = (userId: string) => `rtr:raffle:${userId}`;
export const PENDING_KEY = "rtr:raffle-pending";

export function getEntry(userId: string): RaffleEntry | null {
  try {
    const raw = localStorage.getItem(key(userId));
    return raw ? (JSON.parse(raw) as RaffleEntry) : null;
  } catch {
    return null;
  }
}

/** Turns a pending QR-game entry into a ticket for this account (once). */
export function claimPendingEntry(userId: string): RaffleEntry | null {
  try {
    const existing = getEntry(userId);
    if (!localStorage.getItem(PENDING_KEY)) return existing;
    localStorage.removeItem(PENDING_KEY);
    if (existing) return existing;
    const entry = { ticket: `RR-${String(Math.floor(1000 + Math.random() * 9000))}`, enteredAt: new Date().toISOString() };
    localStorage.setItem(key(userId), JSON.stringify(entry));
    return entry;
  } catch {
    return null;
  }
}

export function markPendingEntry() {
  try { localStorage.setItem(PENDING_KEY, "1"); } catch {}
}
