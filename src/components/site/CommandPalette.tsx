"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Search, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUI } from "@/store/ui";
import { CATEGORIES, type Product } from "@/lib/catalog";
import { discountPct, inrFormat } from "@/lib/utils";
import { EASE_OUT, SPRING } from "@/lib/motion";

const PAGES = [
  { label: "Shop all", href: "/shop", hint: "Filter the full rack" },
  { label: "Wishlist", href: "/wishlist", hint: "Everything you saved" },
  { label: "Track order", href: "/orders", hint: "Where is my order?" },
  { label: "Checkout", href: "/checkout", hint: "Pickup or delivery" },
  { label: "Store console", href: "/admin", hint: "Owner view · orders & stock" },
];

export function CommandPalette() {
  const open = useUI((s) => s.searchOpen);
  const setSearch = useUI((s) => s.setSearch);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearch(!useUI.getState().searchOpen);
      }
      if (e.key === "Escape") setSearch(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSearch]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      setQuery("");
      setIndex(0);
      inputRef.current?.focus();
    }, 40);
    if (products.length === 0) {
      requestAnimationFrame(() => setLoading(true));
      fetch("/api/products")
        .then((r) => r.json())
        .then((d: { products: Product[] }) => setProducts(d.products ?? []))
        .catch(() => setProducts([]))
        .finally(() => setLoading(false));
    }
    return () => clearTimeout(t);
  }, [open, products.length]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products.slice(0, 6);
    return products
      .filter((p) =>
        [p.name, p.category, p.subtitle, p.badge ?? ""].join(" ").toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [products, query]);

  const pages = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PAGES.slice(0, 3);
    return PAGES.filter((p) => `${p.label} ${p.hint}`.toLowerCase().includes(q)).slice(0, 4);
  }, [query]);

  /** products first, then pages — index walks this order */
  const entryTargets = useMemo(
    () => [...results.map((p) => `/product/${p.slug}`), ...pages.map((p) => p.href)],
    [results, pages],
  );

  const total = entryTargets.length;

  const onNav = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((i) => (i + 1) % Math.max(1, total));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((i) => (i - 1 + Math.max(1, total)) % Math.max(1, total));
    }
    if (e.key === "Enter" && entryTargets[index]) {
      setSearch(false);
      router.push(entryTargets[index]);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[95] flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
        >
          <motion.button
            aria-label="Close search"
            className="absolute inset-0 bg-ink/80 backdrop-blur-md"
            onClick={() => setSearch(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            initial={{ opacity: 0, y: -18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98, transition: { duration: 0.16 } }}
            transition={{ ...SPRING, damping: 24 }}
            className="glass-strong relative w-full max-w-[44rem] overflow-hidden rounded-[1.75rem] shadow-panel"
          >
            <div className="flex items-center gap-3 border-b border-line px-5 py-4">
              <Search className="h-4 w-4 shrink-0 text-cyan" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIndex(0);
                }}
                onKeyDown={onNav}
                placeholder="Search tees, sneakers, kurtis, bedsheets…"
                className="w-full bg-transparent text-[0.98rem] text-mist outline-none placeholder:text-mute/70"
              />
              <button
                onClick={() => setSearch(false)}
                className="grid h-7 w-7 place-items-center rounded-lg border border-line text-mute hover:text-mist"
                aria-label="Close"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div data-lenis-prevent className="max-h-[54vh] overflow-y-auto p-2">
              {!query && (
                <div className="px-3 pb-2 pt-3">
                  <p className="mb-2 flex items-center gap-2 text-2xs uppercase tracking-[0.26em] text-mute">
                    <Sparkles className="h-3 w-3 text-gold" /> Jump to a category
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/?cat=${c.slug}#shop`}
                        onClick={() => setSearch(false)}
                        className="rounded-full border border-line bg-white/5 px-3 py-1.5 text-2xs uppercase tracking-[0.18em] text-mute transition-colors hover:border-cyan/50 hover:text-mist"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <p className="px-3 pb-1 pt-3 text-2xs uppercase tracking-[0.26em] text-mute">
                {loading ? "Loading catalogue…" : query ? `${results.length} matches` : "Trending now"}
              </p>

              {results.map((p, i) => (
                <motion.div
                  key={p.slug}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.28, ease: EASE_OUT }}
                >
                  <Link
                    href={`/product/${p.slug}`}
                    onClick={() => setSearch(false)}
                    onMouseEnter={() => setIndex(i)}
                    className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors ${
                      i === index ? "bg-white/8" : "hover:bg-white/5"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.images[0]}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded-xl object-cover"
                      loading="lazy"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-mist">{p.name}</p>
                      <p className="truncate text-2xs uppercase tracking-[0.16em] text-mute">
                        {p.category} · {p.subtitle}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gold">{inrFormat(p.price)}</p>
                      <p className="text-2xs text-mute">-{discountPct(p.price, p.mrp)}%</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-mute" />
                  </Link>
                </motion.div>
              ))}

              {pages.length > 0 && (
                <div className="mt-2 border-t border-line pt-2">
                  <p className="px-3 pb-1 pt-2 text-2xs uppercase tracking-[0.26em] text-mute">Go to</p>
                  {pages.map((p, i) => {
                    const active = i + results.length === index;
                    return (
                      <Link
                        key={p.href}
                        href={p.href}
                        onClick={() => setSearch(false)}
                        onMouseEnter={() => setIndex(results.length + i)}
                        className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors ${
                          active ? "bg-white/8" : "hover:bg-white/5"
                        }`}
                      >
                        <span className="grid h-9 w-9 place-items-center rounded-xl border border-line text-mute">
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-mist">{p.label}</span>
                          <span className="block text-2xs uppercase tracking-[0.16em] text-mute">{p.hint}</span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}

              {!loading && query && results.length === 0 && pages.length === 0 && (
                <p className="px-3 py-8 text-center text-sm text-mute">
                  Nothing matched “{query}”. Try “sneaker”, “kurti” or “backpack”.
                </p>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-line px-5 py-2.5 text-[0.62rem] uppercase tracking-[0.2em] text-mute">
              <span>↑ ↓ to navigate · ⏎ to open</span>
              <span>V-STYLE Siwan</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
