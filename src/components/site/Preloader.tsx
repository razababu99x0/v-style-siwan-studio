"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PreloaderScene } from "@/components/three/PreloaderScene";
import { useDeviceTier } from "@/hooks/useDeviceTier";
import { useUI } from "@/store/ui";
import { EASE_IN_OUT } from "@/lib/motion";

const MIN_MS = 1500;

export function Preloader() {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const setPreloaderDone = useUI((s) => s.setPreloaderDone);
  const { allow3D } = useDeviceTier();
  const reduced = useReducedMotion();
  const start = useRef<number>(0);

  useEffect(() => {
    start.current = Date.now();
    document.body.style.overflow = "hidden";
    let raf = 0;
    const tick = () => {
      const elapsed = Date.now() - start.current;
      // ease toward 100, gated by a minimum dwell so the sculpture is seen
      const target = Math.min(100, Math.round((elapsed / MIN_MS) * 100));
      setProgress((prev) => Math.max(prev, Math.min(target, prev + Math.ceil((target - prev) * 0.28) + 1)));
      if (target >= 100) {
        const extra = elapsed > MIN_MS + 220;
        if (extra) {
          setDone(true);
          setPreloaderDone(true);
          document.body.style.overflow = "";
          return;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = "";
    };
  }, [setPreloaderDone]);

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setProgress(101), 900);
    return () => clearTimeout(t);
  }, [done]);

  if (reduced) {
    return done ? null : (
      <div className="fixed inset-0 z-[120] grid place-items-center bg-ink">
        <span className="display text-display-3 kinetic">V-STYLE SIWAN</span>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[120] mesh-bg"
          initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
          exit={{ clipPath: "inset(0% 0% 100% 0%)", transition: { duration: 0.72, ease: EASE_IN_OUT } }}
        >
          <div className="absolute inset-0 grid-lines opacity-60" />
          <div className="relative flex h-full flex-col justify-between px-[var(--gutter)] py-8">
            <div className="flex items-baseline justify-between">
              <span className="display text-sm tracking-[0.34em] text-mist">V-STYLE</span>
              <span className="text-2xs uppercase tracking-[0.3em] text-mute">Siwan · Bihar</span>
            </div>

            <div className="relative mx-auto h-[46vh] max-h-[420px] w-full max-w-[420px]">
              {allow3D ? (
                <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0.3, 6.2], fov: 42 }} gl={{ alpha: true }}>
                  <ambientLight intensity={0.9} />
                  <directionalLight position={[3, 4, 5]} intensity={2.2} color="#ffffff" />
                  <pointLight position={[-4, 1, 2]} intensity={26} color="#FF2E63" />
                  <pointLight position={[4, -2, 3]} intensity={22} color="#08D9D6" />
                  <PreloaderScene progress={progress} />
                </Canvas>
              ) : (
                <div className="css3d-stage grid h-full place-items-center">
                  <div className="css3d-card grid h-40 w-40 place-items-center rounded-3xl border border-cyan/40 shadow-glow-pink">
                    <span className="display text-display-3 kinetic">V</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-2xs uppercase tracking-[0.3em] text-mute">Loading the drop</p>
                  <p className="display text-display-1 kinetic tabular-nums">{progress}</p>
                </div>
                <p className="max-w-[16ch] text-right text-2xs uppercase leading-relaxed tracking-[0.2em] text-mute">
                  Fashion that pops off the screen
                </p>
              </div>
              <div className="relative mt-4 h-[3px] w-full overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-pink via-cyan to-gold"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.25, ease: "linear" }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
