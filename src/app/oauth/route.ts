"use server"

import { AUTH_COOKIE } from "@/features/auth/constants";
import { createAdminClient } from "@/lib/appwrite";
import { cookies } from "next/headers";
import { NextResponse,NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  const secret = request.nextUrl.searchParams.get("secret");

  const { account } = await createAdminClient();
  if(!userId || !secret) {
    return new NextResponse("Missing userId or secret", { status: 400 });
  }
  const session = await account.createSession(userId, secret);

  cookies().set(AUTH_COOKIE, session.secret, {
    path: "/",
    httpOnly: true,
    sameSite: "strict",
    secure: true,
  });

  return NextResponse.redirect(`${request.nextUrl.origin}/`);
}
