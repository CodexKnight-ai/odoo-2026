import { NextResponse } from "next/server";

export async function POST(req) {
  // Placeholder mock to satisfy the compiler
  return NextResponse.json({ message: "Mock login success", token: "xyz" }, { status: 200 });
}
