"use client";

import Link from "next/link";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SPRING, tapScale } from "@/lib/motion";

const MotionLink = motion.create(Link);

type Variant = "gold" | "pink" | "ghost" | "cyan";

const variants: Record<Variant, string> = {
  gold: "bg-gold text-ink shadow-glow-gold hover:brightness-110",
  pink: "bg-pink text-white shadow-glow-pink hover:brightness-110",
  cyan: "bg-cyan text-ink shadow-glow-cyan hover:brightness-110",
  ghost: "border border-white/18 bg-white/[0.04] text-mist backdrop-blur-md hover:border-cyan/60",
};

/** Magnetic-hover button (desktop only) with 0.97 tap scale. */
export function MagneticButton({
  children,
  href,
  onClick,
  variant = "gold",
  className,
  strength = 14,
  ariaLabel,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  className?: string;
  strength?: number;
  ariaLabel?: string;
}) {
  const reduced = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 220, damping: 16 });
  const y = useSpring(my, { stiffness: 220, damping: 16 });

  const handleMove = (e: React.MouseEvent<HTMLElement>) => {
    if (reduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    mx.set(relX * strength * 2);
    my.set(relY * strength);
  };

  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  const shared = {
    onMouseMove: handleMove,
    onMouseLeave: reset,
    whileTap: tapScale,
    style: { x, y },
    className: cn(
      "group relative inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-2xs font-bold uppercase tracking-[0.2em] transition-[filter,border-color] duration-300",
      variants[variant],
      className,
    ),
  };

  if (href) {
    return (
      <MotionLink href={href} aria-label={ariaLabel} {...shared}>
        {children}
      </MotionLink>
    );
  }
  return (
    <motion.button type="button" onClick={onClick} aria-label={ariaLabel} {...shared}>
      {children}
    </motion.button>
  );
}
