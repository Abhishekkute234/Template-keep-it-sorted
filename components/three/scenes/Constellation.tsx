"use client";

import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Float, RoundedBox, Text } from "@react-three/drei";
import { categories, type Category } from "@/lib/data";
import { nav, say } from "@/lib/store";
import { FONT_BODY, FONT_DISPLAY, palette, setCursor } from "../shared";

function Glyph({ cat, hovered }: { cat: Category; hovered: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * (hovered ? 3 : 0.6);
    ref.current.rotation.x += dt * (hovered ? 1.2 : 0.2);
  });
  const mat = (
    <meshStandardMaterial
      color={cat.color}
      emissive={cat.color}
      emissiveIntensity={hovered ? 1.4 : 0.35}
      metalness={0.4}
      roughness={0.25}
      wireframe={cat.kind === "wire"}
    />
  );
  if (cat.kind === "font")
    return (
      <group ref={ref}>
        <Text font={FONT_DISPLAY} fontSize={0.62} color={cat.color} anchorX="center" anchorY="middle">
          Aa
        </Text>
      </group>
    );
  return (
    <group ref={ref}>
      <mesh>
        {cat.kind === "web" && cat.slug === "ui-kits" && <torusGeometry args={[0.32, 0.11, 20, 60]} />}
        {cat.kind === "web" && cat.slug !== "ui-kits" && <boxGeometry args={[0.6, 0.42, 0.08]} />}
        {cat.kind === "app" && <capsuleGeometry args={[0.18, 0.34, 8, 20]} />}
        {cat.kind === "dash" && <cylinderGeometry args={[0.34, 0.34, 0.16, 6]} />}
        {cat.kind === "illus" && <torusKnotGeometry args={[0.24, 0.08, 120, 16]} />}
        {cat.kind === "3d" && <icosahedronGeometry args={[0.38, 0]} />}
        {cat.kind === "icons" && <octahedronGeometry args={[0.4]} />}
        {cat.kind === "mockup" && <torusGeometry args={[0.3, 0.16, 12, 4]} />}
        {cat.kind === "wire" && <boxGeometry args={[0.5, 0.5, 0.5, 2, 2, 2]} />}
        {mat}
      </mesh>
    </group>
  );
}

function Monolith({ cat, position, rotationY }: { cat: Category; position: [number, number, number]; rotationY: number }) {
  const [hovered, setHovered] = useState(false);
  const inner = useRef<THREE.Group>(null);
  const glow = useMemo(() => new THREE.Color(cat.color), [cat.color]);
  const glowMat = useMemo(() => new THREE.MeshBasicMaterial({ color: glow.clone(), toneMapped: false }), [glow]);

  useFrame((_, dt) => {
    if (!inner.current) return;
    const s = THREE.MathUtils.damp(inner.current.scale.x, hovered ? 1.1 : 1, 8, dt);
    inner.current.scale.setScalar(s);
    inner.current.position.z = THREE.MathUtils.damp(inner.current.position.z, hovered ? 0.6 : 0, 8, dt);
    glowMat.color.copy(glow).multiplyScalar(hovered ? 3.2 : 1.1);
  });

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <Float speed={1.4} floatIntensity={0.35} rotationIntensity={0.08}>
        <group
          ref={inner}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            setCursor(true);
            say(`${cat.name}: ${cat.quip}`);
          }}
          onPointerOut={() => {
            setHovered(false);
            setCursor(false);
          }}
          onClick={(e) => {
            e.stopPropagation();
            setCursor(false);
            nav.go(`/shop?c=${cat.slug}`);
          }}
        >
          <RoundedBox args={[1.62, 2.5, 0.06]} radius={0.03} position={[0, 0, -0.08]} material={glowMat} />
          <RoundedBox args={[1.5, 2.4, 0.16]} radius={0.07} smoothness={4}>
            <meshStandardMaterial color="#100f17" metalness={0.7} roughness={0.22} />
          </RoundedBox>
          <group position={[0, 0.5, 0.45]}>
            <Glyph cat={cat} hovered={hovered} />
          </group>
          <Text font={FONT_DISPLAY} position={[0, -0.42, 0.1]} fontSize={0.15} maxWidth={1.3} textAlign="center" lineHeight={1.05} color={palette.cream} anchorX="center" anchorY="middle">
            {cat.name.toUpperCase()}
          </Text>
          <Text font={FONT_BODY} position={[0, -0.82, 0.1]} fontSize={0.1} letterSpacing={0.1} color={cat.color} anchorX="center">
            {hovered ? "CLICK TO ENTER +" : `${cat.count.toLocaleString("en-US")} ITEMS`}
          </Text>
        </group>
      </Float>
    </group>
  );
}

export function Constellation({ z }: { z: number }) {
  const aspect = useThree((s) => s.size.width / s.size.height);
  const s = THREE.MathUtils.clamp(aspect / 1.7, 0.4, 1);
  const R = 10;
  const layout = useMemo(
    () =>
      categories.map((cat, i) => {
        const row = Math.floor(i / 5);
        const col = i % 5;
        const theta = THREE.MathUtils.degToRad((col - 2) * 13);
        return {
          cat,
          position: [Math.sin(theta) * R, row ? -1.45 : 1.55, R - Math.cos(theta) * R] as [number, number, number],
          rotationY: -theta,
        };
      }),
    [],
  );

  return (
    <group position={[0, 0, z]}>
      <Text font={FONT_DISPLAY} position={[0, 0.3, -7]} fontSize={3.4 * s} letterSpacing={-0.04} color={palette.bg} outlineWidth={0.012} outlineColor={palette.blue} outlineOpacity={0.22} anchorX="center" anchorY="middle">
        GALAXIES
      </Text>
      <group scale={s}>
        {layout.map((l) => (
          <Monolith key={l.cat.slug} {...l} />
        ))}
      </group>
    </group>
  );
}
