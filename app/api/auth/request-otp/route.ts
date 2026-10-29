import { normalizeEmail, requestOtp } from "@/lib/server/auth";
import { body, clientIp, fail, guard, json, limited } from "@/lib/server/http";
import { emailEnabled } from "@/lib/server/mail";

export async function POST(req: Request) {
  const blocked = guard(req);
  if (blocked) return blocked;
  if (limited(`otp:${clientIp(req)}`, 10, 10 * 60 * 1000)) return fail("Too many requests. Please slow down.", 429);

  const email = normalizeEmail((await body<{ email: string }>(req)).email);
  if (!email) return fail("Enter a valid email address.");

  const result = await requestOtp(email);
  if (!result.ok) return fail(result.error, result.retryAfter ? 429 : 400, { retryAfter: result.retryAfter });
  return json({ ok: true, dev: !emailEnabled() && process.env.NODE_ENV !== "production" });
}
