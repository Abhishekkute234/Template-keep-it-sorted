"use client";

import { useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Float, MeshDistortMaterial, RoundedBox, Text, useTexture } from "@react-three/drei";
import { motion } from "@/lib/store";
import { FONT_BODY, FONT_DISPLAY, palette } from "../shared";

const layers = [
  { z: 0, color: palette.cream, opacity: 1 },
  { z: -0.3, color: palette.pink, opacity: 0.85 },
  { z: -0.6, color: palette.blue, opacity: 0.55 },
  { z: -0.9, color: palette.violet, opacity: 0.3 },
];

const TITLE = 1.9;
const LINE = TITLE * 0.43;
const LOGO = TITLE * 0.76;
const SLOT = LOGO + TITLE * 0.07;

type Widths = { s: number; rest: number } | null;

const widthOf = (mesh: THREE.Object3D) => {
  const b = (mesh as THREE.Object3D & { textRenderInfo?: { blockBounds: number[] } }).textRenderInfo?.blockBounds;
  return b ? b[2] - b[0] : 0;
};

/** "SORTED" with the brand logo standing in for the O. Letter widths come from the front layer once troika lays them out. */
function Sorted({ layer, front, widths, onMeasure }: { layer: (typeof layers)[number]; front: boolean; widths: Widths; onMeasure?: (w: Widths) => void }) {
  const logo = useTexture("/logo.jpg");
  logo.colorSpace = THREE.SRGBColorSpace;
  const measured = useRef<{ s?: number; rest?: number }>({});
  const report = (key: "s" | "rest") => (mesh: THREE.Object3D) => {
    if (!onMeasure) return;
    measured.current[key] = widthOf(mesh);
    const { s, rest } = measured.current;
    if (s && rest) onMeasure({ s, rest });
  };

  const total = widths ? widths.s + SLOT + widths.rest : 0;
  const x0 = -total / 2;
  const common = { font: FONT_DISPLAY, fontSize: TITLE, letterSpacing: -0.04, anchorY: "middle" as const, fillOpacity: layer.opacity, color: layer.color };

  return (
    <group position={[0, -LINE, 0]} visible={!!widths}>
      <Text {...common} anchorX="left" position={[x0, 0, 0]} onSync={report("s")}>
        S
      </Text>
      <mesh position={[x0 + (widths?.s ?? 0) + SLOT / 2, -TITLE * 0.02, 0]}>
        <circleGeometry args={[LOGO / 2, 96]} />
        {front ? (
          <meshBasicMaterial map={logo} toneMapped={false} />
        ) : (
          <meshBasicMaterial color={layer.color} transparent opacity={layer.opacity} />
        )}
      </mesh>
      <Text {...common} anchorX="left" position={[x0 + (widths?.s ?? 0) + SLOT, 0, 0]} onSync={report("rest")}>
        RTED
      </Text>
    </group>
  );
}

export function Prologue({ z }: { z: number }) {
  const title = useRef<THREE.Group>(null);
  const [widths, setWidths] = useState<Widths>(null);
  const aspect = useThree((s) => s.size.width / s.size.height);
  const s = THREE.MathUtils.clamp(aspect / 1.7, 0.42, 1);
  // On tall (phone) screens the headline copy fills the lower half, so lift the title clear of it.
  const baseY = aspect < 1 ? 1.75 + (1 - aspect) * 2.4 : 1.75;

  useFrame((state, dt) => {
    if (!title.current) return;
    const t = state.clock.elapsedTime;
    title.current.rotation.y = THREE.MathUtils.damp(title.current.rotation.y, motion.mouse.x * 0.3, 3, dt);
    title.current.rotation.x = THREE.MathUtils.damp(title.current.rotation.x, -motion.mouse.y * 0.18, 3, dt);
    title.current.children.forEach((child, i) => {
      child.position.x = Math.sin(t * 0.8 + i * 0.6) * 0.06 * i;
      child.position.y = Math.cos(t * 0.7 + i * 0.6) * 0.04 * i;
    });
  });

  return (
    <group position={[0, 0, z]}>
      <group ref={title} position={[0, baseY, 0]} scale={s * 0.85}>
        {layers.map((l, i) => (
          <group key={i} position={[0, 0, l.z]}>
            <Text font={FONT_DISPLAY} fontSize={TITLE} letterSpacing={-0.04} anchorX="center" anchorY="middle" position={[0, LINE, 0]} fillOpacity={l.opacity} color={l.color}>
              KEEP IT
            </Text>
            <Sorted layer={l} front={i === 0} widths={widths} onMeasure={i === 0 ? setWidths : undefined} />
          </group>
        ))}
      </group>
      <Text font={FONT_BODY} position={[0, baseY - 1.75 * s, 0.3]} fontSize={0.17 * Math.max(s, 0.7) * (aspect < 1 ? 0.6 : 1)} letterSpacing={aspect < 1 ? 0.2 : 0.32} color={palette.lime} anchorX="center">
        A STORY OF TEMPLATES, DEADLINES & GETTING IT TOGETHER
      </Text>

      <Float speed={2} rotationIntensity={1.2} floatIntensity={1.4}>
        <mesh position={[-5.6 * s, 2.6, -2]}>
          <torusKnotGeometry args={[0.55, 0.18, 160, 24]} />
          <meshStandardMaterial color={palette.pink} metalness={0.9} roughness={0.15} />
        </mesh>
      </Float>
      <Float speed={1.6} rotationIntensity={2} floatIntensity={1}>
        <mesh position={[5.8 * s, 2.2, -1]}>
          <icosahedronGeometry args={[0.7, 0]} />
          <meshBasicMaterial color={new THREE.Color(palette.lime).multiplyScalar(1.6)} wireframe toneMapped={false} />
        </mesh>
      </Float>
      <Float speed={1.4} rotationIntensity={1} floatIntensity={1.6}>
        <RoundedBox args={[1, 1, 1]} radius={0.22} position={[6.3 * s, -1.6, -2.5]} rotation={[0.4, 0.6, 0]}>
          <meshStandardMaterial color={palette.blue} metalness={0.6} roughness={0.2} />
        </RoundedBox>
      </Float>
      <Float speed={2.2} rotationIntensity={0.6} floatIntensity={1.2}>
        <mesh position={[-6 * s, -1.4, -1]}>
          <sphereGeometry args={[0.75, 64, 64]} />
          <MeshDistortMaterial color={palette.violet} distort={0.45} speed={2.4} metalness={0.4} roughness={0.15} />
        </mesh>
      </Float>
      <Float speed={1.2} rotationIntensity={2} floatIntensity={0.8}>
        <mesh position={[-2.6 * s, -2.6, -3]} rotation={[1.2, 0, 0]}>
          <torusGeometry args={[0.6, 0.06, 16, 80]} />
          <meshBasicMaterial color={new THREE.Color(palette.cream).multiplyScalar(1.4)} toneMapped={false} />
        </mesh>
      </Float>
      <Float speed={1.8} rotationIntensity={1.5} floatIntensity={1}>
        <mesh position={[3 * s, -2.8, -2]}>
          <coneGeometry args={[0.45, 0.9, 4]} />
          <meshStandardMaterial color={palette.lime} metalness={0.5} roughness={0.25} />
        </mesh>
      </Float>
    </group>
  );
}
