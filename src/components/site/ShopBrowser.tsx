"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Heart, Package, SlidersHorizontal, Star, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  type CategorySlug,
  type ColorOption,
  type Product,
} from "@/lib/catalog";
import { useCart } from "@/store/cart";
import { cn, inrFormat } from "@/lib/utils";
import { SPRING, STAGGER, fadeUp, staggerParent, viewportOnce } from "@/lib/motion";
import { ProductCard } from "./ProductCard";

type Sort = "featured" | "price-asc" | "price-desc" | "rating" | "discount";

const SORTS: { id: Sort; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: low → high" },
  { id: "price-desc", label: "Price: high → low" },
  { id: "rating", label: "Top rated" },
  { id: "discount", label: "Biggest discount" },
];

const PRICE_MIN = 299;
const PRICE_MAX = 1999;

export function ShopBrowser({
  products,
  initialCategory,
  wishOnly = false,
}: {
  products: Product[];
  initialCategory?: CategorySlug[];
  wishOnly?: boolean;
}) {
  const router = useRouter();
  const [cats, setCats] = useState<CategorySlug[]>(initialCategory ?? []);
  const [priceMax, setPriceMax] = useState(PRICE_MAX);
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("featured");
  const [savedOnly, setSavedOnly] = useState(wishOnly);
  const [drawer, setDrawer] = useState(false);
  const [loading, setLoading] = useState(true);
  const wishlist = useCart((s) => s.wishlist);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 260);
    return () => clearTimeout(t);
  }, []);

  const allSizes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.sizes.forEach((s) => set.add(s)));
    return [...set].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [products]);

  const allColors = useMemo(() => {
    const map = new Map<string, ColorOption>();
    products.forEach((p) => p.colors.forEach((c) => !map.has(c.name) && map.set(c.name, c)));
    return [...map.values()];
  }, [products]);

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (cats.length && !cats.includes(p.category)) return false;
      if (p.price > priceMax) return false;
      if (sizes.length && !p.sizes.some((s) => sizes.includes(s))) return false;
      if (colors.length && !p.colors.some((c) => colors.includes(c.name))) return false;
      if (p.rating < minRating) return false;
      if (inStockOnly && p.stock <= 0) return false;
      if (onSaleOnly && p.mrp <= p.price) return false;
      if (savedOnly && !wishlist.includes(p.slug)) return false;
      return true;
    });

    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
    if (sort === "discount")
      sorted.sort(
        (a, b) => (b.mrp - b.price) / b.mrp - (a.mrp - a.price) / a.mrp,
      );
    if (sort === "featured")
      sorted.sort(
        (a, b) =>
          Number(b.featured) - Number(a.featured) || b.reviews - a.reviews,
      );
    return sorted;
  }, [products, cats, priceMax, sizes, colors, minRating, inStockOnly, onSaleOnly, savedOnly, wishlist, sort]);

  const activeCount =
    cats.length + sizes.length + colors.length + (priceMax < PRICE_MAX ? 1 : 0) + (minRating ? 1 : 0) +
    (inStockOnly ? 1 : 0) + (onSaleOnly ? 1 : 0) + (savedOnly ? 1 : 0);

  const clearAll = () => {
    setCats([]);
    setPriceMax(PRICE_MAX);
    setSizes([]);
    setColors([]);
    setMinRating(0);
    setInStockOnly(false);
    setOnSaleOnly(false);
    setSavedOnly(false);
  };

  const toggle = <T,>(list: T[], value: T, set: (v: T[]) => void) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  // keep the URL shareable without triggering a server re-render
  useEffect(() => {
    if (loading) return;
    const params = new URLSearchParams();
    if (cats.length === 1) params.set("cat", cats[0]);
    else if (cats.length > 1) params.set("cat", cats.join(","));
    if (savedOnly) params.set("wishlist", "1");
    if (sort !== "featured") params.set("sort", sort);
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `/shop?${qs}` : "/shop");
  }, [cats, savedOnly, sort, loading]);

  const filterPanel = (
    <motion.div variants={staggerParent(0.04)} initial="hidden" animate="show" className="space-y-7">
      <FilterGroup title="Category">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <Chip key={c.slug} active={cats.includes(c.slug)} onClick={() => toggle(cats, c.slug, setCats)}>
              {c.name}
            </Chip>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title={`Max price · ${inrFormat(priceMax)}`}>
        <input
          type="range"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={50}
          value={priceMax}
          onChange={(e) => setPriceMax(Number(e.target.value))}
          className="w-full accent-cyan"
          aria-label="Maximum price"
        />
        <div className="mt-1 flex justify-between text-[0.62rem] uppercase tracking-[0.16em] text-mute">
          <span>{inrFormat(PRICE_MIN)}</span>
          <span>{inrFormat(PRICE_MAX)}</span>
        </div>
      </FilterGroup>

      <FilterGroup title="Size">
        <div className="flex flex-wrap gap-1.5">
          {allSizes.map((s) => (
            <Chip key={s} active={sizes.includes(s)} onClick={() => toggle(sizes, s, setSizes)} compact>
              {s}
            </Chip>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Colour">
        <div className="flex flex-wrap gap-2">
          {allColors.map((c) => (
            <button
              key={c.name}
              onClick={() => toggle(colors, c.name, setColors)}
              aria-label={c.name}
              aria-pressed={colors.includes(c.name)}
              title={c.name}
              className={cn(
                "grid h-9 w-9 place-items-center rounded-full border-2 transition-all",
                colors.includes(c.name) ? "border-mist scale-105" : "border-line hover:border-white/40",
              )}
            >
              <span className="h-5 w-5 rounded-full" style={{ background: c.hex }} />
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Rating">
        <div className="flex flex-wrap gap-2">
          {[0, 4, 4.5].map((r) => (
            <Chip key={r} active={minRating === r} onClick={() => setMinRating(r)}>
              {r === 0 ? (
                "Any"
              ) : (
                <span className="flex items-center gap-1">
                  {r}+ <Star className="h-3 w-3 fill-gold text-gold" />
                </span>
              )}
            </Chip>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Availability">
        <div className="space-y-2.5">
          <Toggle label="In stock only" checked={inStockOnly} onChange={setInStockOnly} icon={Package} />
          <Toggle label="On sale only" checked={onSaleOnly} onChange={setOnSaleOnly} />
          <Toggle label="My wishlist" checked={savedOnly} onChange={setSavedOnly} icon={Heart} />
        </div>
      </FilterGroup>
    </motion.div>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
      {/* desktop rail */}
      <aside className="hidden lg:block">
        <div className="sticky top-28 max-h-[calc(100svh-9rem)] overflow-y-auto pr-2 no-bar">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="display flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-mist">
              <SlidersHorizontal className="h-3.5 w-3.5 text-cyan" /> Filters
            </h2>
            {activeCount > 0 && (
              <button onClick={clearAll} className="text-2xs uppercase tracking-[0.16em] text-pink hover:underline">
                Clear ({activeCount})
              </button>
            )}
          </div>
          {filterPanel}
        </div>
      </aside>

      <div>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-mute">
            <span className="display text-lg text-mist">{filtered.length}</span> of {products.length} styles
            {cats.length === 1 && <span className="text-cyan"> · {CATEGORY_LABELS[cats[0]]}</span>}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDrawer(true)}
              className="flex items-center gap-2 rounded-full border border-line bg-white/[0.04] px-4 py-2.5 text-2xs uppercase tracking-[0.16em] text-mist lg:hidden"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-cyan" />
              Filters
              {activeCount > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-pink px-1 text-[0.6rem] font-bold text-white">
                  {activeCount}
                </span>
              )}
            </button>
            <SortMenu value={sort} onChange={setSort} />
          </div>
        </div>

        {activeCount > 0 && (
          <div className="mb-5 flex flex-wrap items-center gap-2">
            {cats.map((c) => (
              <ActivePill key={c} onRemove={() => toggle(cats, c, setCats)}>
                {CATEGORY_LABELS[c]}
              </ActivePill>
            ))}
            {sizes.map((s) => (
              <ActivePill key={s} onRemove={() => toggle(sizes, s, setSizes)}>
                Size {s}
              </ActivePill>
            ))}
            {colors.map((c) => (
              <ActivePill key={c} onRemove={() => toggle(colors, c, setColors)}>
                {c}
              </ActivePill>
            ))}
            {priceMax < PRICE_MAX && <ActivePill onRemove={() => setPriceMax(PRICE_MAX)}>Under {inrFormat(priceMax)}</ActivePill>}
            {minRating > 0 && <ActivePill onRemove={() => setMinRating(0)}>{minRating}+ stars</ActivePill>}
            {inStockOnly && <ActivePill onRemove={() => setInStockOnly(false)}>In stock</ActivePill>}
            {onSaleOnly && <ActivePill onRemove={() => setOnSaleOnly(false)}>On sale</ActivePill>}
            {savedOnly && <ActivePill onRemove={() => setSavedOnly(false)}>Wishlist</ActivePill>}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="shimmer relative h-[22rem] overflow-hidden rounded-[1.6rem] bg-white/5" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="glass rounded-[2rem] p-12 text-center">
            <p className="display text-display-3">No match</p>
            <p className="mx-auto mt-3 max-w-[42ch] text-sm text-mute">
              Nothing fits that combination yet. Loosen a filter — or clear them all and browse the full rack.
            </p>
            <button
              onClick={clearAll}
              className="mt-7 rounded-full bg-gold px-7 py-3.5 text-2xs font-bold uppercase tracking-[0.2em] text-ink shadow-glow-gold"
            >
              Clear filters
            </button>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((p, i) => (
                <ProductCard key={p.slug} product={p} index={i} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="mt-12 flex flex-col items-center gap-3">
            <div className="h-px w-full max-w-xs bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            <p className="text-2xs uppercase tracking-[0.24em] text-mute">
              That&apos;s every match · {filtered.length} styles
            </p>
            <button
              onClick={() => router.push("/#visit")}
              className="text-2xs uppercase tracking-[0.2em] text-cyan hover:underline"
            >
              Can&apos;t find your size? Ask the store →
            </button>
          </div>
        )}
      </div>

      {/* mobile filter drawer */}
      <AnimatePresence>
        {drawer && (
          <div className="fixed inset-0 z-[95] lg:hidden">
            <motion.button
              aria-label="Close filters"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawer(false)}
              className="absolute inset-0 bg-ink/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%", transition: { duration: 0.26, ease: [0.7, 0, 0.84, 0] } }}
              transition={SPRING}
              className="glass-strong absolute inset-x-0 bottom-0 max-h-[88svh] overflow-hidden rounded-t-[2rem]"
            >
              <header className="flex items-center justify-between border-b border-line px-5 py-4">
                <h2 className="display flex items-center gap-2 text-sm tracking-[0.18em]">
                  <SlidersHorizontal className="h-4 w-4 text-cyan" /> Filters
                </h2>
                <div className="flex items-center gap-3">
                  {activeCount > 0 && (
                    <button onClick={clearAll} className="text-2xs uppercase tracking-[0.16em] text-pink">
                      Clear all
                    </button>
                  )}
                  <button
                    onClick={() => setDrawer(false)}
                    className="grid h-9 w-9 place-items-center rounded-full border border-line text-mute"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </header>
              <div data-lenis-prevent className="max-h-[64svh] overflow-y-auto px-5 py-5">
                {filterPanel}
              </div>
              <div className="border-t border-line px-5 py-4">
                <button
                  onClick={() => setDrawer(false)}
                  className="w-full rounded-full bg-gold py-3.5 text-2xs font-bold uppercase tracking-[0.2em] text-ink"
                >
                  Show {filtered.length} styles
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.section variants={fadeUp}>
      <h3 className="mb-3 text-2xs uppercase tracking-[0.22em] text-mute">{title}</h3>
      {children}
    </motion.section>
  );
}

function Chip({
  active,
  onClick,
  children,
  compact,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "rounded-full border font-semibold uppercase tracking-[0.12em] transition-colors",
        compact ? "px-2.5 py-1.5 text-[0.6rem]" : "px-3.5 py-2 text-2xs",
        active
          ? "border-cyan/60 bg-cyan/15 text-cyan"
          : "border-line bg-white/[0.03] text-mute hover:text-mist",
      )}
    >
      {children}
    </motion.button>
  );
}

function Toggle({
  label,
  checked,
  onChange,
  icon: Icon,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  icon?: typeof Package;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      className="flex w-full items-center gap-3 rounded-xl px-1 py-1.5 text-left"
    >
      {Icon && <Icon className={cn("h-4 w-4", checked ? "text-cyan" : "text-mute")} />}
      <span className={cn("flex-1 text-xs", checked ? "text-mist" : "text-mute")}>{label}</span>
      <span
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full border transition-colors",
          checked ? "border-cyan/60 bg-cyan/30" : "border-line bg-white/[0.06]",
        )}
      >
        <motion.span
          animate={{ x: checked ? 16 : 2 }}
          transition={{ type: "spring", stiffness: 420, damping: 30 }}
          className={cn("absolute top-[3px] h-3 w-3 rounded-full", checked ? "bg-cyan" : "bg-mute")}
        />
      </span>
    </button>
  );
}

function ActivePill({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ ...SPRING, damping: 24 }}
      onClick={onRemove}
      className="flex items-center gap-1.5 rounded-full border border-cyan/40 bg-cyan/10 px-3 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-cyan"
    >
      {children}
      <X className="h-3 w-3" />
    </motion.button>
  );
}

function SortMenu({ value, onChange }: { value: Sort; onChange: (v: Sort) => void }) {
  const [open, setOpen] = useState(false);
  const current = SORTS.find((s) => s.id === value)!;
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-line bg-white/[0.04] px-4 py-2.5 text-2xs uppercase tracking-[0.16em] text-mist"
        aria-expanded={open}
      >
        {current.label}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <button aria-label="Close sort" className="fixed inset-0 z-20 cursor-default" onClick={() => setOpen(false)} />
            <motion.ul
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98, transition: { duration: 0.14 } }}
              transition={{ ...SPRING, damping: 24 }}
              variants={{ show: { transition: { staggerChildren: STAGGER } } }}
              className="glass-strong absolute right-0 z-30 mt-2 w-56 overflow-hidden rounded-2xl p-1.5 shadow-panel"
            >
              {SORTS.map((s) => (
                <motion.li key={s.id} variants={{ hidden: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0 } }}>
                  <button
                    onClick={() => {
                      onChange(s.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "w-full rounded-xl px-3 py-2.5 text-left text-xs transition-colors",
                      s.id === value ? "bg-cyan/12 text-cyan" : "text-mute hover:bg-white/6 hover:text-mist",
                    )}
                  >
                    {s.label}
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

export const shopViewport = viewportOnce;
