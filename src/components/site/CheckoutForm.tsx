"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { CreditCard, Loader2, Lock, MessageCircle, ShieldCheck, Store, Truck, Wallet } from "lucide-react";
import { buildWhatsAppMessage, cartTotals, useCart, useCartHydrated } from "@/store/cart";
import { STORE } from "@/lib/catalog";
import { cn, inrFormat } from "@/lib/utils";
import { SPRING, fadeUp, staggerParent, tapScale } from "@/lib/motion";

const schema = z.object({
  customerName: z.string().min(2, "Please enter your name"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile"),
  email: z.string().email("Check the email address").or(z.literal("")),
  addressLine: z.string().or(z.literal("")),
  landmark: z.string().or(z.literal("")),
  city: z.string().min(2, "City / town required"),
  pincode: z.string().or(z.literal("")),
  notes: z.string().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;
type PayMethod = "whatsapp" | "razorpay" | "cod";

export function CheckoutForm({ razorpayEnabled }: { razorpayEnabled: boolean }) {
  const router = useRouter();
  const { lines, coupon, fulfilment, setFulfilment, clear } = useCart();
  const hydrated = useCartHydrated();
  const [method, setMethod] = useState<PayMethod>("whatsapp");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totals = cartTotals({ lines, coupon, fulfilment });

  const {
    register,
    handleSubmit,
    setError: setFieldError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { city: "Siwan", customerName: "", phone: "", email: "", addressLine: "", landmark: "", pincode: "", notes: "" },
  });

  if (hydrated && lines.length === 0) {
    return (
      <div className="glass mt-10 rounded-[2rem] p-12 text-center">
        <h2 className="display text-display-3">Your bag is empty</h2>
        <p className="mx-auto mt-3 max-w-[36ch] text-sm text-mute">
          Add a few pieces first — checkout takes under a minute.
        </p>
        <Link
          href="/#shop"
          className="mt-7 inline-block rounded-full bg-gold px-7 py-3.5 text-2xs font-bold uppercase tracking-[0.2em] text-ink shadow-glow-gold"
        >
          Back to the drop
        </Link>
      </div>
    );
  }

  const submit = handleSubmit(async (values) => {
    setError(null);
    if (fulfilment === "delivery") {
      let bad = false;
      if (!values.addressLine || values.addressLine.trim().length < 6) {
        setFieldError("addressLine", { type: "manual", message: "Enter your full street address" });
        bad = true;
      }
      if (!/^\d{6}$/.test(values.pincode ?? "")) {
        setFieldError("pincode", { type: "manual", message: "Enter a 6-digit pincode" });
        bad = true;
      }
      if (bad) return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          fulfilment,
          paymentMethod: method,
          items: lines.map((l) => ({
            slug: l.slug,
            name: l.name,
            image: l.image,
            price: l.price,
            size: l.size,
            color: l.color,
            qty: l.qty,
          })),
          subtotal: totals.subtotal,
          discount: totals.discount,
          gst: totals.gst,
          shipping: totals.shipping,
          total: totals.total,
          couponCode: coupon,
        }),
      });
      const data = (await res.json()) as { ok: boolean; orderCode?: string; error?: string };
      if (!data.ok || !data.orderCode) throw new Error(data.error ?? "Order failed");

      if (method === "whatsapp") {
        const message = buildWhatsAppMessage({
          name: values.customerName,
          orderCode: data.orderCode,
          lines,
          total: totals.total,
          fulfilment,
          fulfilmentLabel:
            fulfilment === "delivery" ? `${values.addressLine}, ${values.city} ${values.pincode}` : "Store pickup",
        });
        window.open(
          `https://wa.me/${STORE.whatsapp.replace(/[^\d]/g, "")}?text=${encodeURIComponent(message)}`,
          "_blank",
        );
      }
      if (method === "razorpay") {
        // Razorpay Checkout stub — swap for the real SDK when the env flag is on.
        await new Promise((r) => setTimeout(r, 1400));
      }

      clear();
      router.push(`/order/${data.orderCode}`);
    } catch (e) {
      setError((e as Error).message || "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  });

  return (
    <form onSubmit={submit} className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_1fr]">
      <motion.div variants={staggerParent(0.05)} initial="hidden" animate="show" className="space-y-5">
        <motion.section variants={fadeUp} className="glass rounded-[1.75rem] p-6 sm:p-7">
          <h2 className="display text-lg tracking-[0.12em]">1 · Your details</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Full name" error={errors.customerName?.message} className="sm:col-span-2">
              <input {...register("customerName")} placeholder="Aman Kumar" className={inputCls} />
            </Field>
            <Field label="Mobile number" error={errors.phone?.message}>
              <input {...register("phone")} inputMode="numeric" placeholder="98xxxxxxxx" className={inputCls} />
            </Field>
            <Field label="Email (optional)" error={errors.email?.message}>
              <input {...register("email")} type="email" placeholder="you@email.com" className={inputCls} />
            </Field>
          </div>
        </motion.section>

        <motion.section variants={fadeUp} className="glass rounded-[1.75rem] p-6 sm:p-7">
          <h2 className="display text-lg tracking-[0.12em]">2 · How do you want it?</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {(
              [
                { id: "pickup", icon: Store, title: "Store pickup", note: "Ready in 2 hours · Free" },
                { id: "delivery", icon: Truck, title: "Home delivery", note: "2–4 days · ₹79 (free over ₹1,499)" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setFulfilment(opt.id)}
                className={cn(
                  "flex items-start gap-3 rounded-2xl border p-4 text-left transition-colors",
                  fulfilment === opt.id ? "border-cyan/60 bg-cyan/10" : "border-line bg-white/[0.03] hover:border-white/25",
                )}
              >
                <opt.icon className={cn("mt-0.5 h-5 w-5", fulfilment === opt.id ? "text-cyan" : "text-mute")} />
                <span>
                  <span className="block text-sm font-semibold text-mist">{opt.title}</span>
                  <span className="mt-1 block text-xs text-mute">{opt.note}</span>
                </span>
              </button>
            ))}
          </div>

          <AnimatePresence initial={false}>
            {fulfilment === "delivery" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Field label="Street address" error={errors.addressLine?.message} className="sm:col-span-2">
                    <input {...register("addressLine")} placeholder="House / street / mohalla" className={inputCls} />
                  </Field>
                  <Field label="Landmark (optional)">
                    <input {...register("landmark")} placeholder="Near Siwan Junction" className={inputCls} />
                  </Field>
                  <Field label="Pincode" error={errors.pincode?.message}>
                    <input {...register("pincode")} inputMode="numeric" placeholder="841226" className={inputCls} />
                  </Field>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="City / town" error={errors.city?.message}>
              <input {...register("city")} placeholder="Siwan" className={inputCls} />
            </Field>
            <Field label="Order notes (optional)">
              <input {...register("notes")} placeholder="Call before delivery" className={inputCls} />
            </Field>
          </div>
        </motion.section>

        <motion.section variants={fadeUp} className="glass rounded-[1.75rem] p-6 sm:p-7">
          <h2 className="display text-lg tracking-[0.12em]">3 · Payment</h2>
          <div className="mt-5 space-y-3">
            <PayOption
              active={method === "whatsapp"}
              onClick={() => setMethod("whatsapp")}
              icon={MessageCircle}
              title="Order on WhatsApp"
              note="We confirm stock on WhatsApp, then you pay at pickup or on delivery."
              badge="Fastest"
            />
            <PayOption
              active={method === "razorpay"}
              onClick={() => setMethod("razorpay")}
              icon={CreditCard}
              title={razorpayEnabled ? "Pay online · Razorpay" : "Pay online · Razorpay (stub)"}
              note={
                razorpayEnabled
                  ? "Razorpay Checkout opens with UPI, cards, netbanking & wallets."
                  : "Demo stub — set RAZORPAY_KEY_ID to enable live Checkout."
              }
              badge={razorpayEnabled ? "Live" : "Demo"}
            />
            <PayOption
              active={method === "cod"}
              onClick={() => setMethod("cod")}
              icon={Wallet}
              title="Cash on delivery / pickup"
              note="Pay the delivery partner or at the counter. No extra charge."
            />
          </div>
        </motion.section>
      </motion.div>

      {/* ---------- summary ---------- */}
      <motion.aside
        variants={fadeUp}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="lg:sticky lg:top-28 lg:self-start"
      >
        <div className="glass-strong rounded-[1.75rem] p-6">
          <h2 className="display text-lg tracking-[0.12em]">Order summary</h2>
          <ul className="mt-5 space-y-3">
            {lines.map((l) => (
              <li key={`${l.slug}-${l.size}-${l.color}`} className="flex gap-3">
                <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-xl">
                  <Image src={l.image} alt={l.name} fill sizes="56px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-mist">{l.name}</p>
                  <p className="text-2xs uppercase tracking-[0.14em] text-mute">
                    {l.size} · {l.color} · ×{l.qty}
                  </p>
                </div>
                <p className="text-sm font-bold text-gold">{inrFormat(l.price * l.qty)}</p>
              </li>
            ))}
          </ul>

          <div className="hairline my-5" />

          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-mute">Subtotal</dt>
              <dd className="tabular-nums text-mist">{inrFormat(totals.subtotal)}</dd>
            </div>
            {totals.discount > 0 && (
              <div className="flex justify-between">
                <dt className="text-mute">Coupon {coupon}</dt>
                <dd className="tabular-nums text-cyan">− {inrFormat(totals.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-mute">GST (5%)</dt>
              <dd className="tabular-nums text-mist">{inrFormat(totals.gst)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-mute">{fulfilment === "pickup" ? "Pickup" : "Delivery"}</dt>
              <dd className={cn("tabular-nums", totals.shipping ? "text-mist" : "text-cyan")}>
                {totals.shipping ? inrFormat(totals.shipping) : "FREE"}
              </dd>
            </div>
          </dl>

          <div className="hairline my-5" />

          <div className="flex items-baseline justify-between">
            <span className="display text-sm tracking-[0.14em]">Total</span>
            <span className="display text-2xl text-gold">{inrFormat(totals.total)}</span>
          </div>

          <p className="mt-2 text-2xs text-mute">
            You save <span className="text-cyan">{inrFormat(totals.savings)}</span> vs MRP
          </p>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 rounded-xl border border-pink/40 bg-pink/10 px-3 py-2 text-xs text-pink"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button
            whileTap={tapScale}
            type="submit"
            disabled={busy}
            transition={SPRING}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gold py-4 text-2xs font-bold uppercase tracking-[0.2em] text-ink shadow-glow-gold disabled:opacity-60"
          >
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Placing order…
              </>
            ) : (
              <>
                <Lock className="h-3.5 w-3.5" /> Place order · {inrFormat(totals.total)}
              </>
            )}
          </motion.button>

          <p className="mt-4 flex items-center justify-center gap-2 text-[0.62rem] uppercase tracking-[0.16em] text-mute">
            <ShieldCheck className="h-3.5 w-3.5 text-cyan" /> 7-day size exchange
          </p>
        </div>
      </motion.aside>
    </form>
  );
}

const inputCls =
  "w-full rounded-xl border border-line bg-white/[0.04] px-4 py-3 text-sm text-mist outline-none transition-colors placeholder:text-mute/60 focus:border-cyan/60";

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-2 block text-2xs uppercase tracking-[0.2em] text-mute">{label}</span>
      {children}
      <AnimatePresence>
        {error && (
          <motion.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-1.5 block text-[0.68rem] text-pink"
          >
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </label>
  );
}

function PayOption({
  active,
  onClick,
  icon: Icon,
  title,
  note,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Truck;
  title: string;
  note: string;
  badge?: string;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors",
        active ? "border-gold/60 bg-gold/10" : "border-line bg-white/[0.03] hover:border-white/25",
      )}
    >
      <Icon className={cn("mt-0.5 h-5 w-5", active ? "text-gold" : "text-mute")} />
      <span className="flex-1">
        <span className="flex items-center gap-2 text-sm font-semibold text-mist">
          {title}
          {badge && (
            <span className="rounded-full border border-line px-2 py-0.5 text-[0.55rem] uppercase tracking-[0.14em] text-mute">
              {badge}
            </span>
          )}
        </span>
        <span className="mt-1 block text-xs leading-relaxed text-mute">{note}</span>
      </span>
      <span
        className={cn(
          "mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full border",
          active ? "border-gold bg-gold" : "border-line",
        )}
      >
        {active && <span className="h-2 w-2 rounded-full bg-ink" />}
      </span>
    </motion.button>
  );
}
