import { NextResponse } from "next/server";
import { decrypt } from "../transitops/app/src/lib/auth.js";

export async function middleware(request) {
    const session = request.cookies.get("session")?.value;

    if (request.nextUrl.pathname === "/login") {
        return NextResponse.next();
    }

    if (!session) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    const payload = await decrypt(session);
    if (!payload) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (request.nextUrl.pathname.startsWith("/api/reports") && payload.role !== "FLEET_MANAGER") {
        return new Response("Forbidden: Manager Access Only", { status: 403 });
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/api/vehicles/:path*", "/api/trips/:path*", "/api/reports/:path*"],
};