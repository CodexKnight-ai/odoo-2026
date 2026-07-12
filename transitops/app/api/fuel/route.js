import { Role } from "@/lib/generated/prisma/client";
import { apiError, authenticate, body, date, id, json, number, toPlain } from "@/app/src/lib/api";
import { prisma } from "@/app/src/lib/db";

export async function GET(request) {
  try {
    authenticate(request, [Role.FLEET_MANAGER, Role.FINANCIAL_ANALYST]);
    const q = new URL(request.url).searchParams;
    const logs = await prisma.fuelLog.findMany({ where: q.get("vehicleId") ? { vehicleId: id(q.get("vehicleId"), "vehicleId") } : {}, include: { vehicle: true, trip: true }, orderBy: { date: "desc" } });
    return json({ fuelLogs: toPlain(logs) });
  } catch (error) { return apiError(error); }
}

export async function POST(request) {
  try {
    authenticate(request, [Role.FLEET_MANAGER, Role.DRIVER]);
    const input = await body(request);
    const vehicleId = id(input.vehicleId, "vehicleId");
    await prisma.vehicle.findUniqueOrThrow({ where: { id: vehicleId } });
    if (input.tripId !== undefined) await prisma.trip.findUniqueOrThrow({ where: { id: id(input.tripId, "tripId") } });
    const fuelLog = await prisma.fuelLog.create({ data: { vehicleId, ...(input.tripId !== undefined ? { tripId: id(input.tripId, "tripId") } : {}), liters: number(input.liters, "liters", { min: 0.01 }), cost: number(input.cost, "cost"), date: date(input.date, "date", { required: false }) || new Date(), odometer: number(input.odometer, "odometer", { required: false }) } });
    return json({ fuelLog: toPlain(fuelLog) }, 201);
  } catch (error) { return apiError(error); }
}
