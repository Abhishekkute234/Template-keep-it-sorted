"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, Text } from "@react-three/drei";
import { XROrigin, useXR } from "@react-three/xr";
import { chapters } from "@/lib/chapters";
import { motion, say, story, useStory } from "@/lib/store";
import { FONT_DISPLAY, palette, setCursor } from "./shared";

const poses = chapters.map((c) => ({
  pos: new THREE.Vector3(c.cam[0], c.cam[1], c.z + c.cam[2]),
  look: new THREE.Vector3(c.look[0], c.look[1], c.z),
  frame: c.frame,
}));

const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/** Map scroll progress to (segment, eased flight amount) — the camera holds on a chapter, then flies. */
export function segmentAt(p: number) {
  const a = motion.anchors;
  const last = chapters.length - 1;
  if (p <= a[0]) return { i: 0, f: 0 };
  let i = 0;
  while (i < last && p >= a[i + 1]) i++;
  if (i >= last) return { i: last, f: 0 };
  const t = (p - a[i]) / Math.max(1e-6, a[i + 1] - a[i]);
  return { i, f: easeInOut(THREE.MathUtils.clamp((t - 0.5) / 0.5, 0, 1)) };
}

function setChapter(ch: number) {
  if (story.get().chapter === ch) return;
  story.set({ chapter: ch });
  say(chapters[ch].lines[0]);
}

const tmpPos = new THREE.Vector3();
const tmpLook = new THREE.Vector3();

/** Desktop / mobile: scroll-driven cinematic camera with mouse parallax. */
export function CameraRig() {
  const look = useRef(new THREE.Vector3(0, 0.6, 0));
  useFrame((state, dt) => {
    motion.progress = THREE.MathUtils.damp(motion.progress, motion.target, 3.2, dt);
    const { i, f } = segmentAt(motion.progress);
    const a = poses[i];
    const b = poses[Math.min(i + 1, poses.length - 1)];
    tmpPos.lerpVectors(a.pos, b.pos, f);
    tmpLook.lerpVectors(a.look, b.look, f);
    // sideways framing offsets only make sense on wide screens; center everything on phones
    const wide = THREE.MathUtils.clamp((state.size.width / state.size.height - 0.6) / 0.8, 0, 1);
    tmpPos.x *= wide;
    tmpLook.x *= wide;
    // push content into the right part of the frame (and pull back a touch) so it never sits under the copy
    const frame = THREE.MathUtils.lerp(a.frame, b.frame, f) * (state.size.width >= 900 ? 1 : 0);
    motion.frame = THREE.MathUtils.damp(motion.frame, frame, 4, dt);
    tmpPos.sub(tmpLook).multiplyScalar(1 + motion.frame * 0.9).add(tmpLook);
    const swoop = Math.sin(f * Math.PI);
    tmpPos.y += swoop * 1.6;
    tmpPos.x += swoop * (i % 2 ? 2.2 : -2.2);
    tmpPos.x += motion.mouse.x * 0.55;
    tmpPos.y += motion.mouse.y * 0.32;

    const cam = state.camera;
    const k = 1 - Math.exp(-6 * dt);
    cam.position.lerp(tmpPos, k);
    look.current.lerp(tmpLook, k);
    cam.lookAt(look.current);
    cam.rotateZ(swoop * (i % 2 ? -0.07 : 0.07));
    const { width, height } = state.size;
    (cam as THREE.PerspectiveCamera).setViewOffset(width, height, -motion.frame * width, 0, width, height);
    setChapter(f > 0.5 ? i + 1 : i);
  });
  return null;
}

function VRButton({ label, position, onClick, accent = false }: { label: string; position: [number, number, number]; onClick: () => void; accent?: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const hovered = useRef(false);
  useFrame((_, dt) => {
    if (ref.current) ref.current.scale.setScalar(THREE.MathUtils.damp(ref.current.scale.x, hovered.current ? 1.1 : 1, 10, dt));
  });
  return (
    <group
      ref={ref}
      position={position}
      onClick={onClick}
      onPointerOver={() => {
        hovered.current = true;
        setCursor(true);
      }}
      onPointerOut={() => {
        hovered.current = false;
        setCursor(false);
      }}
    >
      <RoundedBox args={[0.42, 0.16, 0.03]} radius={0.06}>
        <meshBasicMaterial color={accent ? palette.lime : "#1b1924"} toneMapped={false} />
      </RoundedBox>
      <Text font={FONT_DISPLAY} fontSize={0.045} letterSpacing={0.08} color={accent ? "#0b0a10" : palette.cream} position={[0, 0, 0.02]}>
        {label}
      </Text>
    </group>
  );
}

/** Immersive VR: the player's origin glides between chapters with a floating wrist-height control panel. */
export function VRRig() {
  const origin = useRef<THREE.Group>(null);
  const session = useXR((s) => s.session);
  const vrChapter = useStory((s) => s.vrChapter);
  const target = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, dt) => {
    if (!origin.current) return;
    const c = chapters[story.get().vrChapter];
    target.set(c.cam[0] * 0.5, c.look[1] - 1.45, c.z + c.cam[2] * 0.8);
    origin.current.position.lerp(target, 1 - Math.exp(-2.2 * dt));
  });

  if (!session) return null;

  const go = (d: number) => {
    const n = THREE.MathUtils.clamp(story.get().vrChapter + d, 0, chapters.length - 1);
    story.set({ vrChapter: n, chapter: n });
    say(chapters[n].lines[0]);
  };
  const c = chapters[vrChapter];

  return (
    <XROrigin ref={origin}>
      <group position={[0, 0.95, -0.9]} rotation={[-0.6, 0, 0]}>
        <RoundedBox args={[1.05, 0.42, 0.02]} radius={0.05}>
          <meshBasicMaterial color="#0d0c14" transparent opacity={0.85} />
        </RoundedBox>
        <Text font={FONT_DISPLAY} fontSize={0.035} letterSpacing={0.14} color={palette.pink} position={[0, 0.14, 0.02]}>
          {`CHAPTER ${c.numeral} / VII`}
        </Text>
        <Text font={FONT_DISPLAY} fontSize={0.05} color={palette.cream} position={[0, 0.07, 0.02]}>
          {c.label.toUpperCase()}
        </Text>
        <VRButton label="< PREV" position={[-0.27, -0.08, 0.02]} onClick={() => go(-1)} />
        <VRButton label="NEXT >" position={[0.27, -0.08, 0.02]} onClick={() => go(1)} accent />
        <VRButton label="EXIT VR" position={[0, -0.27, 0.02]} onClick={() => session.end()} />
      </group>
    </XROrigin>
  );
}
