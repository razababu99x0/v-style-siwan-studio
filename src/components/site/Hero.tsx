"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowDown, MapPin, Sparkles, Star } from "lucide-react";
import { HeroStage } from "@/components/three/HeroStage";
import { MagneticButton } from "./MagneticButton";
import { SPRING } from "@/lib/motion";
import { inrFormat } from "@/lib/utils";

const WORDS = ["FASHION", "THAT", "POPS", "OFF", "THE", "SCREEN"];
const HIGHLIGHT = new Set([2, 3]);

export function Hero() {
  const reduced = useReducedMotion();

  return (
    <section className="relative min-h-[100svh] overflow-hidden pt-28 pb-10 md:pt-32">
      <div className="absolute inset-0 -z-10 mesh-bg" />
      <div className="absolute inset-0 -z-10 grid-lines opacity-70" />
      <div className="absolute -left-40 top-10 -z-10 h-[26rem] w-[26rem] rounded-full bg-pink/20 blur-[110px]" />
      <div className="absolute -right-32 bottom-0 -z-10 h-[22rem] w-[22rem] rounded-full bg-cyan/16 blur-[110px]" />

      <div className="shell grid items-center gap-6 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.05] px-3 py-1.5 backdrop-blur-md"
          >
            <Sparkles className="h-3 w-3 text-gold" />
            <span className="text-2xs uppercase tracking-[0.24em] text-mute">
              Siwan · New drops every Friday
            </span>
          </motion.div>

          <h1 className="display text-display-1 text-mist">
            {WORDS.map((word, i) => (
              <span key={word} className="inline-block overflow-hidden pb-[0.06em] pr-[0.22em] align-bottom">
                <motion.span
                  className={`inline-block ${HIGHLIGHT.has(i) ? "kinetic" : ""}`}
                  initial={reduced ? { opacity: 0 } : { y: "110%", rotate: 6, opacity: 0 }}
                  animate={reduced ? { opacity: 1 } : { y: "0%", rotate: 0, opacity: 1 }}
                  transition={{ ...SPRING, delay: 0.18 + i * 0.06, damping: 16 }}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.62, duration: 0.5 }}
            className="mt-6 max-w-[46ch] text-lead text-mute"
          >
            Street-grade fits, festive classics and home refreshes — priced for Siwan, styled like a global
            drop. Try it on in-store today, walk out with it tonight.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.74, duration: 0.5 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <MagneticButton href="/#shop" variant="gold" ariaLabel="Shop the new drop">
              Shop the drop
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </MagneticButton>
            <MagneticButton href="/#visit" variant="ghost" ariaLabel="Visit the Siwan store">
              <MapPin className="h-3.5 w-3.5 text-cyan" />
              Visit the store
            </MagneticButton>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-line pt-5"
          >
            {[
              { k: "1,200+", v: "Happy customers" },
              { k: "₹299+", v: "Starting price" },
              { k: "2 hrs", v: "Same-day pickup" },
            ].map((s) => (
              <div key={s.k}>
                <dt className="display text-2xl text-mist">{s.k}</dt>
                <dd className="mt-1 text-[0.68rem] uppercase tracking-[0.18em] text-mute">{s.v}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <div className="relative min-h-[46svh] lg:min-h-[70svh]">
          <HeroStage className="absolute inset-0" />

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1, ...SPRING }}
            className="glass absolute left-0 top-6 rounded-2xl px-3.5 py-2.5 sm:left-4"
          >
            <p className="text-[0.6rem] uppercase tracking-[0.2em] text-mute">From</p>
            <p className="display text-lg text-gold">{inrFormat(299)}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.15, ...SPRING }}
            className="glass absolute bottom-16 right-0 flex items-center gap-3 rounded-2xl px-3.5 py-2.5 sm:right-4"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/15">
              <Star className="h-3.5 w-3.5 fill-gold text-gold" />
            </div>
            <div>
              <p className="text-sm font-bold text-mist">4.8 / 5</p>
              <p className="text-[0.6rem] uppercase tracking-[0.2em] text-mute">Store rating</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.28, ...SPRING }}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-cyan/40 bg-ink/70 px-4 py-2 text-[0.6rem] uppercase tracking-[0.24em] text-cyan backdrop-blur-md"
          >
            Drag to spin · 360°
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="shell mt-10 flex items-center gap-3 text-mute"
      >
        <motion.span
          animate={reduced ? {} : { y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="grid h-9 w-9 place-items-center rounded-full border border-line"
        >
          <ArrowDown className="h-3.5 w-3.5" />
        </motion.span>
        <span className="text-2xs uppercase tracking-[0.28em]">Scroll for the drop</span>
      </motion.div>
    </section>
  );
}
