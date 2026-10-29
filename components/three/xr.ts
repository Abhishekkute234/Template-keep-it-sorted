"use client";

import { createXRStore, type XRStore } from "@react-three/xr";

let store: XRStore | null = null;

export function getXRStore() {
  if (!store) {
    store = createXRStore({
      emulate: false,
      hand: { teleportPointer: false },
      controller: { teleportPointer: false },
    });
  }
  return store;
}
