import { getCurrentUser, updateUserName } from "@/lib/server/auth";
import { body, fail, guard, json } from "@/lib/server/http";

export async function GET() {
  return json({ user: await getCurrentUser() });
}

export async function PATCH(req: Request) {
  const blocked = guard(req);
  if (blocked) return blocked;
  const user = await getCurrentUser();
  if (!user) return fail("Please sign in.", 401);

  const name = String((await body<{ name: string }>(req)).name ?? "").trim().slice(0, 60);
  if (!name) return fail("Name can't be empty.");

  return json({ user: await updateUserName(user.id, name) });
}
