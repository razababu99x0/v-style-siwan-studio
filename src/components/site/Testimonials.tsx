"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { Testimonial } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { EASE_OUT, SPRING, fadeUp, staggerParent, viewportOnce } from "@/lib/motion";

const accentHex = (a: string) => (a === "pink" ? "#FF2E63" : a === "cyan" ? "#08D9D6" : "#FFC947");

export function Testimonials({ items }: { items: Testimonial[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback(
    (dir: number) => setI((prev) => (prev + dir + items.length) % items.length),
    [items.length],
  );

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => go(1), 5200);
    return () => clearInterval(id);
  }, [go, paused]);

  const active = items[i];

  return (
    <section id="reviews" className="shell py-20 md:py-28">
      <motion.div
        variants={staggerParent()}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="mb-10 flex flex-wrap items-end justify-between gap-6"
      >
        <div className="max-w-2xl">
          <motion.p variants={fadeUp} className="mb-4 flex items-center gap-2 text-2xs uppercase tracking-[0.28em] text-cyan">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan" /> 1,200+ happy shoppers
          </motion.p>
          <motion.h2 variants={fadeUp} className="display text-display-2 text-mist">
            Siwan ki <span className="kinetic">public</span> bol rahi hai
          </motion.h2>
        </div>
        <motion.div variants={fadeUp} className="flex items-center gap-2">
          <button
            onClick={() => go(-1)}
            className="grid h-11 w-11 place-items-center rounded-full border border-line bg-white/[0.04] text-mist transition-colors hover:border-cyan/50"
            aria-label="Previous review"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => go(1)}
            className="grid h-11 w-11 place-items-center rounded-full border border-line bg-white/[0.04] text-mist transition-colors hover:border-cyan/50"
            aria-label="Next review"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </motion.div>
      </motion.div>

      <div
        className="grid gap-6 lg:grid-cols-[1.35fr_1fr]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="relative min-h-[22rem] overflow-hidden rounded-[2rem] border border-line bg-white/[0.03] p-7 sm:p-10">
          <div
            className="absolute -right-24 -top-24 h-64 w-64 rounded-full blur-[90px] transition-colors duration-700"
            style={{ background: `${accentHex(active.accent)}33` }}
          />
          <Quote className="h-8 w-8" style={{ color: accentHex(active.accent) }} />

          <AnimatePresence mode="wait">
            <motion.blockquote
              key={active.id}
              initial={{ opacity: 0, y: 22, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -18, filter: "blur(8px)" }}
              transition={{ duration: 0.44, ease: EASE_OUT }}
              className="relative mt-6"
            >
              <p className="text-[clamp(1.15rem,2.4vw,1.85rem)] font-medium leading-snug text-mist">
                “{active.quote}”
              </p>
              <footer className="mt-8 flex flex-wrap items-center gap-4">
                <span
                  className="display grid h-12 w-12 place-items-center rounded-2xl text-lg text-ink"
                  style={{ background: accentHex(active.accent) }}
                >
                  {active.name.charAt(0)}
                </span>
                <div>
                  <p className="text-sm font-semibold text-mist">{active.name}</p>
                  <p className="text-2xs uppercase tracking-[0.18em] text-mute">{active.city}</p>
                </div>
                <div className="ml-auto flex flex-col items-end gap-1">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }, (_, s) => (
                      <Star
                        key={s}
                        className={cn("h-3.5 w-3.5", s < active.rating ? "fill-gold text-gold" : "text-mute/40")}
                      />
                    ))}
                  </div>
                  <p className="text-2xs uppercase tracking-[0.18em] text-mute">Bought: {active.purchase}</p>
                </div>
              </footer>
            </motion.blockquote>
          </AnimatePresence>

          <div className="absolute inset-x-7 bottom-6 flex gap-1.5">
            {items.map((it, idx) => (
              <button
                key={it.id}
                onClick={() => setI(idx)}
                aria-label={`Show review from ${it.name}`}
                className="group relative h-1 flex-1 overflow-hidden rounded-full bg-white/12"
              >
                {idx === i && (
                  <motion.span
                    key={`${i}-${paused}`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: paused ? 0.3 : 5.2, ease: "linear" }}
                    className="absolute inset-0 origin-left rounded-full"
                    style={{ background: accentHex(active.accent) }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {items.map((it, idx) => (
            <motion.button
              key={it.id}
              onClick={() => setI(idx)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewportOnce}
              transition={{ ...SPRING, delay: idx * 0.05, damping: 22 }}
              className={cn(
                "flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-colors",
                idx === i ? "border-white/25 bg-white/[0.06]" : "border-line bg-white/[0.02] hover:bg-white/[0.05]",
              )}
            >
              <span
                className="display grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm text-ink"
                style={{ background: accentHex(it.accent) }}
              >
                {it.name.charAt(0)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-mist">{it.name}</span>
                <span className="block truncate text-xs text-mute">{it.purchase}</span>
              </span>
              <span className="flex shrink-0 items-center gap-0.5">
                <Star className="h-3 w-3 fill-gold text-gold" />
                <span className="text-xs text-mute">{it.rating}.0</span>
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
