import bcrypt from "bcryptjs";
import { Role } from "@/lib/generated/prisma/client";
import { apiError, authenticate, body, issueToken, json, required, toPlain, ApiError } from "@/app/src/lib/api";
import { prisma } from "@/app/src/lib/db";

export async function POST(request) {
    try {
        const input = await body(request);
        const action = input.action || "login";
        const email = String(required(input.email, "email")).trim().toLowerCase();
        const password = String(required(input.password, "password"));
        if (!/^\S+@\S+\.\S+$/.test(email)) throw new ApiError("email must be valid.");

        if (action === "register") {
            if (password.length < 8) throw new ApiError("password must contain at least 8 characters.");
            const userCount = await prisma.user.count();
            const requestedRole = input.role;
            if (requestedRole && !Object.values(Role).includes(requestedRole)) throw new ApiError("role is invalid.");
            const role = userCount === 0 ? requestedRole || Role.FLEET_MANAGER : Role.DRIVER;
            const user = await prisma.user.create({ data: { email, password: await bcrypt.hash(password, 12), role } });
            return sessionResponse(user, 201);
        }

        if (action !== "login") throw new ApiError("action must be login or register.");
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) throw new ApiError("Invalid email or password.", 401);
        return sessionResponse(user);
    } catch (error) {
        return apiError(error);
    }
}

export async function GET(request) {
    try {
        const session = authenticate(request);
        return json({ user: toPlain(session) });
    } catch (error) {
        return apiError(error);
    }
}

export async function DELETE() {
    const response = json({ message: "Logged out." });
    response.cookies.set("transitops_token", "", { httpOnly: true, path: "/", maxAge: 0 });
    return response;
}

function sessionResponse(user, status = 200) {
    const token = issueToken(user);
    const response = json({ token, user: { id: user.id, email: user.email, role: user.role } }, status);
    response.cookies.set("transitops_token", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 8 });
    return response;
}