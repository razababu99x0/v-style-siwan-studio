"use client";

import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus, ShoppingBag, Tag, Trash2, Truck, Store, X, Check } from "lucide-react";
import { useState } from "react";
import { FREE_DELIVERY_FROM, cartTotals, useCart, useCartHydrated } from "@/store/cart";
import { useUI } from "@/store/ui";
import { cn, inrFormat } from "@/lib/utils";
import { drawerTransition, SPRING, tapScale } from "@/lib/motion";

export function CartDrawer() {
  const open = useUI((s) => s.cartOpen);
  const setCart = useUI((s) => s.setCart);
  const { lines, coupon, fulfilment, remove, setQty, applyCoupon, clearCoupon, setFulfilment } = useCart();
  const hydrated = useCartHydrated();
  const [code, setCode] = useState("");
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  const totals = cartTotals({ lines, coupon, fulfilment });
  const items = lines.reduce((n, l) => n + l.qty, 0);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100]">
          <motion.button
            aria-label="Close cart"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCart(false)}
            className="absolute inset-0 bg-ink/75 backdrop-blur-md"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%", transition: { duration: 0.32, ease: [0.7, 0, 0.84, 0] } }}
            transition={drawerTransition}
            className="glass-strong absolute right-0 top-0 flex h-full w-full max-w-[27rem] flex-col"
            role="dialog"
            aria-label="Shopping bag"
          >
            <header className="flex items-center justify-between border-b border-line px-5 py-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-gold" />
                <h2 className="display text-lg tracking-[0.14em]">Your Bag</h2>
                <span className="rounded-full bg-white/8 px-2 py-0.5 text-2xs text-mute">{items}</span>
              </div>
              <button
                onClick={() => setCart(false)}
                className="grid h-9 w-9 place-items-center rounded-full border border-line text-mute hover:text-mist"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            {!hydrated ? (
              <div className="flex-1 space-y-3 p-5">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="shimmer relative h-24 overflow-hidden rounded-2xl bg-white/5" />
                ))}
              </div>
            ) : lines.length === 0 ? (
              <EmptyBag />
            ) : (
              <>
                <div data-lenis-prevent className="flex-1 overflow-y-auto px-4 py-4">
                  <ul className="space-y-3">
                    <AnimatePresence initial={false}>
                      {lines.map((l) => (
                        <motion.li
                          key={`${l.slug}-${l.size}-${l.color}`}
                          layout
                          initial={{ opacity: 0, x: 32, height: 0 }}
                          animate={{ opacity: 1, x: 0, height: "auto" }}
                          exit={{ opacity: 0, x: 60, height: 0, marginBottom: 0 }}
                          transition={SPRING}
                          className="overflow-hidden"
                        >
                          <div className="flex gap-3 rounded-2xl border border-line bg-white/[0.03] p-3">
                            <Link
                              href={`/product/${l.slug}`}
                              onClick={() => setCart(false)}
                              className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl"
                            >
                              <Image src={l.image} alt={l.name} fill sizes="80px" className="object-cover" />
                            </Link>
                            <div className="flex min-w-0 flex-1 flex-col">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-mist">{l.name}</p>
                                  <p className="text-2xs uppercase tracking-[0.16em] text-mute">
                                    {l.size} · {l.color}
                                  </p>
                                </div>
                                <button
                                  onClick={() => remove(l.slug, l.size, l.color)}
                                  className="grid h-7 w-7 place-items-center rounded-lg text-mute transition-colors hover:text-pink"
                                  aria-label={`Remove ${l.name}`}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                                <div className="flex items-center gap-1 rounded-full border border-line bg-ink/60 p-1">
                                  <button
                                    onClick={() => setQty(l.slug, l.size, l.color, l.qty - 1)}
                                    className="grid h-6 w-6 place-items-center rounded-full text-mist hover:bg-white/10"
                                    aria-label="Decrease quantity"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </button>
                                  <span className="w-6 text-center text-xs tabular-nums text-mist">{l.qty}</span>
                                  <button
                                    onClick={() => setQty(l.slug, l.size, l.color, l.qty + 1)}
                                    className="grid h-6 w-6 place-items-center rounded-full text-mist hover:bg-white/10"
                                    aria-label="Increase quantity"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </button>
                                </div>
                                <p className="text-sm font-bold text-gold">{inrFormat(l.price * l.qty)}</p>
                              </div>
                            </div>
                          </div>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {(["pickup", "delivery"] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setFulfilment(mode)}
                        className={cn(
                          "flex items-center justify-center gap-2 rounded-2xl border px-3 py-2.5 text-2xs font-semibold uppercase tracking-[0.16em] transition-colors",
                          fulfilment === mode
                            ? "border-cyan/60 bg-cyan/12 text-cyan"
                            : "border-line bg-white/[0.03] text-mute hover:text-mist",
                        )}
                      >
                        {mode === "pickup" ? <Store className="h-3.5 w-3.5" /> : <Truck className="h-3.5 w-3.5" />}
                        {mode === "pickup" ? "Store pickup · Free" : "Home delivery"}
                      </button>
                    ))}
                  </div>

                  <div className="mt-3 rounded-2xl border border-line bg-white/[0.03] p-3">
                    <div className="flex items-center gap-2">
                      <Tag className="h-3.5 w-3.5 text-gold" />
                      <input
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Coupon code (SIWAN10)"
                        className="w-full bg-transparent text-sm uppercase tracking-[0.1em] text-mist outline-none placeholder:text-mute/70"
                      />
                      <button
                        onClick={() => {
                          if (coupon) {
                            clearCoupon();
                            setCode("");
                            setFeedback(null);
                            return;
                          }
                          setFeedback(applyCoupon(code));
                        }}
                        className="rounded-full bg-white/10 px-3 py-1.5 text-2xs font-bold uppercase tracking-[0.16em] text-mist"
                      >
                        {coupon ? "Clear" : "Apply"}
                      </button>
                    </div>
                    <AnimatePresence>
                      {feedback && (
                        <motion.p
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className={cn(
                            "mt-2 flex items-center gap-1.5 text-2xs",
                            feedback.ok ? "text-cyan" : "text-pink",
                          )}
                        >
                          {feedback.ok && <Check className="h-3 w-3" />}
                          {feedback.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <footer className="space-y-3 border-t border-line px-5 py-4">
                  <dl className="space-y-1.5 text-sm">
                    <Row label="Subtotal" value={inrFormat(totals.subtotal)} />
                    {totals.discount > 0 && (
                      <Row label={`Coupon ${coupon}`} value={`− ${inrFormat(totals.discount)}`} accent="cyan" />
                    )}
                    <Row label="GST (5%)" value={inrFormat(totals.gst)} />
                    <Row
                      label="Delivery"
                      value={totals.shipping === 0 ? "FREE" : inrFormat(totals.shipping)}
                      accent={totals.shipping === 0 ? "cyan" : undefined}
                    />
                    <div className="hairline my-2" />
                    <div className="flex items-baseline justify-between">
                      <dt className="display text-sm tracking-[0.14em]">Total</dt>
                      <dd className="display text-2xl text-gold">{inrFormat(totals.total)}</dd>
                    </div>
                  </dl>
                  <p className="text-2xs text-mute">
                    You save <span className="text-cyan">{inrFormat(totals.savings)}</span> vs MRP · {items} item(s)
                  </p>
                  <motion.div whileTap={tapScale}>
                    <Link
                      href="/checkout"
                      onClick={() => setCart(false)}
                      className="block w-full rounded-full bg-gold py-3.5 text-center text-sm font-bold uppercase tracking-[0.18em] text-ink shadow-glow-gold"
                    >
                      Checkout · {inrFormat(totals.total)}
                    </Link>
                  </motion.div>
                  <p className="text-center text-[0.62rem] uppercase tracking-[0.2em] text-mute">
                    UPI · Cards · Cash on pickup
                  </p>
                </footer>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

function FreeDeliveryMeter({ subtotal }: { subtotal: number }) {
  const need = FREE_DELIVERY_FROM - subtotal;
  const pct = Math.min(100, Math.round((subtotal / FREE_DELIVERY_FROM) * 100));
  return (
    <div className="rounded-2xl border border-cyan/25 bg-cyan/[0.07] p-3">
      <div className="flex items-baseline justify-between text-2xs uppercase tracking-[0.16em]">
        <span className="text-mute">
          {need > 0 ? (
            <>
              Add <span className="text-cyan">{inrFormat(need)}</span> for free delivery
            </>
          ) : (
            <span className="text-cyan">Free delivery unlocked 🎉</span>
          )}
        </span>
        <span className="tabular-nums text-mute">{pct}%</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: pct / 100 }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
          className="h-full origin-left rounded-full bg-gradient-to-r from-cyan to-cyan-soft"
        />
      </div>
      <button
        onClick={() => useCart.getState().setFulfilment("pickup")}
        className="mt-2 text-[0.62rem] uppercase tracking-[0.16em] text-mute underline decoration-dotted hover:text-mist"
      >
        Switch to free store pickup
      </button>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: "cyan" }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-mute">{label}</dt>
      <dd className={cn("tabular-nums", accent === "cyan" ? "text-cyan" : "text-mist")}>{value}</dd>
    </div>
  );
}

function EmptyBag() {
  const setCart = useUI((s) => s.setCart);
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
      <motion.svg
        width="128"
        height="128"
        viewBox="0 0 128 128"
        fill="none"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={SPRING}
      >
        <motion.g
          animate={{ rotate: [-4, 4, -4] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{ originX: "64px", originY: "12px" }}
        >
          <path d="M64 18a14 14 0 1 1 14-14" stroke="#08D9D6" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M24 26h80l-40 76L24 26z" stroke="#FF2E63" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M40 26l24 50 24-50" stroke="#FFC947" strokeWidth="2" strokeDasharray="6 6" />
        </motion.g>
      </motion.svg>
      <div>
        <h3 className="display text-display-3">Bag is empty</h3>
        <p className="mt-2 text-sm text-mute">
          Loads of ₹299–₹1,999 heat waiting. Add something before your size sells out.
        </p>
      </div>
      <Link
        href="/shop"
        onClick={() => setCart(false)}
        className="rounded-full border border-cyan/50 bg-cyan/10 px-6 py-3 text-2xs font-bold uppercase tracking-[0.2em] text-cyan"
      >
        Start shopping
      </Link>
    </div>
  );
}
