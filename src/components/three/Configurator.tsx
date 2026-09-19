"use client";

import { ContactShadows, Environment, Grid, Lightformer, OrbitControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { LazyCanvas } from "./LazyCanvas";
import { ProductModel, modelKindFor, type ModelKind } from "./ProductModel";
import { useDeviceTier } from "@/hooks/useDeviceTier";
import { cn } from "@/lib/utils";

/** Smoothly lerps material colours so swatch clicks feel alive. */
function AnimatedModel({
  kind,
  body,
  accent,
  trim,
  autoSpin,
}: {
  kind: ModelKind;
  body: string;
  accent: string;
  trim: string;
  autoSpin: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const target = useRef({ body: new THREE.Color(body), accent: new THREE.Color(accent), trim: new THREE.Color(trim) });

  useEffect(() => {
    target.current.body.set(body);
    target.current.accent.set(accent);
    target.current.trim.set(trim);
  }, [body, accent, trim]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const d = Math.min(delta, 0.05);
    if (autoSpin) g.rotation.y += d * 0.32;
    g.position.y = Math.sin(state.clock.elapsedTime * 1.1) * 0.055;
    g.traverse((child) => {
      const mesh = child as THREE.Mesh;
      const mat = mesh.material as THREE.MeshStandardMaterial | undefined;
      if (!mat || !mat.color) return;
      const isEmissive = Boolean(mat.emissive && mat.emissiveIntensity && mat.emissiveIntensity > 0.4);
      const pick = isEmissive && mat.emissive ? mat.emissive : null;
      const goal = pick
        ? pick.getHex() === 0
          ? null
          : nearestTarget(pick, target.current)
        : nearestTarget(mat.color, target.current);
      if (!goal) return;
      mat.color.lerp(goal, 1 - Math.pow(0.001, d));
      if (mat.emissive && mat.emissiveIntensity > 0.4) mat.emissive.lerp(goal, 1 - Math.pow(0.001, d));
    });
  });

  return (
    <group ref={group} scale={1.02}>
      <ProductModel kind={kind} body={body} accent={accent} trim={trim} />
    </group>
  );
}

/** Maps a material's current colour to the palette slot it belongs to. */
const tmpColor = new THREE.Color();
function nearestTarget(current: THREE.Color, target: { body: THREE.Color; accent: THREE.Color; trim: THREE.Color }) {
  const dBody = distance(current, target.body);
  const dAccent = distance(current, target.accent);
  const dTrim = distance(current, target.trim);
  const min = Math.min(dBody, dAccent, dTrim);
  if (dBody === min) return target.body;
  if (dAccent === min) return target.accent;
  return target.trim;
}

function distance(a: THREE.Color, b: THREE.Color) {
  tmpColor.copy(a).sub(b);
  return tmpColor.r * tmpColor.r + tmpColor.g * tmpColor.g + tmpColor.b * tmpColor.b;
}

export function Configurator({
  category,
  body,
  accent,
  trim,
  className,
  showGrid = true,
}: {
  category: string;
  body: string;
  accent: string;
  trim: string;
  className?: string;
  showGrid?: boolean;
}) {
  const { allow3D, tier, reducedMotion } = useDeviceTier();
  const kind = useMemo(() => modelKindFor(category), [category]);
  const autoSpin = !reducedMotion && tier !== "low";

  return (
    <div className={cn("relative", className)}>
      <LazyCanvas camera={{ position: [0, 0.5, 7.4], fov: 40 }} dpr={[1, tier === "low" ? 1.1 : 1.6]}>
        <ambientLight intensity={0.5} />
        <spotLight position={[5, 6, 5]} angle={0.6} penumbra={1} intensity={90} color="#ffffff" />
        <pointLight position={[-4, 2, 3]} intensity={34} color={accent} />
        <pointLight position={[4, -2, 3]} intensity={26} color={trim} />
        <Environment resolution={176} frames={1}>
          <Lightformer form="rect" intensity={3} color="#ffffff" position={[0, 5, -6]} scale={[12, 5, 1]} />
          <Lightformer form="circle" intensity={3.6} color={accent} position={[-6, 1, 2]} scale={[6, 6, 1]} />
          <Lightformer form="circle" intensity={3} color={trim} position={[6, -1, 2]} scale={[6, 6, 1]} />
          <Lightformer form="rect" intensity={1.4} color="#FFC947" position={[0, -5, 1]} scale={[10, 4, 1]} />
        </Environment>

        <AnimatedModel kind={kind} body={body} accent={accent} trim={trim} autoSpin={autoSpin} />

        {showGrid && (
          <Grid
            position={[0, -2.75, 0]}
            args={[16, 16]}
            cellSize={0.6}
            cellThickness={0.6}
            cellColor={accent}
            sectionSize={3}
            sectionThickness={1.1}
            sectionColor={trim}
            fadeDistance={19}
            fadeStrength={1.5}
            infiniteGrid
          />
        )}
        <ContactShadows position={[0, -2.72, 0]} opacity={0.6} scale={13} blur={2.8} far={4.6} color="#000000" />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
          minPolarAngle={Math.PI / 3.4}
          maxPolarAngle={Math.PI / 1.8}
          makeDefault
        />
      </LazyCanvas>
    </div>
  );
}

/** CSS-3D fallback shown when WebGL is unavailable or the device is low-end. */
export function ConfiguratorFallback({
  image,
  body,
  className,
}: {
  image: string;
  body: string;
  className?: string;
}) {
  return (
    <div className={cn("css3d-stage relative grid place-items-center", className)}>
      <div className="absolute inset-[12%] rounded-full blur-3xl" style={{ background: `${body}44` }} />
      <div
        className="css3d-card relative h-[74%] w-[74%] overflow-hidden rounded-[2rem] border"
        style={{ borderColor: `${body}66` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="3D studio view" className="h-full w-full object-cover" />
        <motion.div
          className="absolute inset-x-0 bottom-0 h-1/2"
          style={{ background: `linear-gradient(to top, ${body}55, transparent)` }}
        />
      </div>
    </div>
  );
}
