"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast, useStory } from "@/lib/store";
import { useApp } from "@/components/providers/AppProvider";
import { Logo } from "./Logo";

export async function enterVR() {
  const xr = (navigator as Navigator & { xr?: XRSystem }).xr;
  const supported = xr ? await xr.isSessionSupported("immersive-vr").catch(() => false) : false;
  if (!supported) {
    toast("No VR headset detected. We checked under the couch. Open this page in a Meta Quest or Vision Pro browser to step inside.");
    return;
  }
  const { getXRStore } = await import("@/components/three/xr");
  getXRStore().enterVR();
}

function UserMenu() {
  const { user, signOut } = useApp();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (user === undefined) return <span className="nav__placeholder" aria-hidden />;
  if (!user)
    return (
      <Link href={`/login?next=${encodeURIComponent(path)}`} className="btn btn--ghost btn--sm">
        Log in
      </Link>
    );

  const initials = user.name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="user-menu" ref={ref}>
      <button className="user-menu__btn" onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open} aria-label="Account menu">
        {initials}
      </button>
      {open && (
        <div className="user-menu__pop" role="menu">
          <div className="user-menu__who">
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>
          <Link href="/account" role="menuitem" onClick={() => setOpen(false)}>
            My account &amp; orders
          </Link>
          <button
            role="menuitem"
            onClick={() => {
              setOpen(false);
              signOut();
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export function Nav() {
  const path = usePathname();
  const home = path === "/";
  const { cart, setCartOpen } = useApp();

  return (
    <header className="nav">
      <Link href="/" className="nav__logo" aria-label="Keep It Sorted home">
        <Logo size={34} />
        KEEP IT SORTED
      </Link>
      <nav className="nav__links">
        <Link href="/" className={home ? "is-active" : ""}>Story</Link>
        <Link href="/shop" className={path.startsWith("/shop") ? "is-active" : ""}>Shop</Link>
        <Link href="/shop?c=website-templates">Web Templates</Link>
        <Link href="/shop?c=app-templates">App Templates</Link>
        <Link href={home ? "#chapter-5" : "/#chapter-5"}>Infinite Key</Link>
      </nav>
      <div className="nav__actions">
        {home && (
          <button className="btn btn--ghost btn--sm nav__vr" onClick={enterVR}>
            <span className="vr-glyph" aria-hidden>◉◉</span> Enter VR
          </button>
        )}
        <UserMenu />
        <button className="btn btn--lime btn--sm" onClick={() => setCartOpen(true)} aria-label={`Open cart, ${cart.length} item${cart.length === 1 ? "" : "s"}`}>
          Cart ({cart.length})
        </button>
      </div>
    </header>
  );
}

export function Toast() {
  const message = useStory((s) => s.toast);
  const id = useStory((s) => s.toastId);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!id) return;
    setVisible(true);
    const t = window.setTimeout(() => setVisible(false), 4200);
    return () => window.clearTimeout(t);
  }, [id]);

  return (
    <div className={`toast ${visible ? "is-visible" : ""}`} role="status" aria-live="polite">
      <Logo size={36} className="toast__logo" />
      {message}
    </div>
  );
}
