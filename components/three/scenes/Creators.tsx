"use client";

import { useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Billboard, Text } from "@react-three/drei";
import { authors, type Author } from "@/lib/data";
import { nav, say } from "@/lib/store";
import { FONT_BODY, FONT_DISPLAY, palette, setCursor } from "../shared";

const orbit = { paused: false, angle: 0 };

function Planet({ author, index }: { author: Author; index: number }) {
  const ref = useRef<THREE.Group>(null);
  const body = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const size = 0.5 + (author.sales / 48210) * 0.35;
  const base = (index / authors.length) * Math.PI * 2;

  useFrame((state, dt) => {
    const g = ref.current;
    if (!g) return;
    const a = base + orbit.angle;
    g.position.set(Math.cos(a) * 5.4, Math.sin(a * 2 + index) * 0.6 + (index % 2 ? 0.5 : -0.6), Math.sin(a) * 2.6);
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, hovered ? 1.3 : 1, 8, dt));
    if (body.current) body.current.rotation.y += dt * 0.5;
  });

  return (
    <group
      ref={ref}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        orbit.paused = true;
        setCursor(true);
        say(`${author.name}, ${author.city}. ${author.bio}`);
      }}
      onPointerOut={() => {
        setHovered(false);
        orbit.paused = false;
        setCursor(false);
      }}
      onClick={(e) => {
        e.stopPropagation();
        setCursor(false);
        nav.go(`/shop?author=${author.slug}`);
      }}
    >
      <mesh ref={body}>
        <sphereGeometry args={[size, 48, 48]} />
        <meshStandardMaterial color={author.color} emissive={author.color} emissiveIntensity={hovered ? 0.9 : 0.18} roughness={0.35} metalness={0.3} />
      </mesh>
      {index % 2 === 0 && (
        <mesh rotation={[1.2, 0.3, 0]}>
          <torusGeometry args={[size * 1.55, 0.025, 8, 80]} />
          <meshBasicMaterial color={new THREE.Color(author.color).multiplyScalar(1.8)} toneMapped={false} />
        </mesh>
      )}
      <Billboard position={[0, -size - 0.35, 0]}>
        <Text font={FONT_DISPLAY} fontSize={0.2} color={palette.cream} anchorX="center">
          {author.name.toUpperCase()}
        </Text>
        <Text font={FONT_BODY} position={[0, -0.24, 0]} fontSize={0.12} letterSpacing={0.08} color={author.color} anchorX="center">
          {hovered ? "SEE THEIR WORK" : `${author.sales.toLocaleString("en-US")} SALES`}
        </Text>
      </Billboard>
    </group>
  );
}

export function Creators({ z }: { z: number }) {
  const core = useRef<THREE.Mesh>(null);
  const aspect = useThree((s) => s.size.width / s.size.height);
  const s = THREE.MathUtils.clamp(aspect / 1.7, 0.45, 1);

  useFrame((state, dt) => {
    if (!orbit.paused) orbit.angle += dt * 0.12;
    if (core.current) {
      core.current.rotation.y += dt * 0.3;
      core.current.rotation.x += dt * 0.1;
      core.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.03);
    }
  });

  return (
    <group position={[0, 0, z]}>
      <Text font={FONT_DISPLAY} position={[0, 0.3, -7]} fontSize={3.2 * s} letterSpacing={-0.04} color={palette.bg} outlineWidth={0.012} outlineColor={palette.lime} outlineOpacity={0.22} anchorX="center" anchorY="middle">
        HUMANS
      </Text>
      <group scale={s}>
        <mesh ref={core}>
          <icosahedronGeometry args={[1.05, 1]} />
          <meshBasicMaterial color={new THREE.Color(palette.lime).multiplyScalar(1.5)} wireframe toneMapped={false} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.7, 32, 32]} />
          <meshStandardMaterial color="#14121c" metalness={0.8} roughness={0.2} />
        </mesh>
        <Billboard>
          <Text font={FONT_DISPLAY} fontSize={0.26} lineHeight={1} textAlign="center" color={palette.cream} anchorX="center" anchorY="middle" position={[0, 0, 1.1]}>
            {"1,200+\nCREATORS"}
          </Text>
        </Billboard>
        {authors.map((a, i) => (
          <Planet key={a.slug} author={a} index={i} />
        ))}
      </group>
    </group>
  );
}
