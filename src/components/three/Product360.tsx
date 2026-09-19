"use client";

import { ContactShadows, Edges, OrbitControls, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { LazyCanvas } from "./LazyCanvas";
import { useDeviceTier } from "@/hooks/useDeviceTier";
import { cn } from "@/lib/utils";

function prepareTexture(texture: THREE.Texture) {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
}

function PhotoSlab({ src, accent }: { src: string; accent: string }) {
  const texture = useTexture(src);
  const group = useRef<THREE.Group>(null);

  useEffect(() => {
    prepareTexture(texture);
  }, [texture]);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.position.y = Math.sin(t * 1.1) * 0.08;
  });

  return (
    <group ref={group}>
      <mesh>
        <boxGeometry args={[2.9, 3.9, 0.18]} />
        <meshStandardMaterial attach="material-0" color="#15151f" metalness={0.55} roughness={0.4} />
        <meshStandardMaterial attach="material-1" color="#15151f" metalness={0.55} roughness={0.4} />
        <meshStandardMaterial attach="material-2" color={accent} emissive={accent} emissiveIntensity={0.25} />
        <meshStandardMaterial attach="material-3" color="#0d0d14" />
        <meshBasicMaterial attach="material-4" map={texture} toneMapped={false} />
        <meshBasicMaterial attach="material-5" map={texture} toneMapped={false} />
        <Edges scale={1.015} threshold={15} color={accent} />
      </mesh>
    </group>
  );
}

/**
 * Real 3D 360° viewer — drag to spin the product, auto-rotates when idle.
 */
export function Product360({
  image,
  accent = "#FF2E63",
  className,
}: {
  image: string;
  accent?: string;
  className?: string;
}) {
  const { allow3D } = useDeviceTier();
  const reduced = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  if (!allow3D) {
    return <Css360 image={image} accent={accent} className={className} />;
  }

  return (
    <div className={cn("relative", className)}>
      <LazyCanvas camera={{ position: [0, 0.2, 6.4], fov: 40 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.7} />
        <spotLight position={[4, 5, 4]} intensity={60} angle={0.6} penumbra={1} />
        <pointLight position={[-4, 1, 2]} intensity={22} color={accent} />
        <PhotoSlab src={image} accent={accent} />
        <ContactShadows position={[0, -2.5, 0]} opacity={0.5} scale={9} blur={2.6} far={4} color="#000" />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={!reduced}
          autoRotateSpeed={1.6}
          minPolarAngle={Math.PI / 3.1}
          maxPolarAngle={Math.PI / 1.75}
          makeDefault
        />
      </LazyCanvas>
      <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-line bg-ink/70 px-3 py-1 text-2xs uppercase tracking-[0.2em] text-mute">
        Drag to rotate · 360°
      </span>
    </div>
  );
}

/** Pointer-drag CSS 3D fallback */
function Css360({ image, accent, className }: { image: string; accent: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, x: 0, rot: -18 });

  return (
    <div
      ref={ref}
      className={cn("css3d-stage relative flex items-center justify-center", className)}
      onPointerDown={(e) => {
        drag.current.active = true;
        drag.current.x = e.clientX;
      }}
      onPointerUp={() => (drag.current.active = false)}
      onPointerLeave={() => (drag.current.active = false)}
      onPointerMove={(e) => {
        if (!drag.current.active || !ref.current) return;
        const dx = e.clientX - drag.current.x;
        drag.current.x = e.clientX;
        drag.current.rot += dx * 0.5;
        ref.current.style.transform = `rotateY(${drag.current.rot}deg) rotateX(6deg)`;
      }}
    >
      <div
        className="relative h-full w-full transition-transform duration-75"
        style={{ transform: "rotateY(-18deg) rotateX(6deg)", transformStyle: "preserve-3d" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt="360 view"
          className="h-full w-full rounded-2xl object-cover"
          style={{ boxShadow: `0 30px 80px -30px ${accent}` }}
        />
      </div>
      <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-line bg-ink/70 px-3 py-1 text-2xs uppercase tracking-[0.2em] text-mute">
        Drag to rotate · 360°
      </span>
    </div>
  );
}
