// Interactive setup: creates .env.local for you. Run via start.bat or:  node setup.mjs
import fs from "node:fs";
import crypto from "node:crypto";
import readline from "node:readline/promises";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const clean = (s) => s.trim().replace(/^["']|["']$/g, "");
const ask = async (q, def = "") => clean((await rl.question(def ? `${q} [${def}]: ` : `${q}: `)) || def);
const askRequired = async (q, def = "") => {
  for (;;) {
    const v = await ask(q, def);
    if (v) return v;
    console.log("  This value is required.");
  }
};
const BAD = /[$"\\`\s]/;

if (fs.existsSync(".env.local")) {
  const a = (await ask(".env.local already exists. Overwrite it? (y/N)", "N")).toLowerCase();
  if (a !== "y") {
    console.log("Keeping your existing .env.local.");
    rl.close();
    process.exit(0);
  }
}

console.log("\nREC.STUDIO setup. Press Enter to accept the value in [brackets].\n");
const region = await askRequired("AWS region", "eu-central-1");
const keyId = await askRequired("AWS Access key ID");
const secret = await askRequired("AWS Secret access key");
const bucket = await askRequired("S3 bucket name");
const user = await askRequired("Admin username (you will log in with it)", "admin");
let pass = "";
for (;;) {
  pass = await askRequired("Admin password (8+ characters)");
  if (pass.length >= 8 && !BAD.test(pass)) break;
  console.log('  Use at least 8 characters, with no spaces and none of: $ " \\ `');
}
rl.close();

const q = (v) => `"${v}"`;
const lines = [
  `REC_AWS_REGION=${q(region)}`,
  `REC_AWS_ACCESS_KEY_ID=${q(keyId)}`,
  `REC_AWS_SECRET_ACCESS_KEY=${q(secret)}`,
  `S3_BUCKET=${q(bucket)}`,
  `ADMIN_USER=${q(user)}`,
  `ADMIN_PASSWORD=${q(pass)}`,
  `FACE_MATCH_THRESHOLD=90`,
  `SESSION_SECRET=${q(crypto.randomBytes(32).toString("base64url"))}`,
];
fs.writeFileSync(".env.local", lines.join("\n") + "\n");
console.log("\nSaved .env.local (it stays on this computer only).");
