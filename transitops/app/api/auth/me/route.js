import { NextResponse } from "next/server";
import { decrypt } from "../../../src/lib/auth.js";
import { prisma } from "../../../src/lib/db.js";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const payload = await decrypt(session);
  if (!payload) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: { id: true, email: true, role: true, createdAt: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}
