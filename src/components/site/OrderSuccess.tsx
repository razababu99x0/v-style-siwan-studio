"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Check, MessageCircle, PackageCheck, Store, Truck } from "lucide-react";
import { ConfettiStage } from "@/components/three/ConfettiStage";
import { STORE } from "@/lib/catalog";
import { inrFormat } from "@/lib/utils";
import { SPRING, fadeUp, staggerParent } from "@/lib/motion";

type Item = { slug: string; name: string; image: string; size: string; color: string; qty: number; price: number };

export function OrderSuccess({
  code,
  customerName,
  fulfilment,
  paymentMethod,
  total,
  items,
}: {
  code: string;
  customerName: string;
  fulfilment: string;
  paymentMethod: string;
  total: number;
  items: Item[];
}) {
  const waHref = `https://wa.me/${STORE.whatsapp.replace(/[^\d]/g, "")}?text=${encodeURIComponent(
    `Hi V-STYLE Siwan! Order ${code} placed for ${inrFormat(total)}. Please confirm.`,
  )}`;

  return (
    <div className="relative shell pb-24 pt-28 md:pt-36">
      <ConfettiStage className="pointer-events-none absolute inset-0 -z-10 h-full w-full" />

      <motion.div variants={staggerParent(0.07)} initial="hidden" animate="show" className="max-w-3xl">
        <motion.span
          variants={fadeUp}
          className="grid h-16 w-16 place-items-center rounded-3xl bg-gold text-ink shadow-glow-gold"
        >
          <Check className="h-8 w-8" strokeWidth={3} />
        </motion.span>

        <motion.h1 variants={fadeUp} className="display mt-7 text-display-1 text-mist">
          Order <span className="kinetic">locked</span>
        </motion.h1>

        <motion.p variants={fadeUp} className="mt-4 max-w-[52ch] text-lead text-mute">
          Thanks {customerName.split(" ")[0]}! Your order ID is{" "}
          <span className="font-semibold text-mist">{code}</span>. We&apos;ll message you on WhatsApp the
          moment it&apos;s packed.
        </motion.p>

        <motion.div variants={fadeUp} className="mt-8 grid gap-3 sm:grid-cols-2">
          <div className="glass flex items-start gap-3 rounded-2xl p-5">
            {fulfilment === "pickup" ? (
              <Store className="mt-0.5 h-5 w-5 text-cyan" />
            ) : (
              <Truck className="mt-0.5 h-5 w-5 text-cyan" />
            )}
            <div>
              <p className="text-sm font-semibold text-mist">
                {fulfilment === "pickup" ? "Store pickup" : "Home delivery"}
              </p>
              <p className="mt-1 text-xs text-mute">
                {fulfilment === "pickup"
                  ? `Ready in ~2 hours · ${STORE.address}`
                  : "Arriving in 2–4 days across Siwan district"}
              </p>
            </div>
          </div>
          <div className="glass flex items-start gap-3 rounded-2xl p-5">
            <PackageCheck className="mt-0.5 h-5 w-5 text-gold" />
            <div>
              <p className="text-sm font-semibold text-mist">
                {paymentMethod === "razorpay"
                  ? "Paid online"
                  : paymentMethod === "whatsapp"
                    ? "Confirm on WhatsApp"
                    : "Cash on pickup / delivery"}
              </p>
              <p className="mt-1 text-xs text-mute">Total {inrFormat(total)} · 7-day size exchange</p>
            </div>
          </div>
        </motion.div>

        <motion.ul variants={fadeUp} className="glass mt-4 divide-y divide-white/8 rounded-[1.75rem] p-2">
          {items.map((i) => (
            <li key={`${i.slug}-${i.size}-${i.color}`} className="flex items-center gap-3 p-3">
              <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-xl">
                <Image src={i.image} alt={i.name} fill sizes="56px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/product/${i.slug}`} className="truncate text-sm font-semibold text-mist hover:text-cyan">
                  {i.name}
                </Link>
                <p className="text-2xs uppercase tracking-[0.14em] text-mute">
                  {i.size} · {i.color} · ×{i.qty}
                </p>
              </div>
              <p className="text-sm font-bold text-gold">{inrFormat(i.price * i.qty)}</p>
            </li>
          ))}
        </motion.ul>

        <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
          <motion.div whileHover={{ y: -2 }} transition={SPRING}>
            <a
              href={waHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-cyan px-6 py-3.5 text-2xs font-bold uppercase tracking-[0.2em] text-ink shadow-glow-cyan"
            >
              <MessageCircle className="h-4 w-4" /> Message the store
            </a>
          </motion.div>
          <Link
            href="/#shop"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.04] px-6 py-3.5 text-2xs font-bold uppercase tracking-[0.2em] text-mist hover:border-cyan/50"
          >
            Keep shopping
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
