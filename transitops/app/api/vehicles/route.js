import { Role } from "@/lib/generated/prisma/client";
import { apiError, authenticate, body, id, json, number, required, toPlain, ApiError } from "@/app/src/lib/api";
import { prisma } from "@/app/src/lib/db";

const VehicleStatus = {
  AVAILABLE: "AVAILABLE",
  ON_TRIP: "ON_TRIP",
  IN_SHOP: "IN_SHOP",
  MAINTENANCE: "MAINTENANCE",
};

export async function GET(request) {
  try {
    authenticate(request);
    const q = new URL(request.url).searchParams;
    const status = q.get("status");
    if (status && !Object.values(VehicleStatus).includes(status)) throw new ApiError("status is invalid.");
    const search = q.get("search")?.trim();
    const vehicles = await prisma.vehicle.findMany({
      where: { ...(status ? { status } : {}), ...(q.get("type") ? { type: q.get("type") } : {}), ...(q.get("region") ? { region: q.get("region") } : {}), ...(search ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { registrationNumber: { contains: search, mode: "insensitive" } }] } : {}) },
      orderBy: { createdAt: "desc" },
    });
    return json({ vehicles: toPlain(vehicles) });
  } catch (error) { return apiError(error); }
}

export async function POST(request) {
  try {
    authenticate(request, [Role.FLEET_MANAGER]);
    const input = await body(request);
    const vehicle = await prisma.vehicle.create({ data: vehicleData(input) });
    return json({ vehicle: toPlain(vehicle) }, 201);
  } catch (error) { return apiError(error); }
}

export async function PATCH(request) {
  try {
    authenticate(request, [Role.FLEET_MANAGER]);
    const input = await body(request);
    const vehicleId = id(input.id);
    const existing = await prisma.vehicle.findUniqueOrThrow({ where: { id: vehicleId }, include: { maintenanceLogs: { where: { status: { in: ["OPEN", "IN_PROGRESS"] } } } } });
    if (input.status && !Object.values(VehicleStatus).includes(input.status)) throw new ApiError("status is invalid.");
    if ([VehicleStatus.ON_TRIP, VehicleStatus.IN_SHOP].includes(input.status)) throw new ApiError("On Trip and In Shop statuses are set by trip and maintenance workflows.");
    if (input.status === VehicleStatus.AVAILABLE && existing.maintenanceLogs.length) throw new ApiError("Close active maintenance logs before making this vehicle available.");
    const vehicle = await prisma.vehicle.update({ where: { id: vehicleId }, data: vehicleData(input, true) });
    return json({ vehicle: toPlain(vehicle) });
  } catch (error) { return apiError(error); }
}

export async function DELETE(request) {
  try {
    authenticate(request, [Role.FLEET_MANAGER]);
    const vehicle = await prisma.vehicle.delete({ where: { id: id(new URL(request.url).searchParams.get("id")) } });
    return json({ vehicle: toPlain(vehicle) });
  } catch (error) { return apiError(error); }
}

function vehicleData(input, partial = false) {
  const data = {};
  const text = ["registrationNumber", "name", "type", "region"];
  for (const field of text) if (!partial || input[field] !== undefined) data[field] = field === "region" && input[field] === "" ? null : String(required(input[field], field));
  for (const field of ["maxLoadCapacity", "odometer", "acquisitionCost"]) if (!partial || input[field] !== undefined) data[field] = number(input[field], field);
  if (!partial && input.status !== undefined) data.status = input.status;
  if (partial && input.status !== undefined) data.status = input.status;
  return data;
}
