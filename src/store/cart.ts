"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/lib/catalog";

export type CartLine = {
  slug: string;
  name: string;
  image: string;
  price: number;
  mrp: number;
  size: string;
  color: string;
  qty: number;
  stock: number;
};

export type Fulfilment = "pickup" | "delivery";

type CartState = {
  lines: CartLine[];
  wishlist: string[];
  coupon: string | null;
  fulfilment: Fulfilment;
  hydrated: boolean;
  lastAdded: string | null;
  markHydrated: () => void;
  add: (product: Product, size: string, color: string, qty?: number) => void;
  remove: (slug: string, size: string, color: string) => void;
  setQty: (slug: string, size: string, color: string, qty: number) => void;
  clear: () => void;
  toggleWish: (slug: string) => void;
  applyCoupon: (code: string) => { ok: boolean; message: string };
  clearCoupon: () => void;
  setFulfilment: (mode: Fulfilment) => void;
  count: () => number;
};

export const COUPONS: Record<string, { pct: number; label: string }> = {
  SIWAN10: { pct: 10, label: "SIWAN10 · 10% off storewide" },
  CHHATH15: { pct: 15, label: "CHHATH15 · 15% festive off" },
};

export const GST_RATE = 0.05;
export const DELIVERY_FEE = 79;
export const FREE_DELIVERY_FROM = 1499;

const key = (slug: string, size: string, color: string) => `${slug}__${size}__${color}`;

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      wishlist: [],
      coupon: null,
      fulfilment: "pickup",
      hydrated: false,
      lastAdded: null,
      markHydrated: () => set({ hydrated: true }),
      add: (product, size, color, qty = 1) => {
        const lines = [...get().lines];
        const idx = lines.findIndex((l) => key(l.slug, l.size, l.color) === key(product.slug, size, color));
        if (idx >= 0) {
          lines[idx] = {
            ...lines[idx],
            qty: Math.min(lines[idx].stock || 99, lines[idx].qty + qty),
          };
        } else {
          lines.splice(0, 0, {
            slug: product.slug,
            name: product.name,
            image: product.images[0],
            price: product.price,
            mrp: product.mrp,
            size,
            color,
            qty,
            stock: product.stock,
          });
        }
        set({ lines, lastAdded: product.slug });
      },
      remove: (slug, size, color) =>
        set({ lines: get().lines.filter((l) => key(l.slug, l.size, l.color) !== key(slug, size, color)) }),
      setQty: (slug, size, color, qty) =>
        set({
          lines: get()
            .lines.map((l) =>
              key(l.slug, l.size, l.color) === key(slug, size, color)
                ? { ...l, qty: Math.max(0, Math.min(l.stock || 99, qty)) }
                : l,
            )
            .filter((l) => l.qty > 0),
        }),
      clear: () => set({ lines: [], coupon: null }),
      toggleWish: (slug) =>
        set({
          wishlist: get().wishlist.includes(slug)
            ? get().wishlist.filter((s) => s !== slug)
            : [...get().wishlist, slug],
        }),
      applyCoupon: (code) => {
        const normalized = code.trim().toUpperCase();
        if (!normalized) return { ok: false, message: "Enter a code" };
        if (!COUPONS[normalized]) return { ok: false, message: "Invalid code — try SIWAN10" };
        set({ coupon: normalized });
        return { ok: true, message: COUPONS[normalized].label };
      },
      clearCoupon: () => set({ coupon: null }),
      setFulfilment: (mode) => set({ fulfilment: mode }),
      count: () => get().lines.reduce((n, l) => n + l.qty, 0),
    }),
    {
      name: "vstyle-siwan-cart",
      partialize: (state) => ({
        lines: state.lines,
        wishlist: state.wishlist,
        coupon: state.coupon,
        fulfilment: state.fulfilment,
      }),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated?.();
      },
    },
  ),
);

/** True once the persisted cart has been rehydrated in the browser. */
export const useCartHydrated = () => useCart((s) => s.hydrated);

export function cartTotals(state: {
  lines: CartLine[];
  coupon: string | null;
  fulfilment: Fulfilment;
}) {
  const subtotal = state.lines.reduce((sum, l) => sum + l.price * l.qty, 0);
  const mrpTotal = state.lines.reduce((sum, l) => sum + l.mrp * l.qty, 0);
  const pct = state.coupon ? (COUPONS[state.coupon]?.pct ?? 0) : 0;
  const discount = Math.round((subtotal * pct) / 100);
  const taxable = subtotal - discount;
  const gst = Math.round(taxable * GST_RATE);
  const shipping =
    state.fulfilment === "delivery" && subtotal > 0 && subtotal < FREE_DELIVERY_FROM ? DELIVERY_FEE : 0;
  const total = taxable + gst + shipping;
  const savings = mrpTotal - subtotal + discount;
  return { subtotal, mrpTotal, discount, gst, shipping, total, savings, pct };
}

export function buildWhatsAppMessage(input: {
  name: string;
  orderCode: string;
  lines: CartLine[];
  total: number;
  fulfilment: Fulfilment;
  fulfilmentLabel: string;
}) {
  const items = input.lines
    .map((l) => `• ${l.name} (${l.size}/${l.color}) x${l.qty} — ₹${(l.price * l.qty).toLocaleString("en-IN")}`)
    .join("\n");
  const mode = input.fulfilment === "pickup" ? "Store pickup" : "Home delivery";
  return [
    `Hi V-STYLE Siwan! New order ${input.orderCode}`,
    "",
    items,
    "",
    `Total: ₹${input.total.toLocaleString("en-IN")}`,
    `Fulfilment: ${mode}`,
    `Name: ${input.name}`,
    input.fulfilmentLabel ? `Address: ${input.fulfilmentLabel}` : "",
    "",
    "Please confirm availability. 🙏",
  ]
    .filter(Boolean)
    .join("\n");
}
