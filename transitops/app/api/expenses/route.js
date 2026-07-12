import { ExpenseType, Role } from "@/lib/generated/prisma/client";
import { apiError, authenticate, body, date, id, json, number, toPlain, ApiError } from "@/app/src/lib/api";
import { prisma } from "@/app/src/lib/db";

export async function GET(request) {
  try {
    authenticate(request, [Role.FLEET_MANAGER, Role.FINANCIAL_ANALYST]);
    const q = new URL(request.url).searchParams;
    const expenses = await prisma.expense.findMany({ where: q.get("vehicleId") ? { vehicleId: id(q.get("vehicleId"), "vehicleId") } : {}, include: { vehicle: true, trip: true }, orderBy: { date: "desc" } });
    return json({ expenses: toPlain(expenses) });
  } catch (error) { return apiError(error); }
}

export async function POST(request) {
  try {
    authenticate(request, [Role.FLEET_MANAGER, Role.FINANCIAL_ANALYST, Role.DRIVER]);
    const input = await body(request);
    if (!Object.values(ExpenseType).includes(input.type)) throw new ApiError("type is invalid.");
    const vehicleId = id(input.vehicleId, "vehicleId");
    await prisma.vehicle.findUniqueOrThrow({ where: { id: vehicleId } });
    const expense = await prisma.expense.create({ data: { vehicleId, ...(input.tripId !== undefined ? { tripId: id(input.tripId, "tripId") } : {}), type: input.type, amount: number(input.amount, "amount", { min: 0.01 }), description: input.description ? String(input.description) : null, date: date(input.date, "date", { required: false }) || new Date() } });
    return json({ expense: toPlain(expense) }, 201);
  } catch (error) { return apiError(error); }
}
