"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * Preloader sculpture: a wireframe hanger + icosahedron that resolves into the
 * V-STYLE logo tile as the load counter climbs to 100.
 */
export function PreloaderScene({ progress }: { progress: number }) {
  const wire = useRef<THREE.Group>(null);
  const tile = useRef<THREE.Group>(null);
  const p = useMemo(() => Math.min(1, Math.max(0, progress / 100)), [progress]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (wire.current) {
      wire.current.rotation.y += delta * (0.55 + p * 1.5);
      wire.current.rotation.x = Math.sin(t * 0.7) * 0.22;
      const target = 1 - p * 0.92;
      wire.current.scale.setScalar(THREE.MathUtils.lerp(wire.current.scale.x, target, 0.12));
    }
    if (tile.current) {
      tile.current.rotation.y = THREE.MathUtils.lerp(tile.current.rotation.y, p * Math.PI * 2, 0.1);
      const s = THREE.MathUtils.lerp(tile.current.scale.x, 0.35 + p * 0.85, 0.12);
      tile.current.scale.setScalar(s);
      tile.current.position.y = Math.sin(t * 1.4) * 0.05;
    }
  });

  const pink = new THREE.Color("#FF2E63");
  const cyan = new THREE.Color("#08D9D6");

  return (
    <group position={[0, 0, 0]}>
      <group ref={wire}>
        {/* hanger hook */}
        <mesh position={[0, 1.35, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.42, 0.035, 8, 28]} />
          <meshBasicMaterial color={pink} wireframe toneMapped={false} />
        </mesh>
        {/* hanger shoulders */}
        <mesh position={[0, 0.85, 0]}>
          <boxGeometry args={[2.5, 0.04, 0.04]} />
          <meshBasicMaterial color={cyan} wireframe toneMapped={false} />
        </mesh>
        <mesh position={[-0.85, 0.45, 0]} rotation={[0, 0, 0.42]}>
          <boxGeometry args={[1.35, 0.04, 0.04]} />
          <meshBasicMaterial color={cyan} wireframe toneMapped={false} />
        </mesh>
        <mesh position={[0.85, 0.45, 0]} rotation={[0, 0, -0.42]}>
          <boxGeometry args={[1.35, 0.04, 0.04]} />
          <meshBasicMaterial color={cyan} wireframe toneMapped={false} />
        </mesh>
        {/* morphing icosahedron */}
        <mesh>
          <icosahedronGeometry args={[1.15, 1]} />
          <meshBasicMaterial color={pink} wireframe transparent opacity={0.9} toneMapped={false} />
        </mesh>
        <mesh rotation={[0.6, 0.4, 0.2]}>
          <icosahedronGeometry args={[0.72, 0]} />
          <meshBasicMaterial color={cyan} wireframe transparent opacity={0.75} toneMapped={false} />
        </mesh>
      </group>

      <group ref={tile} scale={0.35}>
        <RoundedBox args={[1.9, 1.9, 0.34]} radius={0.22} smoothness={4}>
          <meshStandardMaterial color="#0f0f18" metalness={0.75} roughness={0.22} />
        </RoundedBox>
        {/* V mark */}
        <mesh position={[-0.3, 0, 0.2]}>
          <boxGeometry args={[0.16, 1.0, 0.1]} />
          <meshStandardMaterial color="#FF2E63" emissive="#FF2E63" emissiveIntensity={1.3} toneMapped={false} />
        </mesh>
        <mesh position={[0.3, 0, 0.2]}>
          <boxGeometry args={[0.16, 1.0, 0.1]} />
          <meshStandardMaterial color="#08D9D6" emissive="#08D9D6" emissiveIntensity={1.3} toneMapped={false} />
        </mesh>
        <mesh position={[0, -0.55, 0.2]}>
          <boxGeometry args={[0.9, 0.09, 0.1]} />
          <meshStandardMaterial color="#FFC947" emissive="#FFC947" emissiveIntensity={1.1} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}
