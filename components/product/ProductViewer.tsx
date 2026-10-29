"use client";

import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Float, Lightformer, PresentationControls, RoundedBox, Sparkles } from "@react-three/drei";
import { getCategory, getProduct } from "@/lib/data";
import { getArtTexture, palette } from "@/components/three/shared";

function Device({ slug }: { slug: string }) {
  const product = getProduct(slug)!;
  const kind = getCategory(product.category)?.kind;
  const texture = useMemo(() => getArtTexture(product), [product]);
  const phone = kind === "app";
  const group = useRef<THREE.Group>(null);
  // the app artwork holds two phone screens side by side; crop one into each device
  const screens = useMemo(
    () =>
      [0.17, 0.52].map((x) => {
        const t = texture.clone();
        t.repeat.set(0.33, 1);
        t.offset.set(x, 0);
        t.needsUpdate = true;
        return t;
      }),
    [texture],
  );

  useFrame((state) => {
    if (group.current) group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.25;
  });

  if (phone)
    return (
      <group ref={group}>
        {[-0.9, 0.9].map((x, i) => (
          <group key={x} position={[x, i ? 0.15 : -0.1, i ? -0.3 : 0]} rotation={[0, i ? -0.25 : 0.25, 0]}>
            <RoundedBox args={[1.5, 3.05, 0.14]} radius={0.2} smoothness={6}>
              <meshStandardMaterial color="#121118" metalness={0.8} roughness={0.25} />
            </RoundedBox>
            <mesh position={[0, 0, 0.075]}>
              <planeGeometry args={[1.36, 2.9]} />
              <meshBasicMaterial map={screens[i]} toneMapped={false} />
            </mesh>
          </group>
        ))}
      </group>
    );

  return (
    <group ref={group} position={[0, -0.2, 0]}>
      {/* screen */}
      <group position={[0, 0.95, -0.9]} rotation={[-0.12, 0, 0]}>
        <RoundedBox args={[3.9, 2.65, 0.1]} radius={0.08} smoothness={4}>
          <meshStandardMaterial color="#121118" metalness={0.8} roughness={0.25} />
        </RoundedBox>
        <mesh position={[0, 0.02, 0.052]}>
          <planeGeometry args={[3.7, 2.45]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
      </group>
      {/* base */}
      <RoundedBox args={[4.1, 0.1, 2.0]} radius={0.04} position={[0, -0.42, 0.05]}>
        <meshStandardMaterial color="#1b1a22" metalness={0.85} roughness={0.25} />
      </RoundedBox>
      <mesh position={[0, -0.36, 0.3]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.2, 0.7]} />
        <meshStandardMaterial color="#26252e" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  );
}

export default function ProductViewer({ slug }: { slug: string }) {
  const product = getProduct(slug)!;
  return (
    <Canvas dpr={[1, 2]} camera={{ position: [0, 0.6, 7], fov: 38 }} style={{ position: "absolute", inset: 0 }}>
      <Suspense fallback={null}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[4, 6, 4]} intensity={1.4} />
        <Environment resolution={128} frames={1}>
          <Lightformer form="rect" intensity={3} color={palette.cream} position={[0, 4, 3]} scale={[8, 2, 1]} />
          <Lightformer form="rect" intensity={4} color={product.colors[0]} position={[-5, 1, 0]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} />
          <Lightformer form="rect" intensity={4} color={product.colors[1]} position={[5, 1, 0]} rotation-y={-Math.PI / 2} scale={[6, 2, 1]} />
        </Environment>
        <PresentationControls global snap rotation={[0.08, -0.3, 0]} polar={[-0.3, 0.4]} azimuth={[-1, 1]}>
          <Float speed={1.6} rotationIntensity={0.25} floatIntensity={0.6}>
            <Device slug={slug} />
          </Float>
        </PresentationControls>
        <ContactShadows position={[0, -1.9, 0]} opacity={0.55} scale={12} blur={2.6} far={4} />
        <Sparkles count={40} scale={[8, 5, 4]} size={2.5} speed={0.4} color={product.colors[0]} />
      </Suspense>
    </Canvas>
  );
}
