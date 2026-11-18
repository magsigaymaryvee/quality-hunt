// src/lib/db.ts
// One place that knows how to talk to the database.
import { neon } from "@neondatabase/serverless";

export function sql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is missing. Check .env.local or the Cloudflare secret.");
  }
  return neon(url);
}