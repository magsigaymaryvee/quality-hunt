// scripts/hash-password.mjs
// Run: node scripts/hash-password.mjs
// Type your admin password (it shows as *****). It prints the hash to paste into Neon.
// The password itself is never saved anywhere.
import { createInterface } from "node:readline";

const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
let hidden = false;
rl._writeToOutput = (text) => rl.output.write(hidden ? "*" : text);

rl.question("Admin password (16+ characters): ", async (password) => {
  rl.close();
  console.log("");
  if (password.length < 16) {
    console.log("Too short. Use 16 or more characters from your password manager.");
    process.exit(1);
  }
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: 100000 }, key, 256);
  const hex = (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
  console.log("\nYour hash (copy the whole line):\n");
  console.log(`pbkdf2$100000$${hex(salt)}$${hex(bits)}`);
});
hidden = true;