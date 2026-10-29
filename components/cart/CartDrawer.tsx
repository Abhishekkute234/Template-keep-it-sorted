"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cartTotal, resolveCartItem } from "@/lib/cart";
import { formatPrice } from "@/lib/data";
import { useApp, type Order } from "@/components/providers/AppProvider";
import { ProductArt } from "@/components/ui/ProductArt";
import { Logo } from "@/components/ui/Logo";

export function CartDrawer() {
  const { cart, removeFromCart, cartOpen, setCartOpen, checkout, user } = useApp();
  const [busy, setBusy] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lines = cart.map(resolveCartItem).filter((l) => l !== null);
  const total = cartTotal(cart);

  useEffect(() => {
    if (!cartOpen) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setCartOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cartOpen, setCartOpen]);

  useEffect(() => {
    if (!cartOpen) setOrder(null);
  }, [cartOpen]);

  const onCheckout = async () => {
    setBusy(true);
    const placed = await checkout();
    setBusy(false);
    if (placed) setOrder(placed);
  };

  return (
    <div className={`drawer ${cartOpen ? "is-open" : ""}`} aria-hidden={!cartOpen}>
      <div className="drawer__scrim" onClick={() => setCartOpen(false)} />
      <aside className="drawer__panel" role="dialog" aria-modal="true" aria-label="Shopping cart">
        <header className="drawer__head">
          <h2>
            Your cart <span>{cart.length}</span>
          </h2>
          <button ref={closeRef} className="icon-btn" onClick={() => setCartOpen(false)} aria-label="Close cart">
            ✕
          </button>
        </header>

        {order ? (
          <div className="drawer__done">
            <Logo size={64} />
            <h3>Order {order.id} confirmed</h3>
            <p>
              {order.items.length} item{order.items.length === 1 ? "" : "s"} · {formatPrice(order.total)}. Your downloads are waiting in your account.
            </p>
            <Link href="/account" className="btn btn--lime" onClick={() => setCartOpen(false)}>
              Go to my account
            </Link>
          </div>
        ) : lines.length === 0 ? (
          <div className="drawer__empty">
            <p>Your cart is emptier than a designer&apos;s fridge on deadline day.</p>
            <Link href="/shop" className="btn btn--ghost" onClick={() => setCartOpen(false)}>
              Browse the archive
            </Link>
          </div>
        ) : (
          <>
            <ul className="drawer__list">
              {lines.map((line) => (
                <li key={line.id} className="cart-line">
                  <div className="cart-line__thumb">{line.product ? <ProductArt product={line.product} /> : <Logo size={44} />}</div>
                  <div className="cart-line__info">
                    {line.product ? (
                      <Link href={`/product/${line.id}`} onClick={() => setCartOpen(false)}>
                        {line.name}
                      </Link>
                    ) : (
                      <strong>{line.name}</strong>
                    )}
                    <span>{line.note}</span>
                  </div>
                  <div className="cart-line__end">
                    <strong>{formatPrice(line.price)}</strong>
                    <button className="link-btn" onClick={() => removeFromCart(line.id)} aria-label={`Remove ${line.name}`}>
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <footer className="drawer__foot">
              <div className="drawer__total">
                <span>Subtotal</span>
                <strong>{formatPrice(total)}</strong>
              </div>
              <button className="btn btn--lime btn--block" onClick={onCheckout} disabled={busy}>
                {busy ? "Placing order…" : user ? "Check out" : "Sign in to check out"}
              </button>
              <p className="drawer__note">Demo checkout: orders are recorded, no payment is taken.</p>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
