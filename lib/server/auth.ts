import "server-only";
import { createHash, createHmac, randomBytes, randomInt, randomUUID, timingSafeEqual } from "crypto";
import { MongoServerError } from "mongodb";
import { cookies } from "next/headers";
import { sendOtpEmail } from "./mail";
import { collections, type UserDoc } from "./mongo";

export const SESSION_COOKIE = "kis_session";
const SESSION_DAYS = 30;
const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const OTP_COOLDOWN_MS = 60 * 1000;
const OTP_MAX_PER_HOUR = 5;

const DEV_SECRET = "dev-only-secret-change-me";

function secret() {
  const s = process.env.AUTH_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET must be set in production.");
  return DEV_SECRET;
}

const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");
const otpHash = (email: string, code: string) => createHmac("sha256", secret()).update(`${email}:${code}`).digest("hex");

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return null;
  return email;
}

export type PublicUser = { id: string; email: string; name: string };
const toPublic = (u: UserDoc): PublicUser => ({ id: u._id, email: u.email, name: u.name });

export type OtpRequestResult = { ok: true } | { ok: false; error: string; retryAfter?: number };

export async function requestOtp(email: string): Promise<OtpRequestResult> {
  const db = await collections();
  const now = new Date();

  const recent = await db.otpSends.find({ email, at: { $gt: new Date(now.getTime() - 60 * 60 * 1000) } }).sort({ at: -1 }).toArray();
  const last = recent[0]?.at.getTime();
  if (last && now.getTime() - last < OTP_COOLDOWN_MS) {
    return { ok: false, error: "Please wait a moment before requesting another code.", retryAfter: Math.ceil((OTP_COOLDOWN_MS - (now.getTime() - last)) / 1000) };
  }
  if (recent.length >= OTP_MAX_PER_HOUR) return { ok: false, error: "Too many codes requested. Try again in an hour." };

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await db.otpSends.insertOne({ email, at: now });
  // One live code per email: a new request replaces the previous one.
  await db.otps.replaceOne(
    { email },
    { email, hash: otpHash(email, code), expiresAt: new Date(now.getTime() + OTP_TTL_MS), attempts: 0, sentAt: now },
    { upsert: true },
  );

  try {
    await sendOtpEmail(email, code);
  } catch (err) {
    console.error("[auth] failed to send OTP email", err);
    await db.otps.deleteOne({ email });
    return { ok: false, error: "We couldn't send the email. Please try again shortly." };
  }
  return { ok: true };
}

export type VerifyResult = { ok: true; user: PublicUser; token: string; isNew: boolean } | { ok: false; error: string };

export async function verifyOtp(email: string, code: string): Promise<VerifyResult> {
  if (!/^\d{6}$/.test(code)) return { ok: false, error: "Enter the 6-digit code from your email." };
  const db = await collections();
  const now = new Date();

  const otp = await db.otps.findOne({ email });
  if (!otp || otp.expiresAt < now) return { ok: false, error: "That code has expired. Request a new one." };
  if (otp.attempts >= OTP_MAX_ATTEMPTS) {
    await db.otps.deleteOne({ _id: otp._id });
    return { ok: false, error: "Too many wrong attempts. Request a new code." };
  }

  if (!safeEqual(otp.hash, otpHash(email, code))) {
    const updated = await db.otps.findOneAndUpdate({ _id: otp._id }, { $inc: { attempts: 1 } }, { returnDocument: "after" });
    const left = OTP_MAX_ATTEMPTS - (updated?.attempts ?? OTP_MAX_ATTEMPTS);
    return { ok: false, error: left > 0 ? `That code isn't right. ${left} attempt${left === 1 ? "" : "s"} left.` : "Too many wrong attempts. Request a new code." };
  }

  // Consume the code atomically so it can only ever be used once, even with parallel requests.
  const consumed = await db.otps.findOneAndDelete({ _id: otp._id, hash: otp.hash });
  if (!consumed) return { ok: false, error: "That code has already been used. Request a new one." };

  let user = await db.users.findOne({ email });
  let isNew = false;
  if (!user) {
    const fresh: UserDoc = { _id: randomUUID(), email, name: email.split("@")[0], createdAt: now };
    try {
      await db.users.insertOne(fresh);
      user = fresh;
      isNew = true;
    } catch (err) {
      // Lost a race with a parallel sign-in for the same email: use the account that won.
      if (!(err instanceof MongoServerError && err.code === 11000)) throw err;
      user = await db.users.findOne({ email });
    }
  }
  if (!user) return { ok: false, error: "Something went wrong. Please try again." };

  const token = randomBytes(32).toString("hex");
  await db.sessions.insertOne({ hash: sha256(token), userId: user._id, expiresAt: new Date(now.getTime() + SESSION_DAYS * 864e5), createdAt: now });
  return { ok: true, user: toPublic(user), token, isNew };
}

export async function updateUserName(userId: string, name: string): Promise<PublicUser | null> {
  const db = await collections();
  const user = await db.users.findOneAndUpdate({ _id: userId }, { $set: { name } }, { returnDocument: "after" });
  return user ? toPublic(user) : null;
}

export async function getUserCreatedAt(userId: string): Promise<Date | null> {
  const db = await collections();
  return (await db.users.findOne({ _id: userId }, { projection: { createdAt: 1 } }))?.createdAt ?? null;
}

export const sessionCookie = (token: string) => ({
  name: SESSION_COOKIE,
  value: token,
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_DAYS * 86400,
});

/** The signed-in user for the current request, or null. Works in server components and route handlers. */
export async function getCurrentUser(): Promise<PublicUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  try {
    const db = await collections();
    const session = await db.sessions.findOne({ hash: sha256(token), expiresAt: { $gt: new Date() } });
    if (!session) return null;
    const user = await db.users.findOne({ _id: session.userId });
    return user ? toPublic(user) : null;
  } catch (err) {
    // A database outage shouldn't take the whole site down: browse as signed-out until it recovers.
    console.error("[auth] session lookup failed:", (err as Error).message);
    return null;
  }
}

export async function destroySession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return;
  const db = await collections();
  await db.sessions.deleteOne({ hash: sha256(token) });
}
