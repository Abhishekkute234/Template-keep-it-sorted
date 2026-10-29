// Checks that MONGODB_URI in .env.local can connect and log in. Writes nothing.
// Usage: npm run db:check
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.log("MONGODB_URI is empty in .env.local.");
  process.exit(1);
}
const placeholders = uri.match(/<[^>]*>/g);
if (placeholders) {
  console.log(`MONGODB_URI still contains ${placeholders.join(", ")}. Replace it (including the < >) with your real value.`);
  process.exit(1);
}

try {
  const client = await new MongoClient(uri, { serverSelectionTimeoutMS: 8000 }).connect();
  await client.db(process.env.MONGODB_DB || "keep-it-sorted").command({ ping: 1 });
  console.log(`OK: connected to MongoDB, database "${process.env.MONGODB_DB || "keep-it-sorted"}".`);
  await client.close();
} catch (err) {
  console.error(`FAILED: ${err.message.split("\n")[0]}`);
  if (/auth/i.test(err.message)) console.error("Check the database user's name and password in Atlas > Database Access.");
  if (/timed out|ENOTFOUND|querySrv/i.test(err.message)) console.error("Check Atlas > Network Access allows your IP address.");
  process.exit(1);
}
