import { destroySession, SESSION_COOKIE } from "@/lib/server/auth";
import { guard, json } from "@/lib/server/http";

export async function POST(req: Request) {
  const blocked = guard(req);
  if (blocked) return blocked;
  await destroySession();
  const res = json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
