"use client";

import dynamic from "next/dynamic";
import { useApp } from "@/components/providers/AppProvider";

const ProductViewer = dynamic(() => import("./ProductViewer"), {
  ssr: false,
  loading: () => null,
});

export function ProductStage({ slug }: { slug: string }) {
  return (
    <div className="viewer">
      <ProductViewer slug={slug} />
      <p className="viewer__hint">Drag to spin · it&apos;s a 3D preview, go wild</p>
    </div>
  );
}

export function BuyButtons({ slug, free }: { slug: string; free: boolean }) {
  const { addToCart, inCart, setCartOpen } = useApp();
  const added = inCart(slug);
  return (
    <div className="product__cta">
      {added ? (
        <button className="btn btn--ghost" onClick={() => setCartOpen(true)}>
          In your cart · View
        </button>
      ) : (
        <button className="btn btn--lime" onClick={() => addToCart(slug)}>
          {free ? "Add free item to cart" : "Add to cart"}
        </button>
      )}
      <button className="btn btn--ghost" onClick={() => addToCart("plan:infinite")} disabled={inCart("plan:infinite")}>
        {inCart("plan:infinite") ? "Infinite Key in cart" : "Get with Infinite Key"}
      </button>
    </div>
  );
}
