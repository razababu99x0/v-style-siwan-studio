import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** ₹1,24,999 — Indian numbering format */
export function inrFormat(value: number) {
  return inr.format(Math.round(value));
}

export function discountPct(price: number, mrp: number) {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

export function cxAccent(accent: string) {
  switch (accent) {
    case "pink":
      return "var(--color-pink)";
    case "cyan":
      return "var(--color-cyan)";
    default:
      return "var(--color-gold)";
  }
}

export function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

export function orderId() {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 5);
  return `VS-${stamp}${rand}`;
}
