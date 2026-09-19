"use client";

import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type SneakerProps = {
  body?: string;
  accent?: string;
  sole?: string;
  spin?: number;
  parallax?: number;
  scale?: number;
  pointer?: { x: number; y: number };
};

/**
 * Stylised low-poly sneaker assembled from primitives (no external GLB needed).
 * Auto-rotates, floats, and leans toward the pointer.
 */
export function Sneaker({
  body = "#16161f",
  accent = "#FF2E63",
  sole = "#08D9D6",
  spin = 0.35,
  parallax = 0.28,
  scale = 1,
  pointer,
}: SneakerProps) {
  const group = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const g = group.current;
    const i = inner.current;
    if (!g || !i) return;
    if (spin > 0) g.rotation.y += delta * spin;
    const px = pointer?.x ?? state.pointer.x;
    const py = pointer?.y ?? state.pointer.y;
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -py * parallax + Math.sin(t * 0.55) * 0.04, 0.06);
    g.position.x = THREE.MathUtils.lerp(g.position.x, px * parallax * 1.1, 0.06);
    i.position.y = Math.sin(t * 1.15) * 0.09;
    i.rotation.z = Math.sin(t * 0.75) * 0.035;
  });

  const laces = useMemo(() => [0, 1, 2, 3], []);

  return (
    <group ref={group} scale={scale}>
      <group ref={inner} rotation={[0.12, -0.25, 0.04]}>
        {/* outsole */}
        <RoundedBox args={[3.5, 0.42, 1.45]} radius={0.18} smoothness={3} position={[0, -0.62, 0]}>
          <meshStandardMaterial color={sole} emissive={sole} emissiveIntensity={0.55} roughness={0.35} metalness={0.25} />
        </RoundedBox>
        {/* midsole with neon stripe */}
        <RoundedBox args={[3.42, 0.34, 1.4]} radius={0.14} smoothness={3} position={[0, -0.32, 0]}>
          <meshStandardMaterial color="#20202c" roughness={0.55} metalness={0.15} />
        </RoundedBox>
        <RoundedBox args={[3.46, 0.09, 1.44]} radius={0.03} smoothness={2} position={[0, -0.32, 0]}>
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.4} toneMapped={false} />
        </RoundedBox>
        {/* upper */}
        <RoundedBox args={[3.0, 0.82, 1.22]} radius={0.3} smoothness={4} position={[-0.12, 0.16, 0]}>
          <meshStandardMaterial color={body} roughness={0.42} metalness={0.5} />
        </RoundedBox>
        {/* toe box */}
        <mesh position={[1.42, 0.02, 0]} scale={[0.7, 0.52, 0.98]}>
          <sphereGeometry args={[1, 32, 24]} />
          <meshStandardMaterial color={body} roughness={0.38} metalness={0.55} />
        </mesh>
        {/* heel collar */}
        <mesh position={[-1.34, 0.42, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.42, 0.13, 16, 40]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.4} roughness={0.4} metalness={0.3} />
        </mesh>
        {/* tongue */}
        <RoundedBox args={[0.7, 0.3, 0.62]} radius={0.1} smoothness={3} position={[0.5, 0.68, 0]} rotation={[0, 0, -0.25]}>
          <meshStandardMaterial color="#26262f" roughness={0.6} metalness={0.2} />
        </RoundedBox>
        {/* laces */}
        {laces.map((i) => (
          <mesh key={i} position={[0.72 - i * 0.3, 0.58 - i * 0.02, 0]} rotation={[0, 0, 0.06]}>
            <boxGeometry args={[0.11, 0.07, 0.66]} />
            <meshStandardMaterial color={sole} emissive={sole} emissiveIntensity={0.25} roughness={0.5} />
          </mesh>
        ))}
        {/* side blade accent */}
        <mesh position={[-0.35, -0.05, 0.63]} rotation={[0, 0, 0.35]}>
          <boxGeometry args={[1.35, 0.1, 0.05]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.1} toneMapped={false} />
        </mesh>
        <mesh position={[-0.35, -0.05, -0.63]} rotation={[0, 0, 0.35]}>
          <boxGeometry args={[1.35, 0.1, 0.05]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.1} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}
