"use client";

import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { cn } from "@/lib/utils";

/**
 * Mounts a WebGL canvas only once it scrolls near the viewport.
 * Keeps mid-range Android devices from paying for offscreen renders.
 */
export function LazyCanvas({
  children,
  className,
  camera,
  fallback,
  rootMargin = "300px",
  dpr = [1, 1.6],
}: {
  children: ReactNode;
  className?: string;
  camera?: { position: [number, number, number]; fov: number };
  fallback?: ReactNode;
  rootMargin?: string;
  dpr?: [number, number];
}) {
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = host.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      const id = window.setTimeout(() => setVisible(true), 0);
      return () => window.clearTimeout(id);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={host} className={cn("relative h-full w-full", className)}>
      {visible ? (
        <Canvas
          dpr={dpr}
          camera={camera ?? { position: [0, 0.6, 6], fov: 42 }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          style={{ touchAction: "pan-y" }}
        >
          <Suspense fallback={null}>{children}</Suspense>
        </Canvas>
      ) : (
        (fallback ?? null)
      )}
    </div>
  );
}
