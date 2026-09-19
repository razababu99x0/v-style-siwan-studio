"use client";

import { create } from "zustand";

type UIState = {
  cartOpen: boolean;
  menuOpen: boolean;
  searchOpen: boolean;
  preloaderDone: boolean;
  setCart: (open: boolean) => void;
  setMenu: (open: boolean) => void;
  setSearch: (open: boolean) => void;
  setPreloaderDone: (done: boolean) => void;
};

export const useUI = create<UIState>((set) => ({
  cartOpen: false,
  menuOpen: false,
  searchOpen: false,
  preloaderDone: false,
  setCart: (cartOpen) => set({ cartOpen, menuOpen: false }),
  setMenu: (menuOpen) => set({ menuOpen, cartOpen: false }),
  setSearch: (searchOpen) => set({ searchOpen }),
  setPreloaderDone: (preloaderDone) => set({ preloaderDone }),
}));
