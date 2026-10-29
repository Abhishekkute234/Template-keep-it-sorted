import { getProduct, plans, type Product } from "./data";

/** Cart items are digital goods: one of each, identified by product slug or `plan:<id>`. */
export type CartLine = {
  id: string;
  name: string;
  price: number;
  kind: "product" | "plan";
  product?: Product;
  note: string;
};

export const MAX_CART_ITEMS = 50;

export function resolveCartItem(id: string): CartLine | null {
  if (id.startsWith("plan:")) {
    const plan = plans.find((p) => `plan:${p.id}` === id);
    if (!plan || plan.amount == null) return null;
    return { id, name: plan.name, price: plan.amount, kind: "plan", note: plan.period };
  }
  const product = getProduct(id);
  if (!product) return null;
  return { id, name: product.name, price: product.price, kind: "product", product, note: product.formats.slice(0, 3).join(" · ") };
}

/** Drops unknown ids and duplicates, keeping the original order. */
export function sanitizeCart(ids: unknown): string[] {
  if (!Array.isArray(ids)) return [];
  const seen = new Set<string>();
  for (const id of ids) {
    if (typeof id === "string" && !seen.has(id) && resolveCartItem(id)) seen.add(id);
    if (seen.size >= MAX_CART_ITEMS) break;
  }
  return [...seen];
}

export function cartTotal(ids: string[]) {
  return ids.reduce((sum, id) => sum + (resolveCartItem(id)?.price ?? 0), 0);
}
