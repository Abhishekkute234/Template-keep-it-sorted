"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { resolveCartItem, sanitizeCart } from "@/lib/cart";
import { toast } from "@/lib/store";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { FeedbackDialog } from "@/components/feedback/FeedbackDialog";

export type User = { id: string; email: string; name: string };
export type Order = { id: string; items: string[]; total: number; createdAt: string };

type AppState = {
  /** undefined while the session is still loading */
  user: User | null | undefined;
  setUser: (u: User | null) => void;
  signOut: () => Promise<void>;
  cart: string[];
  inCart: (id: string) => boolean;
  addToCart: (id: string) => void;
  removeFromCart: (id: string) => void;
  checkout: () => Promise<Order | null>;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  feedbackOpen: boolean;
  setFeedbackOpen: (open: boolean) => void;
};

const Ctx = createContext<AppState | null>(null);
const LOCAL_KEY = "kis_cart";

export async function api<T = Record<string, unknown>>(url: string, method = "GET", data?: unknown): Promise<T & { error?: string; status: number }> {
  const res = await fetch(url, {
    method,
    headers: data === undefined ? undefined : { "Content-Type": "application/json" },
    body: data === undefined ? undefined : JSON.stringify(data),
    credentials: "same-origin",
  });
  const payload = await res.json().catch(() => ({}));
  // Unexpected server failures (no JSON error body) must still read as errors to callers.
  if (!res.ok && !payload.error) payload.error = "Something went wrong on our side. Please try again in a moment.";
  return { ...payload, status: res.status };
}

function readLocal(): string[] {
  try {
    return sanitizeCart(JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]"));
  } catch {
    return [];
  }
}

function writeLocal(items: string[]) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
  } catch {
    /* storage unavailable — the cart still works for this visit */
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUserState] = useState<User | null | undefined>(undefined);
  const [cart, setCart] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const saving = useRef<Promise<unknown>>(Promise.resolve());
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Load the session once; guests start from their browser cart.
  useEffect(() => {
    setCart(readLocal());
    api<{ user: User | null }>("/api/auth/me").then((r) => setUserState(r.user ?? null));
    if (new URLSearchParams(location.search).get("cart") === "open") setCartOpen(true);
  }, []);

  // On sign-in, fold the guest cart into the account cart.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const server = await api<{ items: string[] }>("/api/cart");
      const merged = sanitizeCart([...(server.items ?? []), ...readLocal()]);
      const saved = await api<{ items: string[] }>("/api/cart", "PUT", { items: merged });
      if (cancelled) return;
      writeLocal([]);
      setCart(saved.items ?? merged);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const persist = useCallback((items: string[]) => {
    if (userRef.current) {
      saving.current = saving.current.then(() => api("/api/cart", "PUT", { items }));
    } else {
      writeLocal(items);
    }
  }, []);

  const update = useCallback(
    (fn: (items: string[]) => string[]) => {
      setCart((prev) => {
        const next = fn(prev);
        if (next !== prev) persist(next);
        return next;
      });
    },
    [persist],
  );

  const addToCart = useCallback(
    (id: string) => {
      const item = resolveCartItem(id);
      if (!item) return;
      update((prev) => (prev.includes(id) ? prev : [...prev, id]));
      toast(`${item.name} is in your cart.`);
      setCartOpen(true);
    },
    [update],
  );

  const removeFromCart = useCallback((id: string) => update((prev) => prev.filter((x) => x !== id)), [update]);

  const checkout = useCallback(async () => {
    if (!userRef.current) {
      setCartOpen(false);
      router.push(`/login?next=${encodeURIComponent(`${pathname}?cart=open`)}`);
      return null;
    }
    await saving.current;
    const res = await api<{ order: Order }>("/api/checkout", "POST", {});
    if (res.error || !res.order) {
      toast(res.error ?? "Checkout failed. Please try again.");
      return null;
    }
    setCart([]);
    router.refresh();
    return res.order;
  }, [pathname, router]);

  const signOut = useCallback(async () => {
    await api("/api/auth/logout", "POST", {});
    setUserState(null);
    setCart([]);
    writeLocal([]);
    toast("You've been signed out. Your secrets are safe with the cat.");
    router.push("/");
    router.refresh();
  }, [router]);

  const value = useMemo<AppState>(
    () => ({
      user,
      setUser: setUserState,
      signOut,
      cart,
      inCart: (id) => cart.includes(id),
      addToCart,
      removeFromCart,
      checkout,
      cartOpen,
      setCartOpen,
      feedbackOpen,
      setFeedbackOpen,
    }),
    [user, signOut, cart, addToCart, removeFromCart, checkout, cartOpen, feedbackOpen],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <CartDrawer />
      <FeedbackDialog />
    </Ctx.Provider>
  );
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
