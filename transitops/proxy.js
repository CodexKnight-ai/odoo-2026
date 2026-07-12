import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "transitops-development-secret-change-me"
);

const protectedPaths = [
  "/dashboard",
  "/vehicles",
  "/drivers",
  "/trips",
  "/maintenance",
  "/expenses",
  "/analytics",
  "/settings",
];

const authPaths = ["/login"];

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("transitops_token")?.value;

  const isProtected = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );
  const isAuthPage = authPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  // Verify token if present
  let isValidToken = false;
  if (token) {
    try {
      await jwtVerify(token, secret);
      isValidToken = true;
    } catch {
      isValidToken = false;
    }
  }

  // Protected route without valid token → redirect to login
  if (isProtected && !isValidToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Auth page with valid token → redirect to dashboard
  if (isAuthPage && isValidToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/vehicles/:path*",
    "/drivers/:path*",
    "/trips/:path*",
    "/maintenance/:path*",
    "/expenses/:path*",
    "/analytics/:path*",
    "/settings/:path*",
    "/login",
  ],
};