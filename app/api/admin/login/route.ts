import { NextResponse } from "next/server";
import { createAdminToken, getAdminCookieName, getAdminCredentials } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { username?: string; password?: string }
    | null;

  if (!body?.username || !body?.password) {
    return NextResponse.json({ message: "Identifiants manquants." }, { status: 400 });
  }

  const credentials = getAdminCredentials();
  if (body.username !== credentials.username || body.password !== credentials.password) {
    return NextResponse.json({ message: "Identifiants invalides." }, { status: 401 });
  }

  const token = createAdminToken(body.username);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(getAdminCookieName(), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return response;
}
