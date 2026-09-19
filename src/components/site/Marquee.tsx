"use client";

import { MARQUEE_ITEMS } from "@/lib/catalog";

export function Marquee() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <section aria-label="Store highlights" className="relative overflow-hidden border-y border-line bg-ink-2/70 py-4">
      <div className="absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-ink to-transparent sm:w-28" />
      <div className="absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-ink to-transparent sm:w-28" />
      <div className="marquee-wrap">
        <div className="marquee-track" style={{ ["--marquee-duration" as string]: "38s" }}>
          {[0, 1].map((dup) => (
            <div key={dup} className="flex shrink-0 items-center">
              {items.map((item, i) => (
                <span key={`${dup}-${item}-${i}`} className="flex items-center">
                  <span className="display px-5 text-[clamp(0.9rem,2.4vw,1.6rem)] tracking-[0.06em] text-mist/90">
                    {item}
                  </span>
                  <span
                    className="h-2 w-2 rotate-45"
                    style={{
                      background: i % 3 === 0 ? "var(--color-pink)" : i % 3 === 1 ? "var(--color-cyan)" : "var(--color-gold)",
                    }}
                  />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
