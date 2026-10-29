import { sanitizeCart } from "@/lib/cart";
import { getCurrentUser } from "@/lib/server/auth";
import { body, fail, guard, json } from "@/lib/server/http";
import { collections } from "@/lib/server/mongo";

/** Signed-in carts live in MongoDB; guests keep theirs in the browser and merge on sign-in. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return fail("Please sign in.", 401);
  const db = await collections();
  const cart = await db.carts.findOne({ _id: user.id });
  return json({ items: sanitizeCart(cart?.items) });
}

export async function PUT(req: Request) {
  const blocked = guard(req);
  if (blocked) return blocked;
  const user = await getCurrentUser();
  if (!user) return fail("Please sign in.", 401);

  const items = sanitizeCart((await body<{ items: string[] }>(req)).items);
  const db = await collections();
  await db.carts.updateOne({ _id: user.id }, { $set: { items, updatedAt: new Date() } }, { upsert: true });
  return json({ items });
}
