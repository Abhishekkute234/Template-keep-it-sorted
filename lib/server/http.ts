import "server-only";
import { NextResponse } from "next/server";

export const json = (body: unknown, status = 200) => NextResponse.json(body, { status });
export const fail = (error: string, status = 400, extra?: Record<string, unknown>) => NextResponse.json({ error, ...extra }, { status });

/**
 * Basic CSRF guard for state-changing requests: the browser must send JSON from our own origin.
 * Returns an error response to bail out with, or null when the request is fine.
 */
export function guard(req: Request): NextResponse | null {
  if (!req.headers.get("content-type")?.includes("application/json")) return fail("Expected a JSON body.", 415);
  const origin = req.headers.get("origin");
  if (origin) {
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    if (!host || new URL(origin).host !== host) return fail("Cross-site request blocked.", 403);
  }
  return null;
}

export async function body<T = Record<string, unknown>>(req: Request): Promise<Partial<T>> {
  try {
    const data = await req.json();
    return data && typeof data === "object" ? data : {};
  } catch {
    return {};
  }
}

const buckets = new Map<string, number[]>();

/** In-memory sliding-window limiter, keyed per client. Good enough for one server process. */
export function limited(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= max) return true;
  hits.push(now);
  buckets.set(key, hits);
  return false;
}

export const clientIp = (req: Request) => req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
