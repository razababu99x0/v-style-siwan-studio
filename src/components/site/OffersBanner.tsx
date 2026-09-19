"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, Copy, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EASE_OUT, SPRING, fadeUp, staggerParent, viewportOnce } from "@/lib/motion";

const CONFETTI = Array.from({ length: 34 }, (_, i) => ({
  left: (i * 37) % 100,
  delay: (i % 10) * 0.06,
  duration: 1.9 + ((i * 13) % 9) / 10,
  size: 5 + ((i * 7) % 8),
  color: ["#FF2E63", "#08D9D6", "#FFC947"][i % 3],
  rotate: (i * 53) % 360,
}));

function useCountdown(hours: number) {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const target = Date.now() + hours * 3600 * 1000;
    const tick = () => setLeft(Math.max(0, target - Date.now()));
    const raf = requestAnimationFrame(tick);
    const id = setInterval(tick, 1000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(id);
    };
  }, [hours]);

  if (left === null) return null;
  const total = Math.floor(left / 1000);
  return {
    h: Math.floor(total / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
  };
}

export function OffersBanner() {
  const t = useCountdown(38);
  const [copied, setCopied] = useState(false);
  const reduced = useReducedMotion();

  return (
    <section id="offers" className="shell py-16 md:py-24">
      <motion.div
        variants={staggerParent()}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="relative overflow-hidden rounded-[2.25rem] border border-gold/30 bg-[linear-gradient(135deg,rgba(255,201,71,0.16),rgba(255,46,99,0.1)_45%,rgba(8,217,214,0.1))] p-6 sm:p-10"
      >
        <div className="pointer-events-none absolute inset-0 grid-lines opacity-40" />
        {!reduced && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {CONFETTI.map((c, i) => (
              <motion.span
                key={i}
                initial={{ y: -40, opacity: 0, rotate: 0 }}
                animate={{ y: 460, opacity: [0, 1, 1, 0], rotate: c.rotate + 220 }}
                transition={{ duration: c.duration, delay: c.delay, ease: EASE_OUT, repeat: Infinity, repeatDelay: 6 }}
                className="absolute top-0 rounded-[2px]"
                style={{ left: `${c.left}%`, width: c.size, height: c.size * 1.6, background: c.color }}
              />
            ))}
          </div>
        )}

        <div className="relative grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <motion.p
              variants={fadeUp}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1.5 text-2xs uppercase tracking-[0.24em] text-gold"
            >
              <Zap className="h-3 w-3 fill-gold" /> Diwali–Chhath mega sale
            </motion.p>
            <motion.h2 variants={fadeUp} className="display text-display-2 text-mist">
              Flat <span className="text-gold">10% off</span> everything in the store
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-4 max-w-[46ch] text-lead text-mute">
              Stack it on top of already-dropped MRP. Use code <strong className="text-mist">SIWAN10</strong> at
              checkout, or just say it at the counter — same discount, same smile.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-7 flex flex-wrap items-center gap-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  navigator.clipboard?.writeText("SIWAN10").catch(() => {});
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1800);
                }}
                className="group flex items-center gap-3 rounded-full bg-gold px-5 py-3.5 text-2xs font-bold uppercase tracking-[0.2em] text-ink shadow-glow-gold"
              >
                SIWAN10
                <AnimatePresence mode="wait" initial={false}>
                  {copied ? (
                    <motion.span
                      key="ok"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={SPRING}
                    >
                      <Check className="h-4 w-4" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="copy"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={SPRING}
                    >
                      <Copy className="h-4 w-4" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
              <p className="text-2xs uppercase tracking-[0.2em] text-mute">Tap to copy · auto-applies in bag</p>
            </motion.div>
          </div>

          <motion.div variants={fadeUp} className="lg:justify-self-end">
            <p className="mb-3 text-2xs uppercase tracking-[0.26em] text-mute">Offer ends in</p>
            <div className="flex gap-2.5 sm:gap-3">
              {[
                { v: t?.h ?? 0, l: "Hrs" },
                { v: t?.m ?? 0, l: "Min" },
                { v: t?.s ?? 0, l: "Sec" },
              ].map((box) => (
                <div
                  key={box.l}
                  className="glass flex h-[4.6rem] w-[4.6rem] flex-col items-center justify-center rounded-2xl sm:h-[5.4rem] sm:w-[5.4rem]"
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={box.v}
                      initial={{ y: -16, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 16, opacity: 0 }}
                      transition={{ duration: 0.24, ease: EASE_OUT }}
                      className="display text-2xl tabular-nums text-gold sm:text-3xl"
                    >
                      {String(box.v).padStart(2, "0")}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-[0.55rem] uppercase tracking-[0.24em] text-mute">{box.l}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 max-w-[26ch] text-xs text-mute">
              Free store pickup · UPI, cards & cash accepted · Easy size exchange within 7 days.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
