import { FEEDBACK_TOPICS } from "@/lib/feedback";
import { getCurrentUser, normalizeEmail } from "@/lib/server/auth";
import { body, clientIp, fail, guard, json, limited } from "@/lib/server/http";
import { collections } from "@/lib/server/mongo";

export async function POST(req: Request) {
  const blocked = guard(req);
  if (blocked) return blocked;
  if (limited(`feedback:${clientIp(req)}`, 5, 10 * 60 * 1000)) return fail("You've sent a lot of feedback. Thank you! Try again in a few minutes.", 429);

  const input = await body<{ rating: number; topic: string; message: string; email: string; page: string }>(req);
  const rating = Number(input.rating);
  const topic = FEEDBACK_TOPICS.find((t) => t === input.topic) ?? "Other";
  const message = String(input.message ?? "").trim();
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return fail("Pick a rating from 1 to 5.");
  if (message.length < 3) return fail("Tell us a little more (at least a few characters).");
  if (message.length > 2000) return fail("Please keep it under 2,000 characters.");

  const user = await getCurrentUser();
  const email = user?.email ?? (input.email ? normalizeEmail(input.email) : null);
  if (input.email && !user && !email) return fail("That email doesn't look right.");

  const db = await collections();
  await db.feedback.insertOne({
    userId: user?.id ?? null,
    email,
    rating,
    topic,
    message,
    page: String(input.page ?? "/").slice(0, 200),
    createdAt: new Date(),
  });
  return json({ ok: true });
}
