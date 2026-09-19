"use client";

import { RoundedBox } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

export type ModelKind = "sneaker" | "tee" | "bag" | "home";

/** category → 3D model kind */
export function modelKindFor(category: string): ModelKind {
  if (category === "footwear") return "sneaker";
  if (category === "bags") return "bag";
  if (category === "home") return "home";
  return "tee";
}

type Props = {
  kind: ModelKind;
  body: string;
  accent: string;
  trim: string;
};

/**
 * Primitive-built product models so the configurator needs zero external GLB
 * assets. Every part is colourable at runtime.
 */
export function ProductModel({ kind, body, accent, trim }: Props) {
  if (kind === "sneaker") return <SneakerModel body={body} accent={accent} sole={trim} />;
  if (kind === "bag") return <BagModel body={body} accent={accent} trim={trim} />;
  if (kind === "home") return <HomeModel body={body} accent={accent} trim={trim} />;
  return <TeeModel body={body} accent={accent} trim={trim} />;
}

/* ---------------------------------- tee ---------------------------------- */
function TeeModel({ body, accent, trim }: { body: string; accent: string; trim: string }) {
  return (
    <group>
      {/* hanger */}
      <mesh position={[0, 2.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.26, 0.028, 10, 24]} />
        <meshStandardMaterial color="#A9ADBF" metalness={0.9} roughness={0.25} />
      </mesh>
      <mesh position={[0, 1.83, 0]}>
        <boxGeometry args={[1.85, 0.045, 0.045]} />
        <meshStandardMaterial color="#A9ADBF" metalness={0.9} roughness={0.25} />
      </mesh>

      <RoundedBox args={[2.1, 2.55, 0.3]} radius={0.13} smoothness={4} position={[0, 0.15, 0]}>
        <meshStandardMaterial color={body} metalness={0.28} roughness={0.62} />
      </RoundedBox>
      <RoundedBox args={[1.2, 0.58, 0.28]} radius={0.12} smoothness={4} position={[-1.42, 0.92, 0]} rotation={[0, 0, 0.56]}>
        <meshStandardMaterial color={body} metalness={0.28} roughness={0.62} />
      </RoundedBox>
      <RoundedBox args={[1.2, 0.58, 0.28]} radius={0.12} smoothness={4} position={[1.42, 0.92, 0]} rotation={[0, 0, -0.56]}>
        <meshStandardMaterial color={body} metalness={0.28} roughness={0.62} />
      </RoundedBox>
      {/* collar */}
      <mesh position={[0, 1.34, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.33, 0.065, 12, 30]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.55} roughness={0.4} metalness={0.35} />
      </mesh>
      {/* chest graphic */}
      <mesh position={[0, 0.42, 0.17]}>
        <boxGeometry args={[1.05, 0.5, 0.02]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.15} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.42, 0.19]}>
        <boxGeometry args={[0.55, 0.16, 0.02]} />
        <meshStandardMaterial color={trim} emissive={trim} emissiveIntensity={1.1} toneMapped={false} />
      </mesh>
      {/* hem */}
      <mesh position={[0, -1.08, 0]}>
        <boxGeometry args={[2.14, 0.08, 0.32]} />
        <meshStandardMaterial color={trim} emissive={trim} emissiveIntensity={0.65} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* -------------------------------- sneaker -------------------------------- */
function SneakerModel({ body, accent, sole }: { body: string; accent: string; sole: string }) {
  const laces = useMemo(() => [0, 1, 2, 3], []);
  return (
    <group rotation={[0.1, -0.2, 0.03]}>
      <RoundedBox args={[3.5, 0.42, 1.45]} radius={0.18} smoothness={3} position={[0, -0.62, 0]}>
        <meshStandardMaterial color={sole} emissive={sole} emissiveIntensity={0.45} roughness={0.35} metalness={0.25} />
      </RoundedBox>
      <RoundedBox args={[3.42, 0.34, 1.4]} radius={0.14} smoothness={3} position={[0, -0.32, 0]}>
        <meshStandardMaterial color="#20202c" roughness={0.55} metalness={0.15} />
      </RoundedBox>
      <RoundedBox args={[3.46, 0.09, 1.44]} radius={0.03} smoothness={2} position={[0, -0.32, 0]}>
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.35} toneMapped={false} />
      </RoundedBox>
      <RoundedBox args={[3.0, 0.82, 1.22]} radius={0.3} smoothness={4} position={[-0.12, 0.16, 0]}>
        <meshStandardMaterial color={body} roughness={0.4} metalness={0.5} />
      </RoundedBox>
      <mesh position={[1.42, 0.02, 0]} scale={[0.7, 0.52, 0.98]}>
        <sphereGeometry args={[1, 32, 24]} />
        <meshStandardMaterial color={body} roughness={0.36} metalness={0.55} />
      </mesh>
      <mesh position={[-1.34, 0.42, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.42, 0.13, 16, 40]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.4} roughness={0.4} metalness={0.3} />
      </mesh>
      <RoundedBox args={[0.7, 0.3, 0.62]} radius={0.1} smoothness={3} position={[0.5, 0.68, 0]} rotation={[0, 0, -0.25]}>
        <meshStandardMaterial color="#26262f" roughness={0.6} metalness={0.2} />
      </RoundedBox>
      {laces.map((i) => (
        <mesh key={i} position={[0.72 - i * 0.3, 0.58 - i * 0.02, 0]}>
          <boxGeometry args={[0.11, 0.07, 0.66]} />
          <meshStandardMaterial color={sole} emissive={sole} emissiveIntensity={0.22} roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[-0.35, -0.05, 0.63]} rotation={[0, 0, 0.35]}>
        <boxGeometry args={[1.35, 0.1, 0.05]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.05} toneMapped={false} />
      </mesh>
      <mesh position={[-0.35, -0.05, -0.63]} rotation={[0, 0, 0.35]}>
        <boxGeometry args={[1.35, 0.1, 0.05]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.05} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ---------------------------------- bag ---------------------------------- */
function BagModel({ body, accent, trim }: { body: string; accent: string; trim: string }) {
  return (
    <group rotation={[0.05, 0, 0.02]}>
      {/* main shell */}
      <RoundedBox args={[1.9, 2.5, 1.05]} radius={0.22} smoothness={4}>
        <meshStandardMaterial color={body} roughness={0.55} metalness={0.22} />
      </RoundedBox>
      {/* front pocket */}
      <RoundedBox args={[1.5, 0.95, 0.22]} radius={0.12} smoothness={4} position={[0, -0.35, 0.58]}>
        <meshStandardMaterial color={body} roughness={0.6} metalness={0.2} />
      </RoundedBox>
      {/* zip tape */}
      <mesh position={[0, 0.2, 0.55]}>
        <boxGeometry args={[1.5, 0.07, 0.06]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.2} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.2, 0.6]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.055, 0.055, 0.5, 12]} />
        <meshStandardMaterial color={trim} metalness={0.85} roughness={0.2} />
      </mesh>
      {/* top handle */}
      <mesh position={[0, 1.45, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.42, 0.075, 12, 32, Math.PI]} />
        <meshStandardMaterial color={trim} roughness={0.45} metalness={0.35} />
      </mesh>
      {/* shoulder straps */}
      {[-0.42, 0.42].map((x) => (
        <mesh key={x} position={[x, 0.1, -0.6]} rotation={[0.22, 0, 0]}>
          <torusGeometry args={[0.62, 0.08, 10, 30, Math.PI * 1.1]} />
          <meshStandardMaterial color={trim} roughness={0.5} metalness={0.25} />
        </mesh>
      ))}
      {/* side glow stripe */}
      <mesh position={[0.97, 0.15, 0]}>
        <boxGeometry args={[0.04, 1.8, 0.14]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.1} toneMapped={false} />
      </mesh>
      {/* base studs */}
      {[-0.6, 0.6].map((x) =>
        [-0.35, 0.35].map((z) => (
          <mesh key={`${x}${z}`} position={[x, -1.28, z]}>
            <cylinderGeometry args={[0.07, 0.08, 0.08, 10]} />
            <meshStandardMaterial color={trim} metalness={0.9} roughness={0.25} />
          </mesh>
        )),
      )}
    </group>
  );
}

/* ---------------------------------- home --------------------------------- */
function HomeModel({ body, accent, trim }: { body: string; accent: string; trim: string }) {
  return (
    <group rotation={[0.06, 0, 0]}>
      {/* folded stack: three layers */}
      <RoundedBox args={[3.1, 0.5, 2.3]} radius={0.12} smoothness={3} position={[0, -0.75, 0]}>
        <meshStandardMaterial color={body} roughness={0.82} metalness={0.05} />
      </RoundedBox>
      <RoundedBox args={[2.9, 0.46, 2.15]} radius={0.12} smoothness={3} position={[0.04, -0.3, 0.03]} rotation={[0, 0.03, 0]}>
        <meshStandardMaterial color={accent} roughness={0.82} metalness={0.05} />
      </RoundedBox>
      <RoundedBox args={[2.7, 0.44, 2.0]} radius={0.12} smoothness={3} position={[-0.03, 0.14, -0.02]} rotation={[0, -0.04, 0]}>
        <meshStandardMaterial color={body} roughness={0.82} metalness={0.05} />
      </RoundedBox>
      {/* rolled blanket */}
      <mesh position={[1.95, 0.2, 0.35]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.5, 0.5, 1.7, 28]} />
        <meshStandardMaterial color={trim} roughness={0.85} metalness={0.04} />
      </mesh>
      <mesh position={[2.82, 0.2, 0.35]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.5, 0.5, 0.06, 28]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.8} toneMapped={false} />
      </mesh>
      {/* zari trim on top fold */}
      <mesh position={[-0.03, 0.37, 0.98]}>
        <boxGeometry args={[2.6, 0.04, 0.06]} />
        <meshStandardMaterial color={trim} emissive={trim} emissiveIntensity={0.9} toneMapped={false} />
      </mesh>
      {/* cushion */}
      <RoundedBox args={[1.25, 1.25, 0.42]} radius={0.3} smoothness={4} position={[-1.35, 0.85, 0.5]} rotation={[0, 0.5, 0.08]}>
        <meshStandardMaterial color={accent} roughness={0.78} metalness={0.06} />
      </RoundedBox>
      <mesh position={[-1.35, 0.85, 0.73]} rotation={[0, 0.5, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.02]} />
        <meshStandardMaterial color={trim} emissive={trim} emissiveIntensity={1} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** Complementary studio palette derived from a selected product colour. */
export function deriveStudioColors(hex: string, accent: string) {
  const base = new THREE.Color(hex);
  const isDark = base.getHSL({ h: 0, s: 0, l: 0 }).l < 0.22;
  return {
    body: hex,
    accent: accent,
    trim: isDark ? "#08D9D6" : "#FFC947",
  };
}
