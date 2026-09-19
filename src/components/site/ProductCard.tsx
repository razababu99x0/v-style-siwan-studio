"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Heart, Plus, Star } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/lib/catalog";
import { useCart } from "@/store/cart";
import { useUI } from "@/store/ui";
import { cn, discountPct, inrFormat } from "@/lib/utils";
import { EASE_OUT, SPRING, tapScale } from "@/lib/motion";

const BURSTS = [
  { x: -22, y: -14 },
  { x: 20, y: -18 },
  { x: -10, y: -26 },
  { x: 12, y: -28 },
  { x: 0, y: -32 },
  { x: 26, y: -6 },
];

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { add, wishlist, toggleWish } = useCart();
  const setCart = useUI((s) => s.setCart);
  const [hover, setHover] = useState(false);
  const [burst, setBurst] = useState(false);
  const wished = wishlist.includes(product.slug);
  const off = discountPct(product.price, product.mrp);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 30, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ ...SPRING, delay: Math.min(index * 0.05, 0.3), damping: 20 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="group relative flex h-full flex-col overflow-hidden rounded-[1.6rem] border border-line bg-white/[0.025] backdrop-blur-sm transition-colors duration-300 hover:border-white/20"
    >
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-[4/5] w-full overflow-hidden bg-ink-3"
        aria-label={`View ${product.name}`}
      >
        <motion.div layoutId={`product-image-${product.slug}`} className="absolute inset-0">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
            priority={index < 4}
          />
          <motion.div
            animate={{ opacity: hover ? 1 : 0 }}
            transition={{ duration: 0.32, ease: EASE_OUT }}
            className="absolute inset-0"
          >
            <Image
              src={product.images[1]}
              alt=""
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              className="object-cover"
            />
          </motion.div>
        </motion.div>

        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink/90 to-transparent" />

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.badge && (
            <span className="rounded-full bg-pink px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.16em] text-white">
              {product.badge}
            </span>
          )}
          {off > 0 && (
            <span className="rounded-full bg-ink/80 px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.16em] text-gold backdrop-blur-md">
              {off}% off
            </span>
          )}
        </div>

        <motion.div
          initial={false}
          animate={{ y: hover ? 0 : 56, opacity: hover ? 1 : 0 }}
          transition={{ ...SPRING, damping: 22 }}
          className="absolute bottom-3 left-3 right-3 hidden sm:block"
        >
          <motion.button
            whileTap={tapScale}
            onClick={(e) => {
              e.preventDefault();
              add(product, product.sizes[0], product.colors[0].name);
              setCart(true);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gold py-3 text-[0.66rem] font-bold uppercase tracking-[0.2em] text-ink shadow-glow-gold"
          >
            <Plus className="h-3.5 w-3.5" /> Quick add · {product.sizes[0]}
          </motion.button>
        </motion.div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[0.62rem] uppercase tracking-[0.2em] text-mute">{product.category}</span>
          <span className="flex items-center gap-1 text-[0.68rem] text-mute">
            <Star className="h-3 w-3 fill-gold text-gold" />
            {product.rating.toFixed(1)}
            <span className="text-mute/60">({product.reviews})</span>
          </span>
        </div>

        <Link href={`/product/${product.slug}`} className="display text-[1.02rem] leading-tight text-mist hover:text-cyan">
          {product.name}
        </Link>
        <p className="line-clamp-1 text-xs text-mute">{product.subtitle}</p>

        <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
          {product.sizes.slice(0, 5).map((s) => (
            <span
              key={s}
              className="rounded-md border border-line px-1.5 py-0.5 text-[0.58rem] uppercase tracking-[0.1em] text-mute"
            >
              {s}
            </span>
          ))}
        </div>

        <div className="flex items-end justify-between gap-2 pt-2">
          <div className="flex items-baseline gap-2">
            <span className="display text-lg text-gold">{inrFormat(product.price)}</span>
            {product.mrp > product.price && (
              <span className="text-xs text-mute line-through">{inrFormat(product.mrp)}</span>
            )}
          </div>
          <button
            onClick={() => {
              toggleWish(product.slug);
              if (!wished) {
                setBurst(true);
                setTimeout(() => setBurst(false), 620);
              }
            }}
            aria-label={wished ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
            aria-pressed={wished}
            className={cn(
              "relative grid h-9 w-9 place-items-center rounded-full border transition-colors",
              wished ? "border-pink/60 bg-pink/15 text-pink" : "border-line text-mute hover:text-pink",
            )}
          >
            <Heart className={cn("h-4 w-4", wished && "fill-pink")} />
            <AnimatePresence>
              {burst &&
                BURSTS.map((b, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 1, x: 0, y: 0, scale: 0.5 }}
                    animate={{ opacity: 0, x: b.x, y: b.y, scale: 1.1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.58, ease: EASE_OUT }}
                    className="pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-pink"
                  />
                ))}
            </AnimatePresence>
          </button>
        </div>

        {product.stock <= 10 && (
          <p className="text-[0.6rem] uppercase tracking-[0.18em] text-pink">
            Only {product.stock} left in store
          </p>
        )}
      </div>
    </motion.article>
  );
}
