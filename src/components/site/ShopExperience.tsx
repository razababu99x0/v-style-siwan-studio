"use client";

import Image from "next/image";
import { AnimatePresence, motion, useMotionTemplate, useMotionValue, useReducedMotion } from "motion/react";
import { ArrowUpRight, Check, ChevronDown, Heart, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CATEGORIES, CATEGORY_LABELS, type CategorySlug, type Product } from "@/lib/catalog";
import { useCart } from "@/store/cart";
import { cn } from "@/lib/utils";
import { SPRING, STAGGER, fadeUp, staggerParent, viewportOnce } from "@/lib/motion";
import { ProductCard } from "./ProductCard";

type Sort = "featured" | "price-asc" | "price-desc" | "rating";
const SORTS: { id: Sort; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: low → high" },
  { id: "price-desc", label: "Price: high → low" },
  { id: "rating", label: "Top rated" },
];

export function ShopExperience({
  products,
  initialCategory = "all",
  initialWishlist = false,
}: {
  products: Product[];
  initialCategory?: CategorySlug | "all";
  initialWishlist?: boolean;
}) {
  const router = useRouter();
  const [cat, setCat] = useState<CategorySlug | "all">(initialCategory);
  const [sort, setSort] = useState<Sort>("featured");
  const [wishOnly, setWishOnly] = useState(initialWishlist);
  const wishlist = useCart((s) => s.wishlist);

  const filtered = useMemo(() => {
    let list = products.filter((p) => (cat === "all" ? true : p.category === cat));
    if (wishOnly) list = list.filter((p) => wishlist.includes(p.slug));
    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
    if (sort === "featured") sorted.sort((a, b) => Number(b.featured) - Number(a.featured));
    return sorted;
  }, [products, cat, sort, wishOnly, wishlist]);

  const jump = (slug: CategorySlug) => {
    setCat(slug);
    setWishOnly(false);
    document.getElementById("shop")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openFullRack = (slug: CategorySlug) => {
    router.push(`/shop?cat=${slug}`);
  };

  return (
    <>
      {/* ---------------- 5 · CATEGORY BENTO ---------------- */}
      <section id="categories" className="shell py-20 md:py-28">
        <SectionHead
          kicker="Shop by floor"
          title={
            <>
              Six aisles of <span className="kinetic">style</span>
            </>
          }
          copy="Everything in the store, mapped. Tap a tile to filter the live catalogue below."
        />

        <motion.div
          variants={staggerParent()}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid auto-rows-[minmax(150px,auto)] grid-cols-1 gap-3 md:grid-cols-6"
        >
          {CATEGORIES.map((c) => (
            <BentoCard key={c.slug} {...c} onPick={jump} />
          ))}
        </motion.div>
      </section>

      {/* ---------------- 6 · TRENDING GRID ---------------- */}
      <section id="shop" className="relative scroll-mt-24 py-16 md:py-24">
        <div className="shell">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="mb-3 flex items-center gap-2 text-2xs uppercase tracking-[0.28em] text-cyan">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan" /> Trending this week
              </p>
              <h2 className="display text-display-2 text-mist">
                {cat === "all" ? "Everything" : CATEGORY_LABELS[cat]}{" "}
                <span className="stroke-text">in stock</span>
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <SortMenu value={sort} onChange={setSort} />
              <button
                onClick={() => router.push("/shop")}
                className="hidden items-center gap-2 rounded-full border border-line bg-white/[0.04] px-4 py-2.5 text-2xs uppercase tracking-[0.16em] text-mist transition-colors hover:border-cyan/50 sm:flex"
              >
                All filters <ArrowUpRight className="h-3.5 w-3.5 text-cyan" />
              </button>
            </div>
          </div>

          <div className="no-bar mt-8 flex gap-2 overflow-x-auto pb-2">
            <FilterChip active={cat === "all" && !wishOnly} onClick={() => { setCat("all"); setWishOnly(false); }}>
              All
            </FilterChip>
            {CATEGORIES.map((c) => (
              <FilterChip key={c.slug} active={cat === c.slug && !wishOnly} onClick={() => jump(c.slug)}>
                {c.name}
              </FilterChip>
            ))}
            <button
              onClick={() => router.push("/wishlist")}
              className="flex shrink-0 items-center rounded-full border border-line bg-white/[0.04] px-4 py-2 text-2xs font-semibold uppercase tracking-[0.16em] text-mute transition-colors hover:text-mist"
            >
              <Heart className={cn("mr-1.5 h-3 w-3", wishlist.length > 0 && "fill-pink text-pink")} />
              Wishlist ({wishlist.length})
            </button>
            <button
              onClick={() => router.push("/orders")}
              className="flex shrink-0 items-center rounded-full border border-line bg-white/[0.04] px-4 py-2 text-2xs font-semibold uppercase tracking-[0.16em] text-mute transition-colors hover:text-mist"
            >
              Track order
            </button>
          </div>

          <motion.div layout className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((p, i) => (
                <ProductCard key={p.slug} product={p} index={i} />
              ))}
            </AnimatePresence>
          </motion.div>

          {filtered.length === 0 && (
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="glass mt-10 rounded-3xl p-12 text-center"
            >
              <p className="display text-display-3">Nothing here yet</p>
              <p className="mt-3 text-sm text-mute">
                {wishOnly
                  ? "Your wishlist is empty — tap the heart on any product to save it."
                  : "This aisle is restocking. Try another category."}
              </p>
            </motion.div>
          )}
        </div>
      </section>
    </>
  );
}

function SectionHead({ kicker, title, copy }: { kicker: string; title: React.ReactNode; copy: string }) {
  return (
    <motion.div
      variants={staggerParent()}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className="mb-10 max-w-3xl"
    >
      <motion.p variants={fadeUp} className="mb-4 flex items-center gap-2 text-2xs uppercase tracking-[0.28em] text-pink">
        <span className="h-1.5 w-1.5 rounded-full bg-pink" /> {kicker}
      </motion.p>
      <motion.h2 variants={fadeUp} className="display text-display-2 text-mist">
        {title}
      </motion.h2>
      <motion.p variants={fadeUp} className="mt-4 max-w-[52ch] text-lead text-mute">
        {copy}
      </motion.p>
    </motion.div>
  );
}

function BentoCard({
  slug,
  name,
  tagline,
  count,
  image,
  accent,
  span,
  onPick,
}: (typeof CATEGORIES)[number] & { onPick: (slug: CategorySlug) => void }) {
  const reduced = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  const setTilt = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    mx.set(px * 100);
    my.set(py * 100);
    if (reduced) return;
    rotateY.set((px - 0.5) * 12);
    rotateX.set((0.5 - py) * 10);
  };

  const reset = () => {
    rotateX.set(0);
    rotateY.set(0);
    mx.set(50);
    my.set(50);
  };

  const glow = useMotionTemplate`radial-gradient(220px circle at ${mx}% ${my}%, rgba(255,255,255,0.22), transparent 65%)`;
  const accentHex = accent === "pink" ? "#FF2E63" : accent === "cyan" ? "#08D9D6" : "#FFC947";

  return (
    <motion.button
      variants={{
        hidden: { opacity: 0, y: 34, scale: 0.97 },
        show: { opacity: 1, y: 0, scale: 1, transition: { ...SPRING, damping: 20 } },
      }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onMouseMove={setTilt}
      onMouseLeave={reset}
      onClick={() => onPick(slug)}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      className={cn(
        "group relative isolate flex min-h-[170px] flex-col justify-end overflow-hidden rounded-[1.6rem] border border-line bg-ink-2 p-5 text-left md:min-h-[210px]",
        span,
      )}
    >
      <Image
        src={image}
        alt={name}
        fill
        sizes="(max-width: 768px) 100vw, 45vw"
        className="-z-10 object-cover opacity-55 transition-all duration-700 ease-out group-hover:scale-105 group-hover:opacity-75"
      />
      <div
        className="-z-10 absolute inset-0"
        style={{ background: `linear-gradient(180deg, rgba(11,11,18,0.35) 0%, rgba(11,11,18,0.92) 72%)` }}
      />
      <motion.div style={{ background: glow }} className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div
        className="pointer-events-none absolute inset-0 rounded-[1.6rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ boxShadow: `inset 0 0 0 1.5px ${accentHex}80` }}
      />

      <div className="relative">
        <span
          className="mb-2 inline-block rounded-full px-2.5 py-1 text-[0.58rem] font-bold uppercase tracking-[0.18em] text-ink"
          style={{ background: accentHex }}
        >
          {count}+ styles
        </span>
        <h3 className="display flex items-center gap-2 text-display-3 text-mist">
          {name}
          <ArrowUpRight className="h-5 w-5 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
        </h3>
        <p className="mt-1.5 max-w-[34ch] text-xs text-mute">{tagline}</p>
      </div>
    </motion.button>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      className={cn(
        "relative shrink-0 rounded-full border px-4 py-2 text-2xs font-semibold uppercase tracking-[0.16em] transition-colors",
        active ? "border-transparent text-ink" : "border-line text-mute hover:text-mist",
      )}
    >
      {active && (
        <motion.span
          layoutId="chip-pill"
          transition={{ ...SPRING, damping: 22 }}
          className="absolute inset-0 rounded-full bg-gradient-to-r from-gold to-gold-soft"
        />
      )}
      <span className="relative z-10 flex items-center">{children}</span>
    </motion.button>
  );
}

function SortMenu({ value, onChange }: { value: Sort; onChange: (v: Sort) => void }) {
  const [open, setOpen] = useState(false);
  const current = SORTS.find((s) => s.id === value)!;

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-line bg-white/[0.04] px-4 py-2.5 text-2xs uppercase tracking-[0.16em] text-mist"
        aria-expanded={open}
      >
        <SlidersHorizontal className="h-3.5 w-3.5 text-cyan" />
        {current.label}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <button
              aria-label="Close sort menu"
              className="fixed inset-0 z-20 cursor-default"
              onClick={() => setOpen(false)}
            />
            <motion.ul
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98, transition: { duration: 0.14 } }}
              transition={{ ...SPRING, damping: 24 }}
              variants={{ show: { transition: { staggerChildren: STAGGER } } }}
              className="glass-strong absolute right-0 z-30 mt-2 w-56 overflow-hidden rounded-2xl p-1.5 shadow-panel"
            >
              {SORTS.map((s) => (
                <motion.li
                  key={s.id}
                  variants={{ hidden: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0 } }}
                >
                  <button
                    onClick={() => {
                      onChange(s.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs transition-colors",
                      s.id === value ? "bg-cyan/12 text-cyan" : "text-mute hover:bg-white/6 hover:text-mist",
                    )}
                  >
                    {s.label}
                    {s.id === value && <Check className="h-3.5 w-3.5" />}
                  </button>
                </motion.li>
              ))}
            </motion.ul>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
