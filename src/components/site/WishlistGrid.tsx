"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Heart, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { Product } from "@/lib/catalog";
import { useCart } from "@/store/cart";
import { ProductCard } from "./ProductCard";
import { SPRING, fadeUp, staggerParent, viewportOnce } from "@/lib/motion";
import { inrFormat } from "@/lib/utils";

export function WishlistGrid({ products }: { products: Product[] }) {
  const wishlist = useCart((s) => s.wishlist);
  const add = useCart((s) => s.add);
  const toggleWish = useCart((s) => s.toggleWish);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const saved = mounted ? products.filter((p) => wishlist.includes(p.slug)) : [];
  const totalValue = saved.reduce((sum, p) => sum + p.price, 0);
  const totalSavings = saved.reduce((sum, p) => sum + (p.mrp - p.price), 0);

  if (!mounted) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="shimmer relative h-[22rem] overflow-hidden rounded-[1.6rem] bg-white/5" />
        ))}
      </div>
    );
  }

  if (saved.length === 0) {
    return (
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="glass rounded-[2rem] p-12 text-center">
        <motion.svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          fill="none"
          className="mx-auto"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={SPRING}
        >
          <motion.path
            d="M60 96S20 72 20 47a20 20 0 0 1 40-8 20 20 0 0 1 40 8c0 25-40 49-40 49z"
            stroke="#FF2E63"
            strokeWidth="2.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.1, ease: "easeInOut" }}
          />
        </motion.svg>
        <h2 className="display mt-6 text-display-3">Nothing saved yet</h2>
        <p className="mx-auto mt-3 max-w-[40ch] text-sm text-mute">
          Tap the heart on anything you like and it lands here — perfect for showing the counter exactly what
          you came for.
        </p>
        <Link
          href="/shop"
          className="mt-7 inline-block rounded-full bg-gold px-7 py-3.5 text-2xs font-bold uppercase tracking-[0.2em] text-ink shadow-glow-gold"
        >
          Browse the rack
        </Link>
      </motion.div>
    );
  }

  return (
    <div>
      <motion.div
        variants={staggerParent()}
        initial="hidden"
        animate="show"
        className="mb-8 grid gap-3 sm:grid-cols-3"
      >
        {[
          { label: "Saved styles", value: String(saved.length) },
          { label: "Total value", value: inrFormat(totalValue) },
          { label: "You'd save", value: inrFormat(totalSavings) },
        ].map((stat) => (
          <motion.div key={stat.label} variants={fadeUp} className="glass rounded-2xl p-5">
            <p className="text-2xs uppercase tracking-[0.22em] text-mute">{stat.label}</p>
            <p className="display mt-1.5 text-2xl text-mist">{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button
          onClick={() => saved.forEach((p) => add(p, p.sizes[0], p.colors[0].name))}
          className="rounded-full bg-gold px-6 py-3 text-2xs font-bold uppercase tracking-[0.2em] text-ink shadow-glow-gold"
        >
          Add all to bag
        </button>
        <Link
          href="/checkout"
          className="rounded-full border border-line bg-white/[0.04] px-6 py-3 text-2xs font-bold uppercase tracking-[0.2em] text-mist hover:border-cyan/50"
        >
          Go to checkout
        </Link>
        <p className="ml-auto flex items-center gap-1.5 text-2xs uppercase tracking-[0.18em] text-mute">
          <Heart className="h-3.5 w-3.5 fill-pink text-pink" /> {saved.length} saved
        </p>
      </div>

      <motion.div layout className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        {saved.map((p, i) => (
          <div key={p.slug} className="relative">
            <ProductCard product={p} index={i} />
            <button
              onClick={() => toggleWish(p.slug)}
              aria-label={`Remove ${p.name} from wishlist`}
              className="absolute -right-1.5 -top-1.5 z-20 grid h-9 w-9 place-items-center rounded-full border border-line bg-ink text-mute transition-colors hover:border-pink/60 hover:text-pink"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export const wishlistViewport = viewportOnce;
