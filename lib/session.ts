import { createHmac, timingSafeEqual } from "node:crypto";
import type { UserSession } from "@/types";

export const SESSION_COOKIE = "rv_session";

const secret = process.env.AUTH_SECRET ?? "rupeevalcore-local-dev-secret";

function sign(value: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function safeCompare(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function createSessionToken(user: UserSession) {
  const payload = Buffer.from(
    JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
    })
  ).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

export function readSessionToken(token: string | undefined | null): UserSession | null {
  if (!token) {
    return null;
  }

  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeCompare(signature, sign(payload))) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as UserSession & {
      exp: number;
    };

    if (parsed.exp < Date.now()) {
      return null;
    }

    return {
      id: parsed.id,
      email: parsed.email,
      name: parsed.name,
    };
  } catch {
    return null;
  }
}
