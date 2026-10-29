import "server-only";
import { MongoClient, type Collection, type Db } from "mongodb";

export type UserDoc = { _id: string; email: string; name: string; createdAt: Date };
export type OtpDoc = { email: string; hash: string; expiresAt: Date; attempts: number; sentAt: Date };
export type OtpSendDoc = { email: string; at: Date };
export type SessionDoc = { hash: string; userId: string; expiresAt: Date; createdAt: Date };
export type CartDoc = { _id: string; items: string[]; updatedAt: Date };
export type OrderDoc = { _id: string; userId: string; items: string[]; total: number; createdAt: Date };
export type FeedbackDoc = {
  userId: string | null;
  email: string | null;
  rating: number;
  topic: string;
  message: string;
  page: string;
  createdAt: Date;
};

type Collections = {
  users: Collection<UserDoc>;
  otps: Collection<OtpDoc>;
  otpSends: Collection<OtpSendDoc>;
  sessions: Collection<SessionDoc>;
  carts: Collection<CartDoc>;
  orders: Collection<OrderDoc>;
  feedback: Collection<FeedbackDoc>;
};

// Reuse one client across hot reloads in dev and across requests in production.
const globalForMongo = globalThis as unknown as { _kisMongo?: Promise<Collections> };

async function connect(): Promise<Collections> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set. Add your MongoDB connection string to .env.local.");
  const client = await new MongoClient(uri, { appName: "keep-it-sorted" }).connect();
  const db: Db = client.db(process.env.MONGODB_DB || "keep-it-sorted");

  const c: Collections = {
    users: db.collection("users"),
    otps: db.collection("otps"),
    otpSends: db.collection("otp_sends"),
    sessions: db.collection("sessions"),
    carts: db.collection("carts"),
    orders: db.collection("orders"),
    feedback: db.collection("feedback"),
  };

  // Uniqueness + automatic cleanup: MongoDB deletes expired codes and sessions on its own (TTL indexes).
  await Promise.all([
    c.users.createIndex({ email: 1 }, { unique: true }),
    c.otps.createIndex({ email: 1 }, { unique: true }),
    c.otps.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    c.otpSends.createIndex({ email: 1, at: -1 }),
    c.otpSends.createIndex({ at: 1 }, { expireAfterSeconds: 60 * 60 }),
    c.sessions.createIndex({ hash: 1 }, { unique: true }),
    c.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    c.orders.createIndex({ userId: 1, createdAt: -1 }),
    c.feedback.createIndex({ createdAt: -1 }),
  ]);
  return c;
}

export function collections(): Promise<Collections> {
  if (!globalForMongo._kisMongo) {
    globalForMongo._kisMongo = connect().catch((err) => {
      globalForMongo._kisMongo = undefined; // allow a retry on the next request
      throw err;
    });
  }
  return globalForMongo._kisMongo;
}
