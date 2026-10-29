import { randomUUID } from "crypto";
import { cartTotal, sanitizeCart } from "@/lib/cart";
import { getCurrentUser } from "@/lib/server/auth";
import { fail, guard, json } from "@/lib/server/http";
import { collections } from "@/lib/server/mongo";

/** Places an order from the server-side cart. No payment provider is wired up yet, so nothing is charged. */
export async function POST(req: Request) {
  const blocked = guard(req);
  if (blocked) return blocked;
  const user = await getCurrentUser();
  if (!user) return fail("Please sign in to check out.", 401);

  const db = await collections();
  // Empty the cart and read what was in it in one step, so a double-click can't place two orders.
  const before = await db.carts.findOneAndUpdate(
    { _id: user.id, "items.0": { $exists: true } },
    { $set: { items: [], updatedAt: new Date() } },
    { returnDocument: "before" },
  );
  const items = sanitizeCart(before?.items);
  if (!items.length) return fail("Your cart is empty.");

  const order = { _id: randomUUID().slice(0, 8).toUpperCase(), userId: user.id, items, total: cartTotal(items), createdAt: new Date() };
  await db.orders.insertOne(order);
  return json({ order: { id: order._id, items: order.items, total: order.total, createdAt: order.createdAt.toISOString() } });
}
