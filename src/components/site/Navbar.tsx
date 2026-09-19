"use client";

import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Heart, Menu, Search, ShoppingBag, X, Phone, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart, useCartHydrated } from "@/store/cart";
import { useUI } from "@/store/ui";
import { cn } from "@/lib/utils";
import { EASE_OUT, SPRING, STAGGER, tapScale } from "@/lib/motion";
import { STORE } from "@/lib/catalog";

const LINKS = [
  { label: "Shop all", href: "/shop" },
  { label: "Men", href: "/shop?cat=men" },
  { label: "Women", href: "/shop?cat=women" },
  { label: "Kids", href: "/shop?cat=kids" },
  { label: "Footwear", href: "/shop?cat=footwear" },
  { label: "Bags", href: "/shop?cat=bags" },
  { label: "Track order", href: "/orders" },
  { label: "Store", href: "/#visit" },
];

export function Navbar() {
  const { scrollY } = useScroll();
  const [compact, setCompact] = useState(false);
  const setCart = useUI((s) => s.setCart);
  const setSearch = useUI((s) => s.setSearch);
  const menuOpen = useUI((s) => s.menuOpen);
  const setMenu = useUI((s) => s.setMenu);
  const lines = useCart((s) => s.lines);
  const wishlist = useCart((s) => s.wishlist);
  const hydrated = useCartHydrated();

  useMotionValueEvent(scrollY, "change", (v) => setCompact(v > 28));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setMenu]);

  const count = lines.reduce((n, l) => n + l.qty, 0);

  return (
    <>
      <motion.header
        initial={{ y: -90, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ ...SPRING, delay: 0.15 }}
        className="fixed inset-x-0 top-0 z-[70] px-[var(--gutter)]"
      >
        <motion.div
          animate={{
            paddingTop: compact ? 8 : 14,
            paddingBottom: compact ? 8 : 14,
            borderRadius: compact ? 22 : 30,
            backgroundColor: compact ? "rgba(11,11,18,0.72)" : "rgba(11,11,18,0.28)",
          }}
          transition={{ ...SPRING, damping: 22 }}
          className={cn(
            "mx-auto flex w-full max-w-[76rem] items-center justify-between gap-3 border px-3 sm:px-4",
            compact
              ? "border-white/12 backdrop-blur-2xl saturate-150 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.95)]"
              : "border-white/8 backdrop-blur-xl",
          )}
        >
          <Link href="/" className="group flex shrink-0 items-center gap-2" aria-label="V-STYLE Siwan home">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-pink to-cyan text-ink">
              <span className="display text-lg leading-none">V</span>
            </span>
            <span className="flex flex-col leading-none">
              <span className="display text-[0.95rem] tracking-[0.18em] text-mist">V-STYLE</span>
              <span className="text-[0.55rem] uppercase tracking-[0.42em] text-cyan">Siwan</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="group relative rounded-full px-3 py-2 text-[0.8rem] font-medium uppercase tracking-[0.12em] text-mute transition-colors hover:text-mist"
              >
                {l.label}
                <span className="absolute inset-x-3 -bottom-0.5 h-[2px] origin-left scale-x-0 rounded-full bg-gradient-to-r from-pink to-cyan transition-transform duration-300 ease-out group-hover:scale-x-100" />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setSearch(true)}
              className="flex items-center gap-2 rounded-full border border-line bg-white/5 px-3 py-2 text-mute transition-colors hover:border-cyan/50 hover:text-mist"
              aria-label="Search products"
            >
              <Search className="h-4 w-4" strokeWidth={2.2} />
              <span className="hidden text-2xs uppercase tracking-[0.2em] sm:inline">Search</span>
              <kbd className="hidden rounded-md border border-line bg-ink px-1.5 py-0.5 text-[0.6rem] text-mute md:inline">
                ⌘K
              </kbd>
            </button>

            <Link
              href="/wishlist"
              className="relative grid h-10 w-10 place-items-center rounded-full border border-line bg-white/5 text-mist transition-colors hover:border-pink/60"
              aria-label="Wishlist"
            >
              <Heart className="h-4 w-4" strokeWidth={2.2} />
              {hydrated && wishlist.length > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-pink px-1 text-[0.6rem] font-bold text-white">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <motion.button
              whileTap={tapScale}
              onClick={() => setCart(true)}
              className="relative flex items-center gap-2 rounded-full bg-gold px-3.5 py-2.5 text-ink shadow-glow-gold sm:px-4"
              aria-label="Open cart"
            >
              <ShoppingBag className="h-4 w-4" strokeWidth={2.4} />
              <span className="hidden text-2xs font-bold uppercase tracking-[0.2em] sm:inline">Bag</span>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={count}
                  initial={{ scale: 0.4, opacity: 0, y: -6 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={SPRING}
                  className="grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[0.62rem] font-bold text-gold"
                >
                  {hydrated ? count : 0}
                </motion.span>
              </AnimatePresence>
            </motion.button>

            <button
              onClick={() => setMenu(true)}
              className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white/5 text-mist lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" strokeWidth={2.4} />
            </button>
          </div>
        </motion.div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="fixed inset-0 z-[80] mesh-bg lg:hidden"
          >
            <div className="flex h-full flex-col px-[var(--gutter)] pb-8 pt-6">
              <div className="flex items-center justify-between">
                <span className="display text-sm tracking-[0.34em]">V-STYLE</span>
                <button
                  onClick={() => setMenu(false)}
                  className="grid h-11 w-11 place-items-center rounded-full border border-line bg-white/5"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <motion.nav
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, transition: { duration: 0.14 } }}
                variants={{ show: { transition: { staggerChildren: STAGGER, delayChildren: 0.06 } } }}
                className="mt-10 flex flex-1 flex-col justify-center gap-1"
              >
                {LINKS.map((l) => (
                  <motion.div
                    key={l.label}
                    variants={{
                      hidden: { opacity: 0, x: -26, filter: "blur(8px)" },
                      show: { opacity: 1, x: 0, filter: "blur(0px)", transition: { ...SPRING, damping: 20 } },
                    }}
                  >
                    <Link
                      href={l.href}
                      onClick={() => setMenu(false)}
                      className="display block border-b border-white/8 py-3 text-display-3 text-mist transition-colors hover:text-cyan"
                    >
                      {l.label}
                    </Link>
                  </motion.div>
                ))}
              </motion.nav>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.42, duration: 0.5, ease: EASE_OUT }}
                className="glass space-y-3 rounded-3xl p-5"
              >
                <a href={`tel:${STORE.phone}`} className="flex items-center gap-3 text-sm text-mist">
                  <Phone className="h-4 w-4 text-cyan" /> {STORE.phone}
                </a>
                <p className="flex items-start gap-3 text-sm text-mute">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-pink" /> {STORE.address}
                </p>
                <p className="text-2xs uppercase tracking-[0.24em] text-mute">{STORE.hours}</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
