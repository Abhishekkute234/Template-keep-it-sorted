import { normalizeEmail, sessionCookie, verifyOtp } from "@/lib/server/auth";
import { body, clientIp, fail, guard, json, limited } from "@/lib/server/http";

export async function POST(req: Request) {
  const blocked = guard(req);
  if (blocked) return blocked;
  if (limited(`verify:${clientIp(req)}`, 20, 10 * 60 * 1000)) return fail("Too many attempts. Please wait a few minutes.", 429);

  const input = await body<{ email: string; code: string }>(req);
  const email = normalizeEmail(input.email);
  if (!email) return fail("Enter a valid email address.");

  const result = await verifyOtp(email, String(input.code ?? "").trim());
  if (!result.ok) return fail(result.error, 401);

  const res = json({ user: result.user, isNew: result.isNew });
  res.cookies.set(sessionCookie(result.token));
  return res;
}
