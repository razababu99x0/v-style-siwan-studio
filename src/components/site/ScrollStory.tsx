"use client";

import { ContactShadows, Environment, Lightformer, RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react";
import { CreditCard, PackageCheck, Shirt } from "lucide-react";
import { useRef } from "react";
import * as THREE from "three";
import { LazyCanvas } from "@/components/three/LazyCanvas";
import { useDeviceTier } from "@/hooks/useDeviceTier";
import { EASE_OUT } from "@/lib/motion";

const STOPS = [new THREE.Color("#FF2E63"), new THREE.Color("#08D9D6"), new THREE.Color("#FFC947")];

function ScrollTee({ progressRef }: { progressRef: React.RefObject<number> }) {
  const group = useRef<THREE.Group>(null);
  const accent = useRef<THREE.MeshStandardMaterial>(null);
  const body = useRef<THREE.MeshStandardMaterial>(null);
  const tmp = new THREE.Color();

  useFrame(() => {
    const p = progressRef.current ?? 0;
    const g = group.current;
    if (g) {
      g.rotation.y = -0.4 + p * Math.PI * 2.6;
      g.rotation.x = 0.12 + Math.sin(p * Math.PI) * 0.22;
      g.position.y = Math.sin(p * Math.PI * 2) * 0.12;
    }
    const from = STOPS[Math.min(STOPS.length - 1, Math.floor(p * (STOPS.length - 1) + 0.0001))];
    const idx = Math.min(STOPS.length - 2, Math.floor(p * (STOPS.length - 1)));
    const t = Math.min(1, Math.max(0, p * (STOPS.length - 1) - idx));
    tmp.lerpColors(STOPS[idx], STOPS[idx + 1] ?? STOPS[idx], t);
    if (accent.current) {
      accent.current.color.copy(from.clone().lerp(tmp, 1));
      accent.current.emissive.copy(accent.current.color);
      accent.current.emissiveIntensity = 0.9 + Math.sin(p * Math.PI) * 0.6;
    }
    if (body.current) {
      body.current.color.set("#15151f").lerp(tmp, 0.18);
    }
  });

  return (
    <group ref={group} scale={0.95}>
      {/* hanger */}
      <mesh position={[0, 2.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.28, 0.03, 10, 26]} />
        <meshStandardMaterial color="#A9ADBF" metalness={0.9} roughness={0.25} />
      </mesh>
      <mesh position={[0, 1.72, 0]}>
        <boxGeometry args={[1.9, 0.05, 0.05]} />
        <meshStandardMaterial color="#A9ADBF" metalness={0.9} roughness={0.25} />
      </mesh>

      {/* tee body */}
      <RoundedBox args={[2.15, 2.6, 0.3]} radius={0.14} smoothness={4} position={[0, 0.15, 0]}>
        <meshStandardMaterial ref={body} color="#15151f" metalness={0.35} roughness={0.55} />
      </RoundedBox>
      {/* sleeves */}
      <RoundedBox args={[1.25, 0.6, 0.28]} radius={0.13} smoothness={4} position={[-1.45, 0.95, 0]} rotation={[0, 0, 0.55]}>
        <meshStandardMaterial color="#1b1b28" metalness={0.35} roughness={0.55} />
      </RoundedBox>
      <RoundedBox args={[1.25, 0.6, 0.28]} radius={0.13} smoothness={4} position={[1.45, 0.95, 0]} rotation={[0, 0, -0.55]}>
        <meshStandardMaterial color="#1b1b28" metalness={0.35} roughness={0.55} />
      </RoundedBox>
      {/* collar */}
      <mesh position={[0, 1.35, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.34, 0.07, 12, 32]} />
        <meshStandardMaterial ref={accent} color="#FF2E63" emissive="#FF2E63" emissiveIntensity={1} metalness={0.4} roughness={0.35} />
      </mesh>
      {/* chest print strip */}
      <mesh position={[0, 0.45, 0.17]}>
        <boxGeometry args={[1.15, 0.55, 0.02]} />
        <meshStandardMaterial color="#08D9D6" emissive="#08D9D6" emissiveIntensity={1.2} toneMapped={false} />
      </mesh>
      {/* hem */}
      <mesh position={[0, -1.1, 0]}>
        <boxGeometry args={[2.2, 0.09, 0.33]} />
        <meshStandardMaterial color="#FFC947" emissive="#FFC947" emissiveIntensity={0.8} toneMapped={false} />
      </mesh>
    </group>
  );
}

const CALLOUTS = [
  {
    icon: Shirt,
    title: "Try before you buy",
    copy: "Reserve any piece online, walk into the Siwan store and try it on. Don't like it? Zero pressure, no charge.",
    accent: "#FF2E63",
  },
  {
    icon: PackageCheck,
    title: "Same-day pickup",
    copy: "Order before 6 PM and your bag is packed and waiting at the counter within two hours.",
    accent: "#08D9D6",
  },
  {
    icon: CreditCard,
    title: "UPI, cards, cash",
    copy: "Pay however you like — UPI QR, debit/credit card, or plain cash at the counter. COD on delivery too.",
    accent: "#FFC947",
  },
];

export function ScrollStory() {
  const section = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const reduced = useReducedMotion();
  const { allow3D } = useDeviceTier();

  const { scrollYProgress } = useScroll({
    target: section,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    progressRef.current = v;
  });

  const copy1 = useTransform(scrollYProgress, [0.04, 0.16, 0.3, 0.4], [0, 1, 1, 0]);
  const copy2 = useTransform(scrollYProgress, [0.34, 0.46, 0.6, 0.7], [0, 1, 1, 0]);
  const copy3 = useTransform(scrollYProgress, [0.64, 0.76, 0.92, 1], [0, 1, 1, 0]);
  const bars = [copy1, copy2, copy3];

  if (reduced) {
    return (
      <section id="story" className="shell py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {CALLOUTS.map((c) => (
            <div key={c.title} className="glass rounded-3xl p-6">
              <c.icon className="h-6 w-6" style={{ color: c.accent }} />
              <h3 className="display mt-4 text-xl">{c.title}</h3>
              <p className="mt-2 text-sm text-mute">{c.copy}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="story" ref={section} className="relative h-[320svh]">
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_50%,rgba(255,46,99,0.12),transparent_70%)]" />
        <div className="shell grid w-full items-center gap-6 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="mb-4 flex items-center gap-2 text-2xs uppercase tracking-[0.28em] text-gold">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" /> Why Siwan shops here
            </p>
            <h2 className="display text-display-2 text-mist">
              Built for <span className="kinetic">real</span> shopping
            </h2>

            <div className="relative mt-10 h-[42svh] lg:h-[46svh]">
              {CALLOUTS.map((c, i) => (
                <motion.div
                  key={c.title}
                  style={{ opacity: bars[i], y: 0 }}
                  className="absolute inset-x-0 top-0"
                >
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, ease: EASE_OUT }}
                    className="glass rounded-[1.75rem] p-6 lg:p-8"
                  >
                    <span
                      className="grid h-12 w-12 place-items-center rounded-2xl"
                      style={{ background: `${c.accent}1f`, boxShadow: `0 0 40px -12px ${c.accent}` }}
                    >
                      <c.icon className="h-5 w-5" style={{ color: c.accent }} />
                    </span>
                    <h3 className="display mt-5 text-display-3 text-mist">{c.title}</h3>
                    <p className="mt-3 max-w-[42ch] text-sm leading-relaxed text-mute">{c.copy}</p>
                    <p className="mt-5 text-[0.62rem] uppercase tracking-[0.24em] text-mute">
                      0{i + 1} / 03
                    </p>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="relative h-[52svh] lg:h-[76svh]">
            {allow3D ? (
              <LazyCanvas camera={{ position: [0, 0.3, 7.4], fov: 40 }} dpr={[1, 1.5]}>
                <ambientLight intensity={0.55} />
                <spotLight position={[5, 6, 4]} angle={0.6} penumbra={1} intensity={80} />
                <pointLight position={[-4, 1, 3]} intensity={26} color="#FF2E63" />
                <pointLight position={[4, -1, 3]} intensity={22} color="#08D9D6" />
                <Environment resolution={160} frames={1}>
                  <Lightformer form="rect" intensity={2.6} color="#ffffff" position={[0, 4, -5]} scale={[10, 5, 1]} />
                  <Lightformer form="circle" intensity={3} color="#FFC947" position={[3, -2, 3]} scale={[5, 5, 1]} />
                </Environment>
                <ScrollTee progressRef={progressRef} />
                <ContactShadows position={[0, -2.6, 0]} opacity={0.55} scale={11} blur={2.8} far={4} color="#000" />
              </LazyCanvas>
            ) : (
              <div className="css3d-stage grid h-full place-items-center">
                <div className="css3d-card relative h-[80%] w-[80%] max-w-[380px] overflow-hidden rounded-[2rem] border border-line">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/img/men-01.jpg" alt="Try in store" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
                  <p className="absolute bottom-6 left-6 right-6 display text-display-3">Try it on. Today.</p>
                </div>
              </div>
            )}

            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center gap-1.5">
              {CALLOUTS.map((c) => (
                <span key={c.title} className="h-1 w-10 rounded-full" style={{ background: `${c.accent}66` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
