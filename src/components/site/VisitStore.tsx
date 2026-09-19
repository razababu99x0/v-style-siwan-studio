"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Clock, MapPin, MessageCircle, Navigation, Phone, Store } from "lucide-react";
import { STORE } from "@/lib/catalog";
import { MagneticButton } from "./MagneticButton";
import { fadeUp, staggerParent, viewportOnce } from "@/lib/motion";

export function VisitStore() {
  const waHref = `https://wa.me/${STORE.whatsapp.replace(/[^\d]/g, "")}?text=${encodeURIComponent(
    "Hi V-STYLE Siwan! I want to check if an item is in stock.",
  )}`;

  return (
    <section id="visit" className="shell scroll-mt-24 py-20 md:py-28">
      <motion.div
        variants={staggerParent()}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="mb-10 flex flex-wrap items-end justify-between gap-6"
      >
        <div className="max-w-2xl">
          <motion.p variants={fadeUp} className="mb-4 flex items-center gap-2 text-2xs uppercase tracking-[0.28em] text-pink">
            <span className="h-1.5 w-1.5 rounded-full bg-pink" /> Come say hi
          </motion.p>
          <motion.h2 variants={fadeUp} className="display text-display-2 text-mist">
            Visit the <span className="kinetic">store</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 max-w-[50ch] text-lead text-mute">
            Two minutes from the main road. Try the drop, feel the fabric, take it home the same day.
          </motion.p>
        </div>
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <motion.div
          variants={fadeUp}
          className="glass relative overflow-hidden rounded-[2rem] p-1.5"
        >
          <div className="relative h-[22rem] w-full overflow-hidden rounded-[1.6rem] sm:h-[26rem]">
            <Image
              src="/img/store-01.jpg"
              alt="V-STYLE Siwan store interior with neon-lit racks"
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />

            {/* map placeholder overlay */}
            <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-line bg-ink/80 p-4 backdrop-blur-xl">
              <div className="flex items-start gap-3">
                <span className="relative mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-pink/20">
                  <MapPin className="h-4 w-4 text-pink" />
                  <motion.span
                    animate={{ scale: [1, 1.9], opacity: [0.5, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                    className="absolute inset-0 rounded-full border border-pink"
                  />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-mist">{STORE.name}</p>
                  <p className="text-xs text-mute">{STORE.address}</p>
                  <p className="mt-1 text-2xs uppercase tracking-[0.2em] text-mute/80">
                    Map preview · opens Google Maps
                  </p>
                </div>
                <a
                  href={STORE.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-auto grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold text-ink shadow-glow-gold"
                  aria-label="Open in Google Maps"
                >
                  <Navigation className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="glass flex flex-col gap-6 rounded-[2rem] p-7 sm:p-9">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan/15">
              <Store className="h-5 w-5 text-cyan" />
            </span>
            <div>
              <h3 className="display text-xl tracking-[0.1em]">Store details</h3>
              <p className="text-2xs uppercase tracking-[0.2em] text-mute">Siwan, Bihar</p>
            </div>
          </div>

          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-pink" />
              <span className="text-mute">
                Address: <span className="text-mist">{STORE.address}</span>
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-cyan" />
              <a href={`tel:${STORE.phone}`} className="text-mute transition-colors hover:text-mist">
                Phone: <span className="text-mist">{STORE.phone}</span>
              </a>
            </li>
            <li className="flex items-start gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <span className="text-mute">
                Hours: <span className="text-mist">{STORE.hours}</span>
              </span>
            </li>
            <li className="flex items-start gap-3">
              <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-mute" />
              <span className="text-mute">
                WhatsApp: <span className="text-mist">{STORE.whatsapp}</span>
              </span>
            </li>
          </ul>

          <div className="mt-auto flex flex-wrap gap-3">
            <MagneticButton href={STORE.mapUrl} variant="gold" className="flex-1">
              <Navigation className="h-3.5 w-3.5" /> Get directions
            </MagneticButton>
            <MagneticButton href={waHref} variant="cyan" className="flex-1">
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp us
            </MagneticButton>
          </div>

          <div className="rounded-2xl border border-line bg-white/[0.03] p-4">
            <p className="text-2xs uppercase tracking-[0.22em] text-mute">At the counter</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Free pickup", "Size exchange", "UPI QR", "Card", "Cash", "Tailoring ref"].map((f) => (
                <span
                  key={f}
                  className="rounded-full border border-line bg-white/[0.04] px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.14em] text-mute"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
