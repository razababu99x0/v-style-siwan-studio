"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  Check,
  Eye,
  Heart,
  MessageCircle,
  RotateCcw,
  Share2,
  ShieldCheck,
  Star,
  Store,
  Truck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/catalog";
import { STORE } from "@/lib/catalog";
import { Configurator, ConfiguratorFallback } from "@/components/three/Configurator";
import { useCart } from "@/store/cart";
import { useRecent } from "@/store/recent";
import { useUI } from "@/store/ui";
import { useDeviceTier } from "@/hooks/useDeviceTier";
import { toastAddToBag, useToasts } from "./Toaster";
import { SizeGuideModal } from "./SizeGuideModal";
import { ProductCard } from "./ProductCard";
import { cn, discountPct, inrFormat } from "@/lib/utils";
import { EASE_OUT, SPRING, fadeUp, staggerParent, tapScale } from "@/lib/motion";

const accentHex = (a: string) => (a === "pink" ? "#FF2E63" : a === "cyan" ? "#08D9D6" : "#FFC947");

type Mode = "photos" | "studio";

export function ProductDetail({ product, related }: { product: Product; related: Product[] }) {
  const [size, setSize] = useState(product.sizes[Math.min(1, product.sizes.length - 1)]);
  const [color, setColor] = useState(product.colors[0].name);
  const [qty, setQty] = useState(1);
  const [photo, setPhoto] = useState(0);
  const [mode, setMode] = useState<Mode>("photos");
  const [added, setAdded] = useState(false);
  const [wishBurst, setWishBurst] = useState(false);
  const [guide, setGuide] = useState(false);
  const [shared, setShared] = useState(false);

  const add = useCart((s) => s.add);
  const remove = useCart((s) => s.remove);
  const wishlist = useCart((s) => s.wishlist);
  const toggleWish = useCart((s) => s.toggleWish);
  const setCart = useUI((s) => s.setCart);
  const pushRecent = useRecent((s) => s.push);
  const pushToast = useToasts((s) => s.push);
  const { allow3D } = useDeviceTier();

  const accent = accentHex(product.accent);
  const off = discountPct(product.price, product.mrp);
  const wished = wishlist.includes(product.slug);
  const colorHex = product.colors.find((c) => c.name === color)?.hex ?? "#1F1F30";
  const studio = useMemo(() => {
    const isLight = ["#EDE8DE", "#F2C4CE", "#BBD3EA", "#C6B79B", "#B98A5A"].includes(colorHex);
    return { body: colorHex, accent, trim: isLight ? "#FF2E63" : "#08D9D6" };
  }, [colorHex, accent]);

  useEffect(() => {
    pushRecent(product.slug);
  }, [product.slug, pushRecent]);

  // state resets via `key={product.slug}` on the parent — no sync setState effect needed

  const reserveHref = `https://wa.me/${STORE.whatsapp.replace(/[^\d]/g, "")}?text=${encodeURIComponent(
    `Hi V-STYLE Siwan! Please RESERVE this for me to try in-store: ${product.name} (${size}, ${color}) — ${inrFormat(
      product.price,
    )}. When can I come?`,
  )}`;

  const onAdd = () => {
    add(product, size, color, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
    toastAddToBag({
      name: product.name,
      image: product.images[0],
      price: product.price * qty,
      size,
      undo: () => remove(product.slug, size, color),
    });
  };

  const onShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) await navigator.share({ title: product.name, url });
      else await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 1800);
    } catch {
      /* user dismissed */
    }
  };

  return (
    <div className="shell pb-32 pt-28 md:pt-32">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-2xs uppercase tracking-[0.22em] text-mute transition-colors hover:text-mist"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to the rack
        </Link>
        <button
          onClick={onShare}
          className="flex items-center gap-2 rounded-full border border-line bg-white/[0.04] px-4 py-2 text-2xs uppercase tracking-[0.16em] text-mute transition-colors hover:text-mist"
        >
          {shared ? <Check className="h-3.5 w-3.5 text-cyan" /> : <Share2 className="h-3.5 w-3.5" />}
          {shared ? "Copied" : "Share"}
        </button>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
        {/* ------------------------- visual ------------------------- */}
        <div>
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] border border-line bg-ink-3">
            <AnimatePresence mode="wait">
              {mode === "studio" ? (
                <motion.div
                  key="studio"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3, ease: EASE_OUT }}
                  className="absolute inset-0"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_45%,rgba(255,255,255,0.06),transparent_70%)]" />
                  {allow3D ? (
                    <Configurator
                      category={product.category}
                      body={studio.body}
                      accent={studio.accent}
                      trim={studio.trim}
                      className="h-full w-full"
                    />
                  ) : (
                    <ConfiguratorFallback image={product.images[0]} body={studio.body} className="h-full w-full" />
                  )}
                  <span className="pointer-events-none absolute bottom-4 left-4 rounded-full border border-cyan/40 bg-ink/70 px-3 py-1.5 text-[0.6rem] uppercase tracking-[0.2em] text-cyan backdrop-blur-md">
                    3D studio · drag to spin
                  </span>
                  <span className="pointer-events-none absolute bottom-4 right-4 rounded-full border border-line bg-ink/70 px-3 py-1.5 text-[0.6rem] uppercase tracking-[0.2em] text-mute backdrop-blur-md">
                    Live colour: {color}
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  key={`photo-${photo}`}
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.99 }}
                  transition={{ duration: 0.36, ease: EASE_OUT }}
                  className="absolute inset-0"
                >
                  <motion.div layoutId={`product-image-${product.slug}`} className="absolute inset-0">
                    <Image
                      src={product.images[photo]}
                      alt={product.name}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </motion.div>
                  <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-ink/85 to-transparent" />
                  <span className="absolute bottom-4 left-4 rounded-full border border-line bg-ink/70 px-3 py-1.5 text-[0.6rem] uppercase tracking-[0.2em] text-mute backdrop-blur-md">
                    Studio shot
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {off > 0 && (
              <span className="absolute left-4 top-4 z-10 rounded-full bg-pink px-3 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-white">
                {off}% off MRP
              </span>
            )}
          </div>

          {/* view switcher */}
          <div className="mt-3 flex gap-2.5">
            {product.images.map((img, i) => (
              <button
                key={img + i}
                onClick={() => {
                  setPhoto(i);
                  setMode("photos");
                }}
                className={cn(
                  "relative h-20 w-20 overflow-hidden rounded-2xl border transition-colors",
                  mode === "photos" && photo === i ? "border-cyan" : "border-line hover:border-white/25",
                )}
                aria-label={`View image ${i + 1}`}
              >
                <Image src={img} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
            <button
              onClick={() => setMode(mode === "studio" ? "photos" : "studio")}
              className={cn(
                "relative grid h-20 w-20 place-items-center overflow-hidden rounded-2xl border text-[0.58rem] uppercase tracking-[0.14em] transition-colors",
                mode === "studio" ? "border-cyan text-cyan" : "border-line text-mute hover:border-white/25",
              )}
              aria-label="Toggle 3D studio view"
            >
              <RotateCcw className="h-5 w-5" />
              3D studio
            </button>
          </div>

          <p className="mt-3 flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.16em] text-mute">
            <Eye className="h-3.5 w-3.5 text-cyan" />
            {mode === "studio"
              ? "Colour swatches update the model in real time"
              : "Tap 3D studio to spin it and try colours"}
          </p>
        </div>

        {/* ------------------------- buy box ------------------------- */}
        <motion.div variants={staggerParent(0.05)} initial="hidden" animate="show">
          <motion.div variants={fadeUp} className="flex items-center gap-3">
            <span
              className="rounded-full px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.18em] text-ink"
              style={{ background: accent }}
            >
              {product.category}
            </span>
            <span className="flex items-center gap-1 text-xs text-mute">
              <Star className="h-3.5 w-3.5 fill-gold text-gold" />
              {product.rating.toFixed(1)} · {product.reviews} reviews
            </span>
          </motion.div>

          <motion.h1 variants={fadeUp} className="display mt-4 text-display-2 text-mist">
            {product.name}
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-2 text-sm text-mute">
            {product.subtitle}
          </motion.p>

          <motion.div variants={fadeUp} className="mt-6 flex flex-wrap items-end gap-3">
            <span className="display text-4xl text-gold">{inrFormat(product.price)}</span>
            {product.mrp > product.price && (
              <>
                <span className="text-lg text-mute line-through">{inrFormat(product.mrp)}</span>
                <span className="rounded-full bg-cyan/15 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-cyan">
                  Save {inrFormat(product.mrp - product.price)}
                </span>
              </>
            )}
            <span className="ml-auto text-[0.65rem] uppercase tracking-[0.18em] text-mute">Incl. GST</span>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-4 flex flex-wrap gap-2">
            {["Try in-store", "Same-day pickup", "7-day exchange"].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-line bg-white/[0.04] px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.14em] text-mute"
              >
                {tag}
              </span>
            ))}
          </motion.div>

          <motion.p variants={fadeUp} className="mt-5 max-w-[52ch] text-sm leading-relaxed text-mute">
            {product.description}
          </motion.p>

          {/* colours */}
          <motion.div variants={fadeUp} className="mt-8">
            <p className="text-2xs uppercase tracking-[0.22em] text-mute">
              Colour · <span className="text-mist">{color}</span>
            </p>
            <div className="mt-3 flex flex-wrap gap-2.5">
              {product.colors.map((c) => (
                <motion.button
                  key={c.name}
                  whileTap={tapScale}
                  onClick={() => setColor(c.name)}
                  aria-label={c.name}
                  aria-pressed={color === c.name}
                  className={cn(
                    "relative grid h-11 w-11 place-items-center rounded-full border-2 transition-colors",
                    color === c.name ? "border-mist" : "border-line hover:border-white/40",
                  )}
                >
                  <span className="h-7 w-7 rounded-full" style={{ background: c.hex }} />
                  {color === c.name && (
                    <motion.span
                      layoutId="color-ring"
                      transition={SPRING}
                      className="absolute inset-0 rounded-full border border-cyan/60"
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* sizes */}
          <motion.div variants={fadeUp} className="mt-7">
            <div className="flex items-baseline justify-between">
              <p className="text-2xs uppercase tracking-[0.22em] text-mute">
                Size · <span className="text-mist">{size}</span>
              </p>
              <button
                onClick={() => setGuide(true)}
                className="text-2xs uppercase tracking-[0.18em] text-cyan hover:underline"
              >
                Size guide
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <motion.button
                  key={s}
                  whileTap={tapScale}
                  onClick={() => setSize(s)}
                  className={cn(
                    "relative min-w-[3.4rem] rounded-xl border px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] transition-colors",
                    size === s ? "border-transparent text-ink" : "border-line text-mute hover:text-mist",
                  )}
                >
                  {size === s && (
                    <motion.span
                      layoutId="size-pill"
                      transition={{ ...SPRING, damping: 24 }}
                      className="absolute inset-0 rounded-xl bg-mist"
                    />
                  )}
                  <span className="relative z-10">{s}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* stock */}
          <motion.div variants={fadeUp} className="mt-7">
            <div className="flex items-center justify-between text-2xs uppercase tracking-[0.18em]">
              <span className="text-mute">Store stock</span>
              <span className={product.stock <= 10 ? "text-pink" : "text-cyan"}>
                {product.stock === 0 ? "Sold out" : product.stock <= 10 ? `Only ${product.stock} left` : "In stock"}
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: Math.min(1, product.stock / 40) }}
                transition={{ duration: 0.8, ease: EASE_OUT }}
                className="h-full origin-left rounded-full"
                style={{ background: product.stock <= 10 ? "var(--color-pink)" : "var(--color-cyan)" }}
              />
            </div>
          </motion.div>

          {/* qty + CTAs */}
          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 rounded-full border border-line bg-white/[0.04] p-1.5">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid h-9 w-9 place-items-center rounded-full text-mist hover:bg-white/10"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="w-8 text-center text-sm tabular-nums text-mist">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(Math.max(1, product.stock), q + 1))}
                className="grid h-9 w-9 place-items-center rounded-full text-mist hover:bg-white/10"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <motion.button
              whileTap={tapScale}
              onClick={onAdd}
              disabled={product.stock === 0}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gold px-6 py-4 text-2xs font-bold uppercase tracking-[0.2em] text-ink shadow-glow-gold disabled:opacity-50"
            >
              <AnimatePresence mode="wait" initial={false}>
                {added ? (
                  <motion.span
                    key="y"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Check className="h-4 w-4" /> Added to bag
                  </motion.span>
                ) : (
                  <motion.span
                    key="a"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                  >
                    Add to bag · {inrFormat(product.price * qty)}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <button
              onClick={() => {
                toggleWish(product.slug);
                if (!wished) {
                  setWishBurst(true);
                  setTimeout(() => setWishBurst(false), 620);
                } else {
                  pushToast({ title: "Removed from wishlist", message: product.name });
                }
              }}
              aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
              aria-pressed={wished}
              className={cn(
                "relative grid h-[3.35rem] w-[3.35rem] place-items-center rounded-full border transition-colors",
                wished ? "border-pink/60 bg-pink/15 text-pink" : "border-line text-mute hover:text-pink",
              )}
            >
              <Heart className={cn("h-4 w-4", wished && "fill-pink")} />
              <AnimatePresence>
                {wishBurst &&
                  [{ x: -20, y: -14 }, { x: 18, y: -18 }, { x: 0, y: -28 }, { x: 24, y: -4 }].map((b, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 1, scale: 0.4 }}
                      animate={{ opacity: 0, x: b.x, y: b.y, scale: 1.1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.56, ease: EASE_OUT }}
                      className="pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-pink"
                    />
                  ))}
              </AnimatePresence>
            </button>
          </motion.div>

          <motion.a
            variants={fadeUp}
            whileTap={tapScale}
            href={reserveHref}
            target="_blank"
            rel="noreferrer"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-cyan px-6 py-4 text-2xs font-bold uppercase tracking-[0.2em] text-ink shadow-glow-cyan"
          >
            <MessageCircle className="h-4 w-4" /> Reserve &amp; try in-store
          </motion.a>

          <motion.ul
            variants={fadeUp}
            className="mt-8 space-y-3 rounded-[1.5rem] border border-line bg-white/[0.03] p-5"
          >
            {[
              { icon: Truck, label: "Delivery in Siwan", value: "2–4 days · ₹79 (free above ₹1,499)" },
              { icon: Store, label: "Store pickup", value: "Ready in 2 hours · always free" },
              { icon: ShieldCheck, label: "Exchange", value: "7-day size exchange, no questions" },
            ].map((row) => (
              <li key={row.label} className="flex items-start gap-3">
                <row.icon className="mt-0.5 h-4 w-4 shrink-0 text-cyan" />
                <p className="text-sm text-mute">
                  <span className="text-mist">{row.label}:</span> {row.value}
                </p>
              </li>
            ))}
          </motion.ul>
        </motion.div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="display text-display-3 text-mist">
            Style it <span className="kinetic">with</span>
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {related.map((p, i) => (
              <ProductCard key={p.slug} product={p} index={i} />
            ))}
          </div>
        </section>
      )}

      <SizeGuideModal open={guide} onClose={() => setGuide(false)} category={product.category} />

      {/* sticky mobile add-to-bag */}
      <motion.div
        initial={{ y: 90 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.4, ...SPRING }}
        className="fixed inset-x-0 bottom-[3.9rem] z-[60] border-t border-line bg-ink/92 px-4 py-3 backdrop-blur-2xl lg:bottom-0"
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-mute">
              {product.name} · {size}
            </p>
            <p className="display text-lg text-gold">{inrFormat(product.price * qty)}</p>
          </div>
          <button
            onClick={onAdd}
            disabled={product.stock === 0}
            className="flex items-center gap-2 rounded-full bg-gold px-6 py-3.5 text-2xs font-bold uppercase tracking-[0.18em] text-ink disabled:opacity-50"
          >
            Add to bag
          </button>
        </div>
      </motion.div>
    </div>
  );
}
