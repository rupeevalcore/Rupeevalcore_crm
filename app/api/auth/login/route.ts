import { NextResponse } from "next/server";
import { authenticateUser, setAuthCookie } from "@/lib/auth";
import { jsonError } from "@/lib/utils";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { email?: string; password?: string }
    | null;

  if (!body?.email || !body.password) {
    return jsonError("Email and password are required.");
  }

  const user = authenticateUser(body.email, body.password);
  if (!user) {
    return jsonError("Invalid email or password.", 401);
  }

  const response = NextResponse.json({ user });
  setAuthCookie(response, user);
  return response;
}
