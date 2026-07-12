import { NextResponse } from "next/server";
import { encrypt } from "../../../src/lib/auth.js";
import { prisma } from "../../../src/lib/db.js";
import bcrypt from "bcryptjs";

export async function POST(req) {
  const { email, password, role } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  // Check if user already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "User already exists" }, { status: 409 });
  }

  // Hash password and create user
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      role: role ?? "DRIVER",
    },
  });

  // Create session and set cookie
  const session = await encrypt({ id: user.id, role: user.role });
  const response = NextResponse.json({ message: "User registered" }, { status: 201 });
  response.cookies.set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: new Date(Date.now() + 8 * 60 * 60 * 1000),
  });

  return response;
}
