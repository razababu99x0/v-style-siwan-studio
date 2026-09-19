"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type RecentState = {
  slugs: string[];
  push: (slug: string) => void;
  clear: () => void;
};

/** Recently viewed products, newest first, capped at 8. */
export const useRecent = create<RecentState>()(
  persist(
    (set, get) => ({
      slugs: [],
      push: (slug) => {
        const next = [slug, ...get().slugs.filter((s) => s !== slug)].slice(0, 8);
        set({ slugs: next });
      },
      clear: () => set({ slugs: [] }),
    }),
    { name: "vstyle-siwan-recent" },
  ),
);
