"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type StreamStatus = "idle" | "streaming" | "done" | "error";

/** POSTs JSON to an AI route and accumulates the streamed text. */
export function useTextStream(url: string) {
  const [status, setStatus] = useState<StreamStatus>("idle");
  const [text, setText] = useState("");
  const [source, setSource] = useState<"live" | "sample" | null>(null);
  const abort = useRef<AbortController | null>(null);

  const start = useCallback(
    async (body: unknown) => {
      abort.current?.abort();
      const ctrl = new AbortController();
      abort.current = ctrl;
      setText("");
      setStatus("streaming");
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: ctrl.signal,
        });
        if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
        const src: "live" | "sample" = res.headers.get("X-AI-Source") === "live" ? "live" : "sample";
        setSource(src);
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let all = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          all += decoder.decode(value, { stream: true });
          setText(all);
        }
        setStatus("done");
        return { text: all, source: src };
      } catch (e) {
        if ((e as Error).name !== "AbortError") setStatus("error");
        return null;
      }
    },
    [url],
  );

  const reset = useCallback(() => {
    abort.current?.abort();
    setText("");
    setStatus("idle");
    setSource(null);
  }, []);

  useEffect(() => () => abort.current?.abort(), []);

  return { status, text, source, start, reset, setText, setStatus };
}

/** Splits "## Heading" sections out of streamed text. */
export function parseSections(text: string) {
  const out: { title: string; body: string }[] = [];
  for (const chunk of text.split(/^## /m)) {
    const nl = chunk.indexOf("\n");
    const title = (nl === -1 ? chunk : chunk.slice(0, nl)).trim();
    if (!title) continue;
    out.push({ title, body: nl === -1 ? "" : chunk.slice(nl + 1).trim() });
  }
  return out;
}
