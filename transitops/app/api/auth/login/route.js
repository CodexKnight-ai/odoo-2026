import { cookies } from "next/headers";
import { encrypt } from "../../../src/lib/auth.js";
import { prisma } from "../../../src/lib/db.js";
import bcrypt from "bcryptjs";

export async function POST(req) {
    const { email, password } = await req.json();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return Response.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const session = await encrypt({ id: user.id, role: user.role });

    cookies().set("session", session, {
        expires: new Date(Date.now() + 8 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    });

    return Response.json({ message: "Logged in" });
}