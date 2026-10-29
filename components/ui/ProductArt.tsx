"use client";

import { useEffect, useRef } from "react";
import { drawProductArt } from "@/lib/art";
import type { Product } from "@/lib/data";

export function ProductArt({ product, className }: { product: Product; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth || 384;
      const h = canvas.clientHeight || 270;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      drawProductArt(canvas.getContext("2d")!, canvas.width, canvas.height, product);
    };
    draw();
    document.fonts?.ready.then(draw);
    const ro = new ResizeObserver(draw);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [product]);

  return <canvas ref={ref} className={className} role="img" aria-label={`${product.name} preview`} />;
}
