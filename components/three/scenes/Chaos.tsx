"use client";

import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { say, story } from "@/lib/store";
import { FONT_BODY, FONT_DISPLAY, palette, setCursor } from "../shared";

const PAIRS: [string, string][] = [
  ["LORUM IPSM", "LOREM IPSUM"],
  ["comic sans", "GROTESK"],
  ["final_v9_REAL.fig", "FINAL.FIG"],
  ["make it pop!!", "MAKE IT CLEAN"],
  ["14 FONTS", "2 FONTS"],
  ["#FF00FF", "#D4FF3A"],
  ["BIGGER LOGO", "RIGHT-SIZED LOGO"],
  ["center everything", "USE A GRID"],
  ["DEADLINE: YESTERDAY", "DEADLINE: CHILL"],
  ["W0RD ART", "TYPOGRAPHY"],
  ["clipart.gif", "3D ASSETS"],
  ["random spacing", "8PT SYSTEM"],
  ["404 ideas", "1 GOOD IDEA"],
  ["helo wrld", "HELLO WORLD"],
];

const CHEERS = [
  "Ooh, satisfying. Do another.",
  "Your art director just shed a single tear of joy.",
  "That's what we call 'design ops'.",
  "Keep going! The kerning gods are watching.",
  "Halfway there. Almost a design system!",
];

function seeded(i: number) {
  const x = Math.sin(i * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

function Word({ pair, index, fixed, onFix }: { pair: [string, string]; index: number; fixed: boolean; onFix: () => void }) {
  const ref = useRef<THREE.Group>(null);
  const chaos = useMemo(
    () => ({
      pos: new THREE.Vector3((seeded(index) - 0.5) * 14, (seeded(index + 40) - 0.5) * 7, (seeded(index + 80) - 0.5) * 6),
      rot: new THREE.Euler((seeded(index + 3) - 0.5) * 1.4, (seeded(index + 5) - 0.5) * 1.6, (seeded(index + 7) - 0.5) * 1.2),
      speed: 0.3 + seeded(index + 11) * 0.6,
    }),
    [index],
  );
  const order = useMemo(() => new THREE.Vector3(index % 2 ? 2.75 : -2.75, 2.75 - Math.floor(index / 2) * 0.86, 0), [index]);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, dt) => {
    const g = ref.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    if (fixed) tmp.copy(order);
    else tmp.set(chaos.pos.x + Math.sin(t * chaos.speed + index) * 0.5, chaos.pos.y + Math.cos(t * chaos.speed * 1.3 + index) * 0.4, chaos.pos.z);
    g.position.lerp(tmp, 1 - Math.exp(-3.5 * dt));
    const k = 4;
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, fixed ? 0 : chaos.rot.x + Math.sin(t * chaos.speed) * 0.3, k, dt);
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, fixed ? 0 : chaos.rot.y, k, dt);
    g.rotation.z = THREE.MathUtils.damp(g.rotation.z, fixed ? 0 : chaos.rot.z + Math.cos(t * chaos.speed) * 0.2, k, dt);
  });

  return (
    <group
      ref={ref}
      position={chaos.pos}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (!fixed) onFix();
      }}
    >
      <Text
        font={fixed ? FONT_DISPLAY : FONT_BODY}
        fontSize={fixed ? 0.34 : 0.42}
        letterSpacing={fixed ? -0.01 : 0.12}
        color={fixed ? palette.cream : index % 3 === 0 ? "#ff4d4d" : index % 3 === 1 ? "#ffd400" : "#ff7ad9"}
        anchorX="center"
        anchorY="middle"
      >
        {fixed ? pair[1] : pair[0]}
      </Text>
      {/* generous invisible hit area so hovering feels forgiving */}
      <mesh visible={false}>
        <planeGeometry args={[4, 0.7]} />
      </mesh>
    </group>
  );
}

export function Chaos({ z }: { z: number }) {
  const [fixed, setFixed] = useState<boolean[]>(() => PAIRS.map(() => false));
  const aspect = useThree((s) => s.size.width / s.size.height);
  const s = THREE.MathUtils.clamp(aspect / 1.5, 0.5, 1);
  const count = fixed.filter(Boolean).length;
  const done = count === PAIRS.length;

  const fix = (i: number) => {
    setFixed((prev) => {
      if (prev[i]) return prev;
      const next = [...prev];
      next[i] = true;
      const n = next.filter(Boolean).length;
      story.set({ fixed: n });
      if (n === PAIRS.length) say("You fixed EVERYTHING. Hire yourself immediately. Then scroll on.");
      else if (n % 3 === 0) say(`${n}/${PAIRS.length} fixed. ${CHEERS[(n / 3 - 1) % CHEERS.length]}`);
      return next;
    });
  };

  const reset = () => {
    setFixed(PAIRS.map(() => false));
    story.set({ fixed: 0 });
    say("Chaos restored. Some people just want to watch the grid burn.");
  };

  return (
    <group position={[0, 0, z]}>
      <Text
        font={FONT_DISPLAY}
        position={[0, 0.2, -6]}
        fontSize={4.2 * s}
        letterSpacing={-0.05}
        color={palette.bg}
        outlineWidth={0.012}
        outlineColor={done ? palette.lime : palette.pink}
        outlineOpacity={0.22}
        anchorX="center"
        anchorY="middle"
      >
        {done ? "SORTED" : "CHAOS"}
      </Text>
      <group scale={s}>
        {PAIRS.map((pair, i) => (
          <Word key={pair[0]} pair={pair} index={i} fixed={fixed[i]} onFix={() => fix(i)} />
        ))}
      </group>
      <group
        position={[0, -3.35 * s, 1]}
        onClick={reset}
        onPointerOver={() => setCursor(true)}
        onPointerOut={() => setCursor(false)}
      >
        <Text font={FONT_DISPLAY} fontSize={0.16} letterSpacing={0.2} color={count ? palette.lime : "#6f6b80"} anchorX="center">
          {`${count}/${PAIRS.length} FIXED  ·  ${count ? "CLICK HERE TO UN-FIX" : "HOVER THE CHAOS"}`}
        </Text>
        <mesh visible={false}>
          <planeGeometry args={[5, 0.5]} />
        </mesh>
      </group>
    </group>
  );
}
