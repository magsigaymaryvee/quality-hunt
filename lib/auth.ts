// lib/auth.ts
// Everything about who is signed in to the admin.
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { sha256, verifyPassword } from "@/lib/password";

const COOKIE = "qh_session";
const SEVEN_DAYS = 60 * 60 * 24 * 7; // in seconds
const MAX_TRIES = 5;

export type Admin = { id: number; email: string };

export type SignInResult = { ok: true } | { ok: false; message: string };

const WRONG = "That email and password don't match.";
const LOCKED = "Too many tries. Please wait 15 minutes, then try again.";

async function logEvent(kind: string, detail = "") {
  const db = sql();
  await db`insert into security_events (kind, detail) values (${kind}, ${detail})`;
}

export async function signIn(email: string, password: string): Promise<SignInResult> {
  const db = sql();
  const rows = await db`
    select id, password_hash, failed_attempts, locked_until
    from admins where email = ${email.trim().toLowerCase()}`;
  const admin = rows[0];

  if (!admin) {
    // No such admin: still spend the same time checking, so bots can't tell emails apart
    await verifyPassword(password, "pbkdf2$100000$00000000000000000000000000000000$00");
    return { ok: false, message: WRONG };
  }

  // A lock that has run out: start counting again
  if (admin.locked_until && new Date(admin.locked_until) <= new Date()) {
    await db`update admins set failed_attempts = 0, locked_until = null where id = ${admin.id}`;
    admin.failed_attempts = 0;
    admin.locked_until = null;
  }

  // Still locked: refuse, even if the password is right
  if (admin.locked_until) return { ok: false, message: LOCKED };

  const ok = await verifyPassword(password, admin.password_hash);
  if (!ok) {
    const tries = admin.failed_attempts + 1;
    if (tries >= MAX_TRIES) {
      await db`update admins set failed_attempts = ${tries}, locked_until = now() + interval '15 minutes' where id = ${admin.id}`;
      await logEvent("locked", `Locked after ${tries} wrong passwords`);
      return { ok: false, message: LOCKED };
    }
    await db`update admins set failed_attempts = ${tries} where id = ${admin.id}`;
    await logEvent("wrong_password", `Wrong password (${tries} of ${MAX_TRIES})`);
    return { ok: false, message: WRONG };
  }

  // Right password: reset the counter and start a session
  await db`update admins set failed_attempts = 0, locked_until = null where id = ${admin.id}`;
  const userAgent = (await headers()).get("user-agent") ?? "";
  const device = userAgent.slice(0, 200);
  const seenBefore = await db`select 1 from security_events where kind = 'signed_in' and detail = ${device} limit 1`;
  if (seenBefore.length === 0) await logEvent("new_device", device);
  await logEvent("signed_in", device);

  const token = crypto.randomUUID() + crypto.randomUUID(); // long and random
  await db`
    insert into sessions (id, admin_id, user_agent, expires_at)
    values (${await sha256(token)}, ${admin.id}, ${userAgent}, now() + interval '7 days')`;

  (await cookies()).set(COOKIE, token, {
    httpOnly: true, // page scripts can't read it
    secure: true, // only sent over HTTPS (localhost counts as safe)
    sameSite: "lax",
    path: "/",
    maxAge: SEVEN_DAYS,
  });
  return { ok: true };
}

// Who is signed in right now? null if nobody.
export async function getCurrentAdmin(): Promise<Admin | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const db = sql();
  const rows = await db`
    select a.id, a.email
    from sessions s join admins a on a.id = s.admin_id
    where s.id = ${await sha256(token)} and s.expires_at > now()`;
  return (rows[0] as Admin | undefined) ?? null;
}

// Put this at the top of every admin page and admin action.
export async function requireAdmin(): Promise<Admin> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/sign-in");
  return admin;
}

export async function signOut() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) {
    const db = sql();
    await db`delete from sessions where id = ${await sha256(token)}`;
  }
  store.delete(COOKIE);
}

export async function signOutEverywhere(adminId: number) {
  const db = sql();
  await db`delete from sessions where admin_id = ${adminId}`;
  await logEvent("signed_out_everywhere");
  (await cookies()).delete(COOKIE);
}