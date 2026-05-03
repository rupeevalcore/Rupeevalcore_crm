import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { findUserByEmail, findUserById } from "@/lib/db";
import { createSessionToken, readSessionToken, SESSION_COOKIE } from "@/lib/session";
import type { User, UserSession } from "@/types";

export { createSessionToken, readSessionToken, SESSION_COOKIE };

function verifyStoredPassword(password: string, user: User) {
  if (!user.password.startsWith("sha256:")) {
    return password === user.password;
  }

  return user.password === `sha256:${createHash("sha256").update(password).digest("hex")}`;
}

export function authenticateUser(email: string, password: string) {
  const user = findUserByEmail(email.trim().toLowerCase());
  if (!user || !verifyStoredPassword(password, user)) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
  } satisfies UserSession;
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const session = readSessionToken(cookieStore.get(SESSION_COOKIE)?.value);

  if (!session) {
    return null;
  }

  const user = findUserById(session.id);
  return user ? ({ id: user.id, email: user.email, name: user.name } satisfies UserSession) : null;
}

export function setAuthCookie(response: NextResponse, user: UserSession) {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: createSessionToken(user),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
