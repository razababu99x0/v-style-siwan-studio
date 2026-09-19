"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Heart, Home, Search, ShoppingBag, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useCart } from "@/store/cart";
import { useUI } from "@/store/ui";
import { cn } from "@/lib/utils";
import { SPRING } from "@/lib/motion";

/** Thumb-reach navigation for the primary mobile audience. */
export function MobileTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  const lines = useCart((s) => s.lines);
  const wishlist = useCart((s) => s.wishlist);
  const setCart = useUI((s) => s.setCart);
  const setSearch = useUI((s) => s.setSearch);

  const count = lines.reduce((n, l) => n + l.qty, 0);
  const cat = params.get("cat");

  const tabs = [
    { key: "home", label: "Home", icon: Home, active: pathname === "/" && !cat, action: "/" },
    { key: "shop", label: "Shop", icon: Sparkles, active: pathname === "/shop" || Boolean(cat), action: "/shop" },
    { key: "search", label: "Search", icon: Search, active: false, action: "search" },
    {
      key: "saved",
      label: "Saved",
      icon: Heart,
      active: pathname === "/wishlist",
      badge: wishlist.length,
      action: "/wishlist",
    },
    { key: "bag", label: "Bag", icon: ShoppingBag, active: false, badge: count, action: "cart" },
  ];

  return (
    <nav
      aria-label="Quick navigation"
      className="fixed inset-x-0 bottom-0 z-[85] border-t border-line bg-ink/88 backdrop-blur-2xl lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-5">
        {tabs.map((tab) => (
          <li key={tab.key}>
            <button
              onClick={() => {
                if (tab.action === "cart") setCart(true);
                else if (tab.action === "search") setSearch(true);
                else router.push(tab.action);
              }}
              className={cn(
                "relative flex w-full flex-col items-center gap-1 py-2.5 text-[0.58rem] font-semibold uppercase tracking-[0.12em] transition-colors",
                tab.active ? "text-gold" : "text-mute",
              )}
            >
              {tab.active && (
                <motion.span
                  layoutId="tab-indicator"
                  transition={SPRING}
                  className="absolute -top-px h-[2px] w-8 rounded-full bg-gradient-to-r from-pink to-cyan"
                />
              )}
              <span className="relative">
                <tab.icon className="h-5 w-5" strokeWidth={tab.active ? 2.4 : 1.9} />
                {tab.badge ? (
                  <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-pink px-1 text-[0.55rem] font-bold text-white">
                    {tab.badge}
                  </span>
                ) : null}
              </span>
              {tab.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
