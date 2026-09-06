import { cookies } from "next/headers";
import crypto from "crypto";

/**
 * Minimal password-based auth for the /admin panel. There's a single admin
 * (Mik), so this intentionally avoids a user table or a full auth library:
 * one shared password (ADMIN_PASSWORD env var) grants a signed, expiring
 * session cookie. The signature prevents a visitor from forging a cookie
 * without knowing the password; timingSafeEqual avoids leaking the password
 * or signature via response-time differences.
 */

export const COOKIE_NAME = "admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days, in seconds

function getSecret(): string {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error(
      "ADMIN_PASSWORD is not set. Add it to your environment variables to enable /admin."
    );
  }
  return secret;
}

function sign(value: string): string {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
}

export function createSessionToken(): string {
  const issuedAt = Date.now().toString();
  return `${issuedAt}.${sign(issuedAt)}`;
}

export function isValidSessionToken(token: string | undefined | null): boolean {
  if (!token) return false;

  const [issuedAt, signature] = token.split(".");
  if (!issuedAt || !signature) return false;

  let expectedSignature: string;
  try {
    expectedSignature = sign(issuedAt);
  } catch {
    return false;
  }

  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);
  if (provided.length !== expected.length) return false;
  if (!crypto.timingSafeEqual(provided, expected)) return false;

  const age = Date.now() - Number(issuedAt);
  return age >= 0 && age < SESSION_MAX_AGE * 1000;
}

export function passwordsMatch(input: string, expected: string): boolean {
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const store = await cookies();
    const token = store.get(COOKIE_NAME)?.value;
    return isValidSessionToken(token);
  } catch {
    return false;
  }
}
