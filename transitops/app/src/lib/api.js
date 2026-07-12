import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { Role } from "@/lib/generated/prisma/client";

export const json = (data, status = 200) => NextResponse.json(data, { status });

export async function body(request) {
  try {
    return await request.json();
  } catch {
    throw new ApiError("Request body must be valid JSON.", 400);
  }
}

export class ApiError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

export function required(value, name) {
  if (value === undefined || value === null || value === "") throw new ApiError(`${name} is required.`);
  return value;
}

export function id(value, name = "id") {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) throw new ApiError(`${name} must be a positive integer.`);
  return parsed;
}

export function number(value, name, { min = 0, required: isRequired = true } = {}) {
  if ((value === undefined || value === null || value === "") && !isRequired) return undefined;
  const parsed = Number(required(value, name));
  if (!Number.isFinite(parsed) || parsed < min) throw new ApiError(`${name} must be a number greater than or equal to ${min}.`);
  return parsed;
}

export function date(value, name, { required: isRequired = true } = {}) {
  if ((value === undefined || value === null || value === "") && !isRequired) return undefined;
  const parsed = new Date(String(required(value, name)));
  if (Number.isNaN(parsed.getTime())) throw new ApiError(`${name} must be a valid date.`);
  return parsed;
}

const secret = () => process.env.JWT_SECRET || "transitops-development-secret-change-me";

export function issueToken(user) {
  return jwt.sign({ sub: String(user.id), email: user.email, role: user.role }, secret(), { expiresIn: "8h" });
}

export function authenticate(request, roles) {
  const authorization = request.headers.get("authorization");
  const cookieToken = request.headers.get("cookie")?.match(/(?:^|; )transitops_token=([^;]+)/)?.[1];
  const token = authorization?.replace(/^Bearer\s+/i, "") || (cookieToken && decodeURIComponent(cookieToken));
  if (!token) throw new ApiError("Authentication is required.", 401);
  try {
    const payload = jwt.verify(token, secret());
    const session = { id: id(payload.sub, "token subject"), email: String(payload.email || ""), role: payload.role };
    if (!Object.values(Role).includes(session.role)) throw new Error("Invalid role");
    if (roles && !roles.includes(session.role)) throw new ApiError("You do not have permission to perform this action.", 403);
    return session;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Your session is invalid or has expired.", 401);
  }
}

export function apiError(error) {
  if (error instanceof ApiError) return json({ error: error.message }, error.status);
  const code = error?.code;
  if (code === "P2002") return json({ error: "A record with this unique value already exists." }, 409);
  if (code === "P2025") return json({ error: "Record not found." }, 404);
  console.error(error);
  return json({ error: "An unexpected server error occurred." }, 500);
}

export const toPlain = (value) => JSON.parse(JSON.stringify(value));
