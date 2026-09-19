import type { Transition, Variants } from "motion/react";

/** Global motion tokens — springs per spec (stiffness 120 / damping 18) */
export const SPRING = { type: "spring", stiffness: 120, damping: 18, mass: 0.9 } as const;
export const SPRING_SOFT = { type: "spring", stiffness: 90, damping: 20, mass: 1.1 } as const;
export const SPRING_SNAP = { type: "spring", stiffness: 420, damping: 30 } as const;

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT = [0.83, 0, 0.17, 1] as const;

export const DUR = { fast: 0.18, base: 0.32, slow: 0.56, max: 0.7 } as const;

export const STAGGER = 0.06;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 26, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: DUR.slow, ease: EASE_OUT } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: DUR.base } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  show: { opacity: 1, scale: 1, transition: SPRING },
};

export const staggerParent = (stagger = STAGGER): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: 0.04 } },
});

export const viewportOnce = { once: true, margin: "-12% 0px -12% 0px" } as const;

export const tapScale = { scale: 0.97 } as const;

export const drawerTransition: Transition = { ...SPRING, damping: 22 };

export const CHAR_SPIN: Variants = {
  hidden: { rotateX: -92, opacity: 0, y: 22 },
  show: { rotateX: 0, opacity: 1, y: 0, transition: { ...SPRING, damping: 16 } },
};
