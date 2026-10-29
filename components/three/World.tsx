"use client";

import { Environment, Grid, Lightformer, Sparkles, Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { useXR } from "@react-three/xr";
import { chapters } from "@/lib/chapters";
import { palette } from "./shared";

export function World() {
  return (
    <>
      <color attach="background" args={[palette.bg]} />
      <fog attach="fog" args={[palette.bg, 16, 46]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[6, 10, 6]} intensity={1.6} />
      <pointLight position={[-6, 2, -40]} intensity={60} color={palette.pink} distance={40} />
      <pointLight position={[6, 2, -150]} intensity={60} color={palette.blue} distance={40} />

      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3} color={palette.cream} position={[0, 5, -5]} scale={[10, 3, 1]} />
        <Lightformer form="rect" intensity={4} color={palette.pink} position={[-6, 1, 2]} rotation-y={Math.PI / 2} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={4} color={palette.blue} position={[6, 1, 2]} rotation-y={-Math.PI / 2} scale={[8, 2, 1]} />
        <Lightformer form="ring" intensity={3} color={palette.lime} position={[0, -4, 4]} scale={4} />
      </Environment>

      <Stars radius={160} depth={80} count={5000} factor={5} saturation={0.4} fade speed={0.6} />
      {chapters.map((c, i) => (
        <Sparkles key={c.id} position={[0, 0, c.z]} count={70} scale={[18, 9, 14]} size={3} speed={0.35} opacity={0.7} color={i % 2 ? palette.pink : palette.lime} />
      ))}
      <Grid
        position={[0, -4.6, 0]}
        infiniteGrid
        cellSize={1}
        sectionSize={6}
        cellThickness={0.5}
        sectionThickness={1}
        cellColor="#1d1a2e"
        sectionColor="#45358f"
        fadeDistance={55}
        fadeStrength={1.6}
        followCamera
      />
    </>
  );
}

export function Effects() {
  const session = useXR((s) => s.session);
  if (session) return null;
  return (
    <EffectComposer multisampling={0}>
      <Bloom mipmapBlur intensity={0.85} luminanceThreshold={1} luminanceSmoothing={0.2} radius={0.75} />
      <Vignette offset={0.25} darkness={0.75} />
    </EffectComposer>
  );
}
