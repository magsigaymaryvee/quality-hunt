// lib/password.ts
// Checks a password against its scrambled "hash".
// PBKDF2 with 100,000 rounds: the strongest setting Cloudflare Workers allow.

function toHex(bytes: ArrayBuffer | Uint8Array): string {
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function fromHex(hex: string): Uint8Array<ArrayBuffer> {
  const out = new Uint8Array(new ArrayBuffer(hex.length / 2));
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

async function derive(password: string, salt: Uint8Array<ArrayBuffer>, rounds: number): Promise<ArrayBuffer> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  return crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: rounds }, key, 256);
}

// The stored hash looks like: pbkdf2$100000$<salt>$<hash>
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, rounds, saltHex, hashHex] = stored.split("$");
  if (scheme !== "pbkdf2" || !rounds || !saltHex || !hashHex) return false;
  const hash = toHex(await derive(password, fromHex(saltHex), Number(rounds)));
  // compare every character, so the time taken doesn't reveal how close a guess was
  let diff = hash.length ^ hashHex.length;
  for (let i = 0; i < Math.min(hash.length, hashHex.length); i++) diff |= hash.charCodeAt(i) ^ hashHex.charCodeAt(i);
  return diff === 0;
}

// A scrambled copy of the session token, so a database leak doesn't leak sign-ins
export async function sha256(text: string): Promise<string> {
  return toHex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)));
}