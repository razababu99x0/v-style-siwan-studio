"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Check, Loader2, PackageSearch, Search, X } from "lucide-react";
import { useState } from "react";
import { ORDER_STATUS_META, type OrderStatus } from "@/lib/catalog";
import { cn, inrFormat } from "@/lib/utils";
import { EASE_OUT, SPRING, fadeUp, staggerParent } from "@/lib/motion";

type TimelineStep = { status: string; done: boolean; current: boolean };

type OrderPayload = {
  code: string;
  customerName: string;
  fulfilment: string;
  paymentMethod: string;
  status: string;
  total: number;
  city: string;
  items: { slug: string; name: string; image: string; size: string; color: string; qty: number; price: number }[];
};

export function OrderLookup({ initialCode = "" }: { initialCode?: string }) {
  const [code, setCode] = useState(initialCode);
  const [state, setState] = useState<"idle" | "loading" | "found" | "missing">("idle");
  const [order, setOrder] = useState<OrderPayload | null>(null);
  const [timeline, setTimeline] = useState<TimelineStep[]>([]);

  const lookup = async (value: string) => {
    const trimmed = value.trim().toUpperCase();
    if (!trimmed) return;
    setState("loading");
    setOrder(null);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(trimmed)}`);
      if (!res.ok) {
        setState("missing");
        return;
      }
      const data = (await res.json()) as { ok: boolean; order: OrderPayload; timeline: TimelineStep[] };
      setOrder(data.order);
      setTimeline(data.timeline);
      setState("found");
    } catch {
      setState("missing");
    }
  };

  return (
    <div className="max-w-3xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void lookup(code);
        }}
        className="glass flex items-center gap-2 rounded-full p-2 pl-5"
      >
        <PackageSearch className="h-4 w-4 shrink-0 text-cyan" />
        <input
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setState("idle");
          }}
          placeholder="Enter order ID · e.g. VS-XXXXXXX"
          className="w-full bg-transparent py-2.5 text-sm uppercase tracking-[0.1em] text-mist outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-mute/70"
          aria-label="Order ID"
        />
        <motion.button
          whileTap={{ scale: 0.96 }}
          type="submit"
          disabled={state === "loading"}
          className="flex shrink-0 items-center gap-2 rounded-full bg-gold px-5 py-3 text-2xs font-bold uppercase tracking-[0.18em] text-ink shadow-glow-gold disabled:opacity-60"
        >
          {state === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Track
        </motion.button>
      </form>

      <AnimatePresence mode="wait">
        {state === "missing" && (
          <motion.div
            key="missing"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: EASE_OUT }}
            className="mt-6 rounded-2xl border border-pink/40 bg-pink/10 p-5"
          >
            <p className="flex items-center gap-2 text-sm font-semibold text-pink">
              <X className="h-4 w-4" /> No order found for “{code.toUpperCase()}”
            </p>
            <p className="mt-2 text-xs text-mute">
              Double-check the ID from your confirmation screen or WhatsApp message. Still stuck? Call the
              store and we&apos;ll find it by your mobile number.
            </p>
          </motion.div>
        )}

        {state === "found" && order && (
          <motion.div
            key={order.code}
            variants={staggerParent(0.06)}
            initial="hidden"
            animate="show"
            className="mt-8 space-y-4"
          >
            <motion.div variants={fadeUp} className="glass rounded-[1.75rem] p-6 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-2xs uppercase tracking-[0.22em] text-mute">Order</p>
                  <p className="display text-2xl text-mist">{order.code}</p>
                  <p className="mt-1.5 text-sm text-mute">
                    {order.customerName} · {order.city}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className="inline-block rounded-full px-3 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.16em]"
                    style={{
                      background: `${ORDER_STATUS_META[order.status as OrderStatus]?.color ?? "#08D9D6"}22`,
                      color: ORDER_STATUS_META[order.status as OrderStatus]?.color ?? "#08D9D6",
                    }}
                  >
                    {ORDER_STATUS_META[order.status as OrderStatus]?.label ?? order.status}
                  </span>
                  <p className="display mt-2 text-2xl text-gold">{inrFormat(order.total)}</p>
                </div>
              </div>

              <p className="mt-4 text-xs text-mute">
                {ORDER_STATUS_META[order.status as OrderStatus]?.hint} ·{" "}
                {order.fulfilment === "pickup" ? "Store pickup" : "Home delivery"} ·{" "}
                {order.paymentMethod === "razorpay"
                  ? "Paid online"
                  : order.paymentMethod === "whatsapp"
                    ? "Confirmed on WhatsApp"
                    : "Cash"}
              </p>

              {/* timeline */}
              <ol className="mt-7 space-y-0">
                {timeline.map((step, i) => {
                  const meta = ORDER_STATUS_META[step.status as OrderStatus];
                  return (
                    <li key={step.status} className="relative flex gap-4 pb-6 last:pb-0">
                      {i < timeline.length - 1 && (
                        <span
                          className="absolute left-[13px] top-7 h-full w-[2px] rounded-full"
                          style={{ background: step.done ? `${meta.color}66` : "rgba(255,255,255,0.1)" }}
                        />
                      )}
                      <motion.span
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ ...SPRING, delay: i * 0.08 }}
                        className="relative z-10 grid h-7 w-7 shrink-0 place-items-center rounded-full border"
                        style={{
                          borderColor: step.done ? meta.color : "rgba(255,255,255,0.16)",
                          background: step.current ? `${meta.color}22` : "transparent",
                        }}
                      >
                        {step.done ? (
                          <Check className="h-3.5 w-3.5" style={{ color: meta.color }} strokeWidth={3} />
                        ) : (
                          <span className="h-1.5 w-1.5 rounded-full bg-mute/50" />
                        )}
                      </motion.span>
                      <div>
                        <p
                          className={cn(
                            "text-sm font-semibold",
                            step.done ? "text-mist" : "text-mute",
                          )}
                        >
                          {meta.label}
                        </p>
                        <p className="mt-0.5 text-xs text-mute">{meta.hint}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </motion.div>

            <motion.ul variants={fadeUp} className="glass divide-y divide-white/8 rounded-[1.75rem] p-2">
              {order.items.map((item) => (
                <li key={`${item.slug}-${item.size}`} className="flex items-center gap-3 p-3">
                  <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-xl">
                    <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/product/${item.slug}`} className="truncate text-sm font-semibold text-mist hover:text-cyan">
                      {item.name}
                    </Link>
                    <p className="text-2xs uppercase tracking-[0.14em] text-mute">
                      {item.size} · {item.color} · ×{item.qty}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-gold">{inrFormat(item.price * item.qty)}</p>
                </li>
              ))}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
