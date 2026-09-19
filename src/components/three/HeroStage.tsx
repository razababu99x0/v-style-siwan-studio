"use client";

import { ContactShadows, Environment, Float, Lightformer } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Sneaker } from "./Sneaker";
import { LazyCanvas } from "./LazyCanvas";
import { useDeviceTier } from "@/hooks/useDeviceTier";

function makeShellPositions(count: number) {
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const r = 3.2 + Math.random() * 4.4;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    arr[i * 3 + 1] = (Math.random() - 0.5) * 7;
    arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta) * 0.6 - 1.2;
  }
  return arr;
}

function makeDustPositions(count: number) {
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    arr[i * 3] = (Math.random() - 0.5) * 9;
    arr[i * 3 + 1] = (Math.random() - 0.5) * 6;
    arr[i * 3 + 2] = (Math.random() - 0.5) * 4;
  }
  return arr;
}

function ParticleField({ count = 170 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => makeShellPositions(count), [count]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.045;
    ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.12) * 0.06;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.055}
        color="#08D9D6"
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function DustField({ count = 60 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => makeDustPositions(count), [count]);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y -= delta * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.11}
        color="#FF2E63"
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/** Offscreen-safe neon studio lighting, built locally (no HDR downloads). */
function StudioLighting() {
  return (
    <>
      <ambientLight intensity={0.35} />
      <spotLight position={[6, 7, 5]} angle={0.5} penumbra={0.9} intensity={90} color="#ffffff" />
      <pointLight position={[-5, 2, -3]} intensity={38} color="#FF2E63" />
      <pointLight position={[4, -2, 3]} intensity={30} color="#08D9D6" />
      <Environment resolution={192} frames={1}>
        <Lightformer form="rect" intensity={3.2} color="#ffffff" position={[0, 5, -6]} scale={[12, 5, 1]} />
        <Lightformer form="circle" intensity={4} color="#FF2E63" position={[-6, 1, 2]} scale={[6, 6, 1]} />
        <Lightformer form="circle" intensity={3.4} color="#08D9D6" position={[6, -1, 2]} scale={[6, 6, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#FFC947" position={[0, -5, 1]} scale={[10, 4, 1]} />
      </Environment>
    </>
  );
}

export function HeroStage({ className }: { className?: string }) {
  const { allow3D, tier } = useDeviceTier();

  if (!allow3D) {
    return (
      <div className={className}>
        <Css3DStage />
      </div>
    );
  }

  return (
    <div className={className}>
      <LazyCanvas camera={{ position: [0, 1.1, 8.2], fov: 38 }} dpr={[1, tier === "low" ? 1.1 : 1.7]}>
        <StudioLighting />
        <Float speed={1.4} rotationIntensity={0.28} floatIntensity={0.7}>
          <Sneaker scale={0.92} />
        </Float>
        <ParticleField count={tier === "low" ? 80 : 190} />
        <DustField count={tier === "low" ? 26 : 64} />
        <ContactShadows
          position={[0, -2.35, 0]}
          opacity={0.62}
          scale={14}
          blur={2.8}
          far={4.6}
          color="#000000"
        />
      </LazyCanvas>
    </div>
  );
}

/** CSS-3D fallback — zero WebGL, still feels dimensional */
export function Css3DStage() {
  return (
    <div className="css3d-stage flex h-full w-full items-center justify-center py-10">
      <div className="css3d-card relative h-[78%] max-h-[430px] w-[78%] max-w-[430px]">
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,46,99,0.35),transparent_62%)] blur-2xl" />
        <div className="absolute inset-[8%] rounded-[36%] border border-cyan/30" />
        <div className="absolute inset-[18%] rounded-[40%] border border-pink/30" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/img/footwear-01.jpg"
          alt="V-STYLE hero sneaker"
          className="animate-float relative h-full w-full rounded-[2rem] object-cover shadow-glow-pink"
          loading="eager"
        />
        <div className="absolute -bottom-3 left-1/2 h-8 w-2/3 -translate-x-1/2 rounded-[50%] bg-black/70 blur-xl" />
      </div>
    </div>
  );
}
