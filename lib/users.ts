import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { BUCKET, s3 } from "./aws";

// Staff accounts live in S3 (config/users.json) with scrypt-hashed passwords.
// The owner account comes from ADMIN_USER / ADMIN_PASSWORD in .env.local.
export type UserRec = { username: string; salt: string; hash: string; createdAt: string };
const KEY = "config/users.json";

export async function listUsers(): Promise<UserRec[]> {
  try {
    const r = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: KEY }));
    return JSON.parse(await r.Body!.transformToString());
  } catch (e: any) {
    if (e?.name === "NoSuchKey") return [];
    throw e;
  }
}

const save = (u: UserRec[]) =>
  s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: KEY, Body: JSON.stringify(u), ContentType: "application/json" }));
const hashPw = (pw: string, salt: string) => scryptSync(pw, salt, 64).toString("hex");
const same = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export async function addUser(username: string, password: string) {
  const users = await listUsers();
  if (users.some((u) => u.username === username) || username === process.env.ADMIN_USER?.toLowerCase()) return false;
  const salt = randomBytes(16).toString("hex");
  users.push({ username, salt, hash: hashPw(password, salt), createdAt: new Date().toISOString() });
  await save(users);
  return true;
}

export async function removeUser(username: string) {
  const users = await listUsers();
  const next = users.filter((u) => u.username !== username);
  if (next.length === users.length) return false;
  await save(next);
  return true;
}

export async function checkLogin(username: string, password: string): Promise<{ u: string; r: "owner" | "staff" } | null> {
  const name = username.trim().toLowerCase();
  const ownerU = process.env.ADMIN_USER?.toLowerCase();
  const ownerP = process.env.ADMIN_PASSWORD;
  if (ownerU && ownerP && name === ownerU) return same(password, ownerP) ? { u: name, r: "owner" } : null;

  const user = (await listUsers()).find((u) => u.username === name);
  if (!user) {
    hashPw(password, "0".repeat(32)); // keep timing similar for unknown users
    return null;
  }
  return same(hashPw(password, user.salt), user.hash) ? { u: name, r: "staff" } : null;
}
