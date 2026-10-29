"use client";

import { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { XR, useXR } from "@react-three/xr";
import { chapters } from "@/lib/chapters";
import { story } from "@/lib/store";
import { CameraRig, VRRig } from "./Rig";
import { Effects, World } from "./World";
import { getXRStore } from "./xr";
import { Prologue } from "./scenes/Prologue";
import { Chaos } from "./scenes/Chaos";
import { Constellation } from "./scenes/Constellation";
import { Gallery } from "./scenes/Gallery";
import { Creators } from "./scenes/Creators";
import { InfiniteKey } from "./scenes/InfiniteKey";
import { Reviews } from "./scenes/Reviews";
import { Portal } from "./scenes/Portal";

const Z = Object.fromEntries(chapters.map((c) => [c.id, c.z])) as Record<string, number>;

function Ready() {
  useEffect(() => {
    story.set({ ready: true });
  }, []);
  return null;
}

function Modes() {
  const session = useXR((s) => s.session);
  useEffect(() => {
    story.set({ inXR: !!session });
    if (session) story.set({ vrChapter: story.get().chapter });
  }, [session]);
  return session ? <VRRig /> : <CameraRig />;
}

export default function Experience() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: false, powerPreference: "high-performance", stencil: false }}
      camera={{ fov: 50, near: 0.1, far: 300, position: [0, 0.4, 11] }}
      style={{ touchAction: "pan-y" }}
    >
      <XR store={getXRStore()}>
        <Suspense fallback={null}>
          <World />
          <Prologue z={Z.prologue} />
          <Chaos z={Z.problem} />
          <Constellation z={Z.categories} />
          <Gallery z={Z.trending} />
          <Creators z={Z.creators} />
          <InfiniteKey z={Z.access} />
          <Reviews z={Z.reviews} />
          <Portal z={Z.epilogue} />
          <Modes />
          <Effects />
          <Ready />
        </Suspense>
      </XR>
    </Canvas>
  );
}
