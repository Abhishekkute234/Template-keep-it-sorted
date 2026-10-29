"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Sparkles, Text } from "@react-three/drei";
import { nav, say, useStory } from "@/lib/store";
import { FONT_DISPLAY, palette, setCursor } from "../shared";

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragment = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    vec2 p = vUv - 0.5;
    float r = length(p) * 2.0;
    float a = atan(p.y, p.x);
    float swirl = sin(a * 5.0 + r * 14.0 - uTime * 3.0) * 0.5 + 0.5;
    float swirl2 = sin(a * 3.0 - r * 9.0 + uTime * 2.0) * 0.5 + 0.5;
    vec3 pink = vec3(1.0, 0.24, 0.5);
    vec3 blue = vec3(0.3, 0.48, 1.0);
    vec3 lime = vec3(0.83, 1.0, 0.23);
    vec3 col = mix(pink, blue, swirl);
    col = mix(col, lime, swirl2 * smoothstep(0.9, 0.2, r) * 0.55);
    col *= 0.6 + (1.0 - r) * 2.2;
    float alpha = smoothstep(1.0, 0.92, r);
    gl_FragColor = vec4(col, alpha);
  }
`;

export function Portal({ z }: { z: number }) {
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  const speed = useRef(1);
  const hovered = useRef(false);
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);
  const group = useRef<THREE.Group>(null);
  const aspect = useThree((s) => s.size.width / s.size.height);
  const s = THREE.MathUtils.clamp(aspect / 1.4, 0.55, 1) * 0.85;
  const inXR = useStory((st) => st.inXR);

  useFrame((_, dt) => {
    speed.current = THREE.MathUtils.damp(speed.current, hovered.current ? 4 : 1, 3, dt);
    uniforms.uTime.value += dt * speed.current;
    if (ringA.current) ringA.current.rotation.z += dt * 0.4 * speed.current;
    if (ringB.current) {
      ringB.current.rotation.x += dt * 0.5;
      ringB.current.rotation.y += dt * 0.3 * speed.current;
    }
    if (group.current) group.current.scale.setScalar(THREE.MathUtils.damp(group.current.scale.x, (hovered.current ? 1.06 : 1) * s, 5, dt));
  });

  return (
    <group position={[0, 0.3, z]}>
      {inXR && (
        <Text font={FONT_DISPLAY} position={[0, 3.55 * s, 0]} fontSize={0.52 * s} letterSpacing={0.04} color={palette.cream} anchorX="center">
          ENTER THE ARCHIVE
        </Text>
      )}
      <group
        ref={group}
        onClick={(e) => {
          e.stopPropagation();
          setCursor(false);
          say("Warping you to the shop... please keep your hands inside the browser.");
          window.setTimeout(() => nav.go("/shop"), 450);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          hovered.current = true;
          setCursor(true);
          say("Ooh, it tingles. Click to jump in!");
        }}
        onPointerOut={() => {
          hovered.current = false;
          setCursor(false);
        }}
      >
        <mesh>
          <circleGeometry args={[2.6, 96]} />
          <shaderMaterial vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} transparent toneMapped={false} />
        </mesh>
        <mesh ref={ringA}>
          <torusGeometry args={[2.7, 0.09, 24, 160]} />
          <meshBasicMaterial color={new THREE.Color(palette.pink).multiplyScalar(2.6)} toneMapped={false} />
        </mesh>
        <mesh ref={ringB}>
          <torusGeometry args={[3.15, 0.025, 12, 160]} />
          <meshBasicMaterial color={new THREE.Color(palette.lime).multiplyScalar(2.2)} toneMapped={false} />
        </mesh>
      </group>
      <Sparkles count={120} scale={[7, 7, 3]} size={4} speed={1.2} color={palette.cream} />
    </group>
  );
}
