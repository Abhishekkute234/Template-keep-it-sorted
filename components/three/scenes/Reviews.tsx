"use client";

import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Float, Text } from "@react-three/drei";
import { testimonials } from "@/lib/data";
import { say } from "@/lib/store";
import { FONT_BODY, FONT_DISPLAY, palette, setCursor } from "../shared";

const RATING_LINES = [
  "One star?! I'm telling my mom.",
  "Two stars. Brutal. Fair, but brutal.",
  "Three stars. The 'it's fine' of ratings.",
  "Four stars! So close. What did the fifth star ever do to you?",
  "FIVE STARS! I'm framing this. Right next to my charging dock.",
];

function starShape() {
  const s = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 0.2 : 0.46;
    const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    if (i === 0) s.moveTo(x, y);
    else s.lineTo(x, y);
  }
  s.closePath();
  return s;
}

function Stars() {
  const geo = useMemo(() => new THREE.ExtrudeGeometry(starShape(), { depth: 0.12, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.03, bevelSegments: 3 }), []);
  const [rating, setRating] = useState(5);
  const refs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    refs.current.forEach((m, i) => {
      if (!m) return;
      m.rotation.y = Math.sin(t * 1.5 + i * 0.5) * 0.5;
      const on = i < rating;
      m.scale.setScalar(THREE.MathUtils.damp(m.scale.x, on ? 1 : 0.7, 8, dt));
    });
  });

  return (
    <group position={[0, 2.7, -0.5]} scale={0.8}>
      {Array.from({ length: 5 }, (_, i) => (
        <mesh
          key={i}
          ref={(m) => {
            refs.current[i] = m;
          }}
          geometry={geo}
          position={[(i - 2) * 1.05, 0, 0]}
          onPointerOver={(e) => {
            e.stopPropagation();
            setRating(i + 1);
            setCursor(true);
            say(RATING_LINES[i]);
          }}
          onPointerOut={() => setCursor(false)}
        >
          <meshStandardMaterial
            color={i < rating ? palette.lime : "#2a2833"}
            emissive={i < rating ? palette.lime : "#000"}
            emissiveIntensity={i < rating ? 0.6 : 0}
            metalness={0.7}
            roughness={0.25}
          />
        </mesh>
      ))}
    </group>
  );
}

const spots: [number, number, number][] = [
  [-2.3, 0.75, 0],
  [2.0, 0.95, -1.2],
  [-1.9, -1.75, -1],
  [2.3, -1.55, 0.3],
];

export function Reviews({ z }: { z: number }) {
  const aspect = useThree((s) => s.size.width / s.size.height);
  const s = THREE.MathUtils.clamp(aspect / 1.7, 0.42, 1);
  return (
    <group position={[0, 0, z]}>
      <Text font={FONT_DISPLAY} position={[-4.2 * s, 2.0, -5]} fontSize={8} color={palette.pink} fillOpacity={0.4} anchorX="center" anchorY="middle">
        “
      </Text>
      <Text font={FONT_DISPLAY} position={[4.4 * s, -2.6, -5]} fontSize={8} color={palette.blue} fillOpacity={0.35} anchorX="center" anchorY="middle">
        ”
      </Text>
      <group scale={s}>
        <Stars />
        {testimonials.map((q, i) => (
          <Float key={q.name} speed={1.2 + i * 0.2} floatIntensity={0.6} rotationIntensity={0.15}>
            <group position={spots[i]}>
              <Text font={FONT_BODY} fontSize={0.22} lineHeight={1.25} maxWidth={3.0} color={palette.cream} anchorX="center" anchorY="middle" textAlign="center">
                {`“${q.quote}”`}
              </Text>
              <Text font={FONT_DISPLAY} position={[0, -0.72, 0]} fontSize={0.1} letterSpacing={0.12} color={i % 2 ? palette.pink : palette.lime} anchorX="center">
                {`${q.name.toUpperCase()} · ${q.role.toUpperCase()}`}
              </Text>
            </group>
          </Float>
        ))}
      </group>
    </group>
  );
}
