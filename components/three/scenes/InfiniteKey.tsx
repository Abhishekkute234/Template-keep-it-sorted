"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { RoundedBox, Text } from "@react-three/drei";
import { say } from "@/lib/store";
import { FONT_DISPLAY, palette, setCursor } from "../shared";

const RING = "ALL-ACCESS · EVERY PRODUCT · NEW DROPS WEEKLY · FOREVER-ISH · ";
const CONFETTI = 160;
const SPINS = [
  "WHEEEE! Okay, I'm dizzy now.",
  "Every spin unlocks one more door. That's not true. But it feels true.",
  "You spin me right round, baby, right round.",
  "Careful, at 88 spins it travels back in time.",
];
const colors = [palette.lime, palette.pink, palette.blue, palette.violet, palette.cream];

function Confetti({ burst }: { burst: React.RefObject<number> }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const state = useMemo(
    () =>
      Array.from({ length: CONFETTI }, () => ({
        p: new THREE.Vector3(),
        v: new THREE.Vector3(),
        r: new THREE.Euler(),
        life: 0,
      })),
    [],
  );
  const last = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, dt) => {
    const m = mesh.current;
    if (!m) return;
    if (burst.current !== last.current) {
      last.current = burst.current;
      state.forEach((c) => {
        c.p.set(0, 0, 0);
        c.v.set((Math.random() - 0.5) * 9, Math.random() * 7 + 1, (Math.random() - 0.5) * 6);
        c.r.set(Math.random() * 6, Math.random() * 6, 0);
        c.life = 2.5 + Math.random();
      });
    }
    state.forEach((c, i) => {
      if (c.life > 0) {
        c.life -= dt;
        c.v.y -= 9.8 * dt * 0.6;
        c.p.addScaledVector(c.v, dt);
        c.r.x += dt * 6;
        c.r.y += dt * 4;
      }
      dummy.position.copy(c.p);
      dummy.rotation.copy(c.r);
      dummy.scale.setScalar(c.life > 0 ? Math.min(1, c.life) : 0);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });

  const colorAttr = useMemo(() => {
    const arr = new Float32Array(CONFETTI * 3);
    const c = new THREE.Color();
    for (let i = 0; i < CONFETTI; i++) {
      c.set(colors[i % colors.length]).multiplyScalar(1.6);
      c.toArray(arr, i * 3);
    }
    return arr;
  }, []);

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, CONFETTI]} frustumCulled={false}>
      <planeGeometry args={[0.12, 0.07]}>
        <instancedBufferAttribute attach="attributes-color" args={[colorAttr, 3]} />
      </planeGeometry>
      <meshBasicMaterial vertexColors side={THREE.DoubleSide} toneMapped={false} />
    </instancedMesh>
  );
}

export function InfiniteKey({ z }: { z: number }) {
  const key = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Group>(null);
  const spin = useRef(0);
  const burst = useRef(0);
  const count = useRef(0);
  const hovered = useRef(false);
  const aspect = useThree((s) => s.size.width / s.size.height);
  const s = THREE.MathUtils.clamp(aspect / 1.6, 0.5, 1);
  const chars = useMemo(() => RING.split(""), []);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    spin.current = THREE.MathUtils.damp(spin.current, 0, 1.4, dt);
    if (key.current) {
      key.current.rotation.y += dt * (0.5 + spin.current);
      key.current.rotation.z = Math.sin(t * 0.8) * 0.12;
      key.current.position.y = Math.sin(t * 1.2) * 0.15;
      key.current.scale.setScalar(THREE.MathUtils.damp(key.current.scale.x, hovered.current ? 1.08 : 1, 8, dt));
    }
    if (ring.current) ring.current.rotation.y -= dt * (0.25 + spin.current * 0.2);
  });

  const gold = (
    <meshStandardMaterial color={palette.lime} metalness={1} roughness={0.18} emissive={palette.lime} emissiveIntensity={0.12} envMapIntensity={1.6} />
  );

  return (
    <group position={[0, 0, z]}>
      {/* the doors the key opens */}
      {[-5.5, 0, 5.5].map((x, i) => (
        <group key={x} position={[x * s, 0.4, -6]}>
          <RoundedBox args={[2.4, 4.2, 0.08]} radius={0.04}>
            <meshBasicMaterial color={new THREE.Color([palette.pink, palette.blue, palette.violet][i]).multiplyScalar(1.4)} toneMapped={false} wireframe />
          </RoundedBox>
        </group>
      ))}
      <Text font={FONT_DISPLAY} position={[0, 2.9 * s + 0.4, -3]} fontSize={0.5 * s} letterSpacing={0.05} color={palette.cream} anchorX="center">
        THE INFINITE KEY
      </Text>

      <group scale={s}>
        <group
          ref={key}
          onClick={(e) => {
            e.stopPropagation();
            spin.current += 14;
            burst.current += 1;
            say(SPINS[count.current++ % SPINS.length]);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            hovered.current = true;
            setCursor(true);
          }}
          onPointerOut={() => {
            hovered.current = false;
            setCursor(false);
          }}
        >
          <group position={[-1.6, 0, 0]}>
            <mesh>
              <torusGeometry args={[0.85, 0.22, 32, 96]} />
              {gold}
            </mesh>
            <mesh>
              <torusGeometry args={[0.42, 0.08, 16, 64]} />
              <meshBasicMaterial color={new THREE.Color(palette.pink).multiplyScalar(2.2)} toneMapped={false} />
            </mesh>
          </group>
          <mesh position={[0.65, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.17, 0.17, 3.0, 32]} />
            {gold}
          </mesh>
          <mesh position={[-0.55, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.26, 0.07, 16, 48]} />
            {gold}
          </mesh>
          {[
            [1.35, -0.35, 0.45],
            [1.75, -0.45, 0.6],
            [2.05, -0.3, 0.35],
          ].map(([x, y, h], i) => (
            <mesh key={i} position={[x, y - h / 2 + 0.3, 0]}>
              <boxGeometry args={[0.2, h, 0.2]} />
              {gold}
            </mesh>
          ))}
          <mesh visible={false}>
            <boxGeometry args={[4.4, 2.2, 1]} />
          </mesh>
        </group>

        <group ref={ring} rotation={[0.25, 0, 0]}>
          {chars.map((ch, i) => {
            const a = (i / chars.length) * Math.PI * 2;
            return (
              <Text
                key={i}
                font={FONT_DISPLAY}
                fontSize={0.2}
                color={i % 2 ? palette.cream : palette.lime}
                position={[Math.sin(a) * 3.3, 0, Math.cos(a) * 3.3]}
                rotation={[0, a, 0]}
                anchorX="center"
                anchorY="middle"
              >
                {ch}
              </Text>
            );
          })}
        </group>
        <Confetti burst={burst} />
      </group>
    </group>
  );
}
