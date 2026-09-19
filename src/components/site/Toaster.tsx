"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Check, ShoppingBag, X } from "lucide-react";
import { create } from "zustand";
import { inrFormat } from "@/lib/utils";
import { EASE_OUT, SPRING } from "@/lib/motion";

export type Toast = {
  id: number;
  title: string;
  message?: string;
  image?: string;
  price?: number;
  href?: string;
  undo?: () => void;
};

type ToastState = {
  toasts: Toast[];
  push: (toast: Omit<Toast, "id">) => void;
  dismiss: (id: number) => void;
};

export const useToasts = create<ToastState>((set, get) => ({
  toasts: [],
  push: (toast) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    set({ toasts: [...get().toasts, { ...toast, id }].slice(-3) });
    setTimeout(() => get().dismiss(id), 4200);
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));

/** Convenience helper for the add-to-bag flow. */
export function toastAddToBag(input: {
  name: string;
  image: string;
  price: number;
  size: string;
  undo: () => void;
}) {
  useToasts.getState().push({
    title: "Added to bag",
    message: `${input.name} · ${input.size}`,
    image: input.image,
    price: input.price,
    href: "/checkout",
    undo: input.undo,
  });
}

export function Toaster() {
  const { toasts, dismiss } = useToasts();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[5.5rem] z-[110] flex flex-col items-center gap-2 px-4 lg:bottom-6 lg:items-end lg:px-6">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 28, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.95, transition: { duration: 0.16 } }}
            transition={SPRING}
            className="glass-strong pointer-events-auto flex w-full max-w-[24rem] items-center gap-3 rounded-2xl p-3 shadow-panel"
          >
            {t.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={t.image} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover" />
            ) : (
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-cyan/15">
                <Check className="h-5 w-5 text-cyan" />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-2xs font-bold uppercase tracking-[0.18em] text-cyan">
                <ShoppingBag className="h-3 w-3" /> {t.title}
              </p>
              <p className="truncate text-sm text-mist">{t.message}</p>
              {typeof t.price === "number" && (
                <p className="text-xs text-gold">{inrFormat(t.price)}</p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              {t.undo && (
                <button
                  onClick={() => {
                    t.undo?.();
                    dismiss(t.id);
                  }}
                  className="rounded-full border border-line px-2.5 py-1.5 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-mute transition-colors hover:text-pink"
                >
                  Undo
                </button>
              )}
              {t.href && (
                <Link
                  href={t.href}
                  onClick={() => dismiss(t.id)}
                  className="rounded-full bg-gold px-3 py-1.5 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-ink"
                >
                  Checkout
                </Link>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="grid h-6 w-6 shrink-0 place-items-center rounded-lg text-mute transition-colors hover:text-mist"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/** Small inline confirmation pill for micro-actions (wishlist etc.). */
export function toastSimple(title: string) {
  useToasts.getState().push({ title });
  requestAnimationFrame(() => {
    /* keep animation frame budget free */
  });
}

export const TOAST_EASE = EASE_OUT;
