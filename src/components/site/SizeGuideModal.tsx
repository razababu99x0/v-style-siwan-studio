"use client";

import { motion } from "motion/react";
import { X, Ruler } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useEffect } from "react";
import { EASE_OUT, SPRING, staggerParent, fadeUp } from "@/lib/motion";
import { SIZE_GUIDES } from "@/lib/catalog";
import { cn } from "@/lib/utils";

/** Size chart modal with unit toggle — real measurements, not decoration. */
export function SizeGuideModal({
  open,
  onClose,
  category,
}: {
  open: boolean;
  onClose: () => void;
  category: string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const guide = pickGuide(category);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[105] flex items-end justify-center p-0 sm:items-center sm:p-6">
          <motion.button
            aria-label="Close size guide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, transition: { duration: 0.18 } }}
            transition={SPRING}
            className="glass-strong relative max-h-[86svh] w-full max-w-[38rem] overflow-hidden rounded-t-[2rem] sm:rounded-[2rem]"
          >
            <header className="flex items-center justify-between border-b border-line px-6 py-4">
              <h3 className="display flex items-center gap-2 text-base tracking-[0.14em]">
                <Ruler className="h-4 w-4 text-cyan" /> Size guide
              </h3>
              <button
                onClick={onClose}
                className="grid h-9 w-9 place-items-center rounded-full border border-line text-mute hover:text-mist"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div data-lenis-prevent className="max-h-[70svh] overflow-y-auto px-6 py-5">
              <p className="text-xs text-mute">
                {guide.note} Measurements are in inches, taken flat. Between sizes? Size up for our oversized
                fits.
              </p>

              <motion.div
                variants={staggerParent(0.04)}
                initial="hidden"
                animate="show"
                className="mt-5 space-y-6"
              >
                {guide.tables.map((table) => (
                  <motion.div key={table.title} variants={fadeUp}>
                    <p className="mb-2 text-2xs uppercase tracking-[0.22em] text-pink">{table.title}</p>
                    <div className="overflow-hidden rounded-2xl border border-line">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-white/[0.05] text-mute">
                          <tr>
                            {table.head.map((h) => (
                              <th key={h} className="px-3 py-2.5 font-semibold uppercase tracking-[0.12em]">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/8">
                          {table.rows.map((row) => (
                            <tr key={row[0]} className="transition-colors hover:bg-white/[0.03]">
                              {row.map((cell, i) => (
                                <td
                                  key={i}
                                  className={cn("px-3 py-2.5", i === 0 ? "font-semibold text-mist" : "text-mute")}
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              <p
                className="mt-6 rounded-2xl border border-line bg-white/[0.03] p-4 text-xs leading-relaxed text-mute"
                style={{ transition: `background ${EASE_OUT}` }}
              >
                <span className="text-mist">Still unsure?</span> Reserve the piece on WhatsApp, come try both
                sizes at the Siwan store, and only take the one that fits. Free, no obligation.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

type Guide = {
  note: string;
  tables: { title: string; head: string[]; rows: string[][] }[];
};

function pickGuide(category: string): Guide {
  if (category === "footwear") {
    return {
      note: "UK sizing, measured inside the heel-to-toe footbed.",
      tables: [SIZE_GUIDES.footwear],
    };
  }
  if (category === "kids") {
    return {
      note: "Age-based sizing with growing room built in.",
      tables: [SIZE_GUIDES.kids],
    };
  }
  if (category === "women") {
    return { note: "Body measurements, not garment measurements.", tables: [SIZE_GUIDES.women] };
  }
  if (category === "home") {
    return { note: "Mattress-friendly dimensions with 2 inch shrink allowance.", tables: [SIZE_GUIDES.home] };
  }
  if (category === "bags") {
    return { note: "Capacity measured with the bag filled, not compressed.", tables: [SIZE_GUIDES.bags] };
  }
  return { note: "Body measurements in inches — our oversized fits run 1 size large.", tables: [SIZE_GUIDES.men] };
}
