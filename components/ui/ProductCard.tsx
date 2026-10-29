"use client";

import Link from "next/link";
import { useRef } from "react";
import { formatPrice, getAuthor, getCategory, type Product } from "@/lib/data";
import { ProductArt } from "./ProductArt";
import { useApp } from "@/components/providers/AppProvider";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const author = getAuthor(product.author);
  const cat = getCategory(product.category);
  const { addToCart, inCart } = useApp();
  const added = inCart(product.slug);

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${-y * 10}deg`);
    el.style.setProperty("--ry", `${x * 12}deg`);
    el.style.setProperty("--gx", `${(x + 0.5) * 100}%`);
    el.style.setProperty("--gy", `${(y + 0.5) * 100}%`);
  };
  const onLeave = () => {
    ref.current?.style.setProperty("--rx", "0deg");
    ref.current?.style.setProperty("--ry", "0deg");
  };

  return (
    <div className="pcard-wrap">
    <Link
      ref={ref}
      href={`/product/${product.slug}`}
      className="pcard"
      style={{ ["--i" as string]: index, ["--accent" as string]: cat?.color }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <div className="pcard__art">
        <ProductArt product={product} />
        {product.badge && <span className={`badge badge--${product.badge.toLowerCase()}`}>{product.badge}</span>}
        <span className="pcard__glare" />
      </div>
      <div className="pcard__meta">
        <div>
          <h3>{product.name}</h3>
          <p>
            {cat?.name} · by {author?.name}
          </p>
        </div>
        <div className="pcard__price">
          <strong>{formatPrice(product.price)}</strong>
          <span>★ {product.rating}</span>
        </div>
      </div>
    </Link>
      <button
        className={`quick-add ${added ? "is-added" : ""}`}
        onClick={() => addToCart(product.slug)}
        disabled={added}
        aria-label={added ? `${product.name} is in your cart` : `Add ${product.name} to cart`}
      >
        {added ? "✓ In cart" : "+ Add"}
      </button>
    </div>
  );
}
