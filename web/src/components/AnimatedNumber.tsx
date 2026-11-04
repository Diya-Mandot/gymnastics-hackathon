"use client";

import { animate, useMotionValue, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

export function AnimatedNumber({ value, format = (n) => Math.round(n).toLocaleString("en-US") }: {
  value: number;
  format?: (n: number) => string;
}) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(value);
  const [text, setText] = useState(format(value));
  const [bump, setBump] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      mv.set(value);
      setText(format(value));
      return;
    }
    if (reduce) {
      setText(format(value));
      return;
    }
    setBump(true);
    const c = animate(mv, value, {
      duration: 1.1,
      ease: [0.2, 0.7, 0.2, 1],
      onUpdate: (v) => setText(format(v)),
      onComplete: () => setTimeout(() => setBump(false), 600),
    });
    return () => c.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <span className={`tabular-nums transition-colors duration-700 ${bump ? "text-red-lit" : ""}`}>{text}</span>;
}
