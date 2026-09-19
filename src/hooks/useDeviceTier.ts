"use client";

import { useEffect, useState } from "react";

export type Tier = "high" | "low" | "unknown";

/** Runs once on the client — never during SSR/render. */
function probeDevice(): { tier: Tier; allow3D: boolean; reducedMotion: boolean } {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cores = navigator.hardwareConcurrency ?? 4;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const touchSmall = window.matchMedia("(max-width: 767px)").matches;
  const lowEnd = cores <= 4 || mem <= 2 || (touchSmall && cores <= 6);

  let webgl = false;
  try {
    const canvas = document.createElement("canvas");
    webgl = Boolean(
      window.WebGLRenderingContext && (canvas.getContext("webgl2") || canvas.getContext("webgl")),
    );
  } catch {
    webgl = false;
  }

  return {
    tier: lowEnd ? "low" : "high",
    allow3D: webgl && !reduced && !lowEnd,
    reducedMotion: reduced,
  };
}

/**
 * Device capability probe. Mid-range Android phones get the CSS-3D fallback
 * instead of WebGL so the page stays smooth, and prefers-reduced-motion users
 * never get parallax or auto-rotate.
 */
export function useDeviceTier(): { tier: Tier; allow3D: boolean; reducedMotion: boolean } {
  const [state, setState] = useState<{ tier: Tier; allow3D: boolean; reducedMotion: boolean }>({
    tier: "unknown",
    allow3D: false,
    reducedMotion: false,
  });

  useEffect(() => {
    const id = requestAnimationFrame(() => setState(probeDevice()));
    return () => cancelAnimationFrame(id);
  }, []);

  return state;
}
