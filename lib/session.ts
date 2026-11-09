import { cookies } from "next/headers";

export type SessionRole = "pelanggan" | "kasir" | "kitchen" | "owner";

export interface SessionUser {
  id_akun: number;
  username: string;
  role: SessionRole;
  ref_id: string; // id_pelanggan, id_kasir, id_kitchen, id_owner
  nama: string;
  exp: number; // unix timestamp in seconds
}

export const SESSION_COOKIE_NAME = "donat_session";
export const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60; // 8 jam

const SESSION_SECRET =
  process.env.SESSION_SECRET || "donat-habil-default-secret-key-modul-4-lsik-2026-unand";

async function getCryptoKey() {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function createSessionToken(
  payload: Omit<SessionUser, "exp">
): Promise<string> {
  const key = await getCryptoKey();
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS;
  const fullPayload: SessionUser = { ...payload, exp };

  const enc = new TextEncoder();
  const dataString = JSON.stringify(fullPayload);
  const dataB64 = Buffer.from(dataString).toString("base64url");

  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(dataB64));
  const sigB64 = Buffer.from(signature).toString("base64url");

  return `${dataB64}.${sigB64}`;
}

export async function verifySessionToken(
  token?: string | null
): Promise<SessionUser | null> {
  if (!token || !token.includes(".")) return null;

  try {
    const [dataB64, sigB64] = token.split(".");
    if (!dataB64 || !sigB64) return null;

    const key = await getCryptoKey();
    const enc = new TextEncoder();
    const sigBuffer = Buffer.from(sigB64, "base64url");

    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBuffer,
      enc.encode(dataB64)
    );

    if (!valid) return null;

    const payloadJson = Buffer.from(dataB64, "base64url").toString("utf-8");
    const payload = JSON.parse(payloadJson) as SessionUser;

    // Cek kedaluwarsa
    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp < now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function setSessionCookie(
  payload: Omit<SessionUser, "exp">
): Promise<string> {
  const token = await createSessionToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return token;
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
