"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { LazyCanvas } from "./LazyCanvas";

const PALETTE = ["#FF2E63", "#08D9D6", "#FFC947", "#F4F6FF"];
const COUNT = 140;

type Piece = {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  speed: number;
  spin: number;
  scale: number;
};

/** Module-scope generators keep random init out of the render path. */
function makePieces(): Piece[] {
  return Array.from({ length: COUNT }, () => ({
    position: new THREE.Vector3(
      (Math.random() - 0.5) * 10,
      Math.random() * 10 - 3,
      (Math.random() - 0.5) * 6,
    ),
    rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
    speed: 1 + Math.random() * 2.4,
    spin: (Math.random() - 0.5) * 4.5,
    scale: 0.08 + Math.random() * 0.12,
  }));
}

function makeColors(): Float32Array {
  const arr = new Float32Array(COUNT * 3);
  const palette = PALETTE.map((hex) => new THREE.Color(hex));
  for (let i = 0; i < COUNT; i += 1) {
    const c = palette[i % palette.length];
    arr[i * 3] = c.r;
    arr[i * 3 + 1] = c.g;
    arr[i * 3 + 2] = c.b;
  }
  return arr;
}

function advance(mesh: THREE.InstancedMesh, pieces: Piece[], dummy: THREE.Object3D, t: number, delta: number) {
  for (let i = 0; i < pieces.length; i += 1) {
    const p = pieces[i];
    p.position.y -= p.speed * delta;
    p.position.x += Math.sin(t * 0.9 + i) * delta * 0.4;
    p.rotation.x += p.spin * delta;
    p.rotation.z += p.spin * 0.7 * delta;
    if (p.position.y < -5.5) p.position.y = 6.5;
    dummy.position.copy(p.position);
    dummy.rotation.copy(p.rotation);
    dummy.scale.setScalar(p.scale);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
}

/** 3D confetti — instanced neon ribbons falling through the success screen. */
export function ConfettiStage({ className }: { className?: string }) {
  const colors = useMemo(() => makeColors(), []);

  return (
    <div className={className}>
      <LazyCanvas camera={{ position: [0, 0, 9], fov: 45 }} dpr={[1, 1.4]}>
        <ambientLight intensity={1} />
        <Confetti colors={colors} />
      </LazyCanvas>
    </div>
  );
}

function Confetti({ colors }: { colors: Float32Array }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const pieces = useMemo(() => makePieces(), []);

  useFrame((state, delta) => {
    const m = mesh.current;
    if (!m) return;
    advance(m, pieces, dummy, state.clock.elapsedTime, Math.min(delta, 0.05));
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <planeGeometry args={[1, 1.45]} />
      <meshBasicMaterial side={THREE.DoubleSide} toneMapped={false} />
      <instancedBufferAttribute attach="instanceColor" args={[colors, 3]} />
    </instancedMesh>
  );
}
