"use client";

import { useEffect, useState } from "react";

// Simulated role switching for the demo. Production needs real authentication and authorization.
export type Role = "athlete" | "staff";

const KEY = "rtr:role";

export function useRole() {
  const [role, setRoleState] = useState<Role>("athlete");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === "athlete" || saved === "staff") setRoleState(saved);
    } catch {}
  }, []);

  const setRole = (r: Role) => {
    setRoleState(r);
    try {
      localStorage.setItem(KEY, r);
    } catch {}
  };

  return { role, setRole };
}
