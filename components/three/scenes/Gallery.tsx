"use client";

import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { RoundedBox, Text } from "@react-three/drei";
import { formatPrice, getAuthor, trending, type Product } from "@/lib/data";
import { motion, nav, say } from "@/lib/store";
import { FONT_BODY, FONT_DISPLAY, getArtTexture, palette, setCursor } from "../shared";

const W = 2.5;
const H = W * (540 / 768);

function Card({ product, position, rotationY, index }: { product: Product; position: [number, number, number]; rotationY: number; index: number }) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<THREE.Group>(null);
  const texture = useMemo(() => getArtTexture(product), [product]);
  const author = getAuthor(product.author);

  useFrame((state, dt) => {
    const g = ref.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    g.position.z = THREE.MathUtils.damp(g.position.z, hovered ? 0.9 : 0, 7, dt);
    g.position.y = Math.sin(t * 0.9 + index) * 0.06;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, hovered ? motion.mouse.x * 0.35 : 0, 6, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, hovered ? -motion.mouse.y * 0.25 : 0, 6, dt);
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, hovered ? 1.08 : 1, 7, dt));
  });

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <group
        ref={ref}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          setCursor(true);
          say(`"${product.name}" — ${product.sales.toLocaleString("en-US")} sold. ${product.tagline}`);
        }}
        onPointerOut={() => {
          setHovered(false);
          setCursor(false);
        }}
        onClick={(e) => {
          e.stopPropagation();
          setCursor(false);
          nav.go(`/product/${product.slug}`);
        }}
      >
        <RoundedBox args={[W + 0.12, H + 0.12, 0.06]} radius={0.05} position={[0, 0, -0.05]}>
          <meshBasicMaterial color={hovered ? new THREE.Color(palette.lime).multiplyScalar(2) : "#1c1a26"} toneMapped={false} />
        </RoundedBox>
        <mesh>
          <planeGeometry args={[W, H]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
        {product.badge && (
          <group position={[-W / 2 + 0.42, H / 2 - 0.16, 0.02]}>
            <RoundedBox args={[0.72, 0.17, 0.01]} radius={0.06}>
              <meshBasicMaterial color="#0b0a10" />
            </RoundedBox>
            <Text font={FONT_DISPLAY} fontSize={0.065} letterSpacing={0.1} color={palette.lime} position={[0, 0, 0.01]}>
              {product.badge.toUpperCase()}
            </Text>
          </group>
        )}
        <Text font={FONT_DISPLAY} position={[-W / 2, -H / 2 - 0.2, 0]} fontSize={0.13} color={palette.cream} anchorX="left" anchorY="middle" maxWidth={W - 0.6}>
          {product.name}
        </Text>
        <Text font={FONT_BODY} position={[-W / 2, -H / 2 - 0.4, 0]} fontSize={0.09} color="#8d8a9c" anchorX="left" anchorY="middle">
          {`by ${author?.name ?? "someone talented"}  ·  ${product.rating} / 5`}
        </Text>
        <Text font={FONT_DISPLAY} position={[W / 2, -H / 2 - 0.22, 0]} fontSize={0.16} color={palette.lime} anchorX="right" anchorY="middle">
          {formatPrice(product.price)}
        </Text>
      </group>
    </group>
  );
}

export function Gallery({ z }: { z: number }) {
  const marquee = useRef<THREE.Group>(null);
  const aspect = useThree((s) => s.size.width / s.size.height);
  const s = THREE.MathUtils.clamp(aspect / 1.7, 0.4, 1);
  const R = 8.5;
  const layout = useMemo(
    () =>
      trending.map((product, i) => {
        const row = Math.floor(i / 4);
        const col = i % 4;
        const theta = THREE.MathUtils.degToRad((col - 1.5) * 19.5);
        return {
          product,
          index: i,
          position: [Math.sin(theta) * R, row ? -1.45 : 1.35, R - Math.cos(theta) * R] as [number, number, number],
          rotationY: -theta,
        };
      }),
    [],
  );

  useFrame((state) => {
    if (marquee.current) marquee.current.position.x = ((state.clock.elapsedTime * 0.6) % 26) - 13;
  });

  return (
    <group position={[0, 0, z]}>
      <group ref={marquee} position={[0, 0, -8]}>
        {[-26, 0, 26].map((x) => (
          <Text key={x} font={FONT_DISPLAY} position={[x, 0.3, 0]} fontSize={3.3} letterSpacing={-0.03} color={palette.bg} outlineWidth={0.012} outlineColor={palette.pink} outlineOpacity={0.22} anchorX="center" anchorY="middle">
            TRENDING //
          </Text>
        ))}
      </group>
      <group scale={s * 0.86}>
        {layout.map((l) => (
          <Card key={l.product.slug} {...l} />
        ))}
      </group>
    </group>
  );
}
