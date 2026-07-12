import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out" });

  // Clear the session cookie
  response.cookies.set("session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
  });

  return response;
}
