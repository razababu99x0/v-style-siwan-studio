"use client";

import { motion } from "motion/react";
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";
import type { Product } from "@/lib/catalog";
import { useRecent } from "@/store/recent";
import { ProductCard } from "./ProductCard";
import { fadeUp, staggerParent, viewportOnce } from "@/lib/motion";

/** Picks up whatever the shopper last opened — great for "come back later" trips. */
export function RecentlyViewed({
  products,
  excludeSlug,
}: {
  products: Product[];
  excludeSlug?: string;
}) {
  const slugs = useRecent((s) => s.slugs);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const items = mounted
    ? slugs
        .filter((s) => s !== excludeSlug)
        .map((slug) => products.find((p) => p.slug === slug))
        .filter((p): p is Product => Boolean(p))
        .slice(0, 4)
    : [];

  if (!mounted || items.length === 0) return null;

  return (
    <section className="shell py-16 md:py-24">
      <motion.div
        variants={staggerParent()}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="mb-8 flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <motion.p
            variants={fadeUp}
            className="mb-4 flex items-center gap-2 text-2xs uppercase tracking-[0.28em] text-mute"
          >
            <Clock className="h-3.5 w-3.5 text-gold" /> Pick up where you left off
          </motion.p>
          <motion.h2 variants={fadeUp} className="display text-display-2 text-mist">
            Recently <span className="kinetic">viewed</span>
          </motion.h2>
        </div>
        <motion.p variants={fadeUp} className="max-w-[34ch] text-sm text-mute">
          Saved on this device — show the counter this list and we&apos;ll pull every size at once.
        </motion.p>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {items.map((p, i) => (
          <ProductCard key={p.slug} product={p} index={i} />
        ))}
      </div>
    </section>
  );
}
