"use client";

import * as THREE from "three";
import { drawProductArt } from "@/lib/art";
import type { Product } from "@/lib/data";

export const FONT_DISPLAY = "/fonts/unbounded-900.woff";
export const FONT_REGULAR = "/fonts/unbounded-400.woff";
export const FONT_BODY = "/fonts/grotesk-500.woff";

export const palette = {
  bg: "#07060B",
  lime: "#D4FF3A",
  pink: "#FF3D81",
  blue: "#4D7CFF",
  violet: "#8B5CF6",
  cream: "#F2EFE9",
};

const cache = new Map<string, THREE.CanvasTexture>();

export function getArtTexture(product: Product) {
  let tex = cache.get(product.slug);
  if (tex) return tex;
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 540;
  drawProductArt(canvas.getContext("2d")!, canvas.width, canvas.height, product);
  tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  cache.set(product.slug, tex);
  return tex;
}

export function setCursor(hovered: boolean) {
  document.body.style.cursor = hovered ? "pointer" : "";
}
