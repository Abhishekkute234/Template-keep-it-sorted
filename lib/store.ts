"use client";

import { useSyncExternalStore } from "react";

type Listener = () => void;

function createStore<T extends object>(initial: T) {
  let state = initial;
  const listeners = new Set<Listener>();
  return {
    get: () => state,
    set: (patch: Partial<T>) => {
      state = { ...state, ...patch };
      listeners.forEach((l) => l());
    },
    subscribe: (l: Listener) => {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
  };
}

export type StoryState = {
  chapter: number;
  line: string;
  lineId: number;
  ready: boolean;
  inXR: boolean;
  vrChapter: number;
  fixed: number;
  vrSupported: boolean | null;
  toast: string;
  toastId: number;
};

export const story = createStore<StoryState>({
  chapter: 0,
  line: "Hi! I'm PIXEL, your narrator. Scroll down and I'll tell you a story.",
  lineId: 0,
  ready: false,
  inXR: false,
  vrChapter: 0,
  fixed: 0,
  vrSupported: null,
  toast: "",
  toastId: 0,
});

export function useStory<S>(selector: (s: StoryState) => S): S {
  return useSyncExternalStore(
    story.subscribe,
    () => selector(story.get()),
    () => selector(story.get()),
  );
}

export function say(line: string) {
  const s = story.get();
  if (s.line === line) return;
  story.set({ line, lineId: s.lineId + 1 });
}

export function toast(message: string) {
  story.set({ toast: message, toastId: story.get().toastId + 1 });
}

/** Mutable, per-frame values. Read inside useFrame, never rendered directly. */
export const motion = {
  target: 0,
  progress: 0,
  anchors: [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875] as number[],
  mouse: { x: 0, y: 0 },
  /** Current horizontal framing offset (fraction of width) applied to the camera projection. */
  frame: 0,
};

/** Navigation bridge so 3D objects can use the Next.js router. */
export const nav = {
  go: (href: string) => {
    window.location.href = href;
  },
};
