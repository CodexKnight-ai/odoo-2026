import { MaintenanceStatus, Role, VehicleStatus } from "@/lib/generated/prisma/client";
import { apiError, authenticate, body, date, id, json, number, required, toPlain, ApiError } from "@/app/src/lib/api";
import { prisma } from "@/app/src/lib/db";

const activeStatuses = [MaintenanceStatus.OPEN, MaintenanceStatus.IN_PROGRESS];

export async function GET(request) {
  try {
    authenticate(request, [Role.FLEET_MANAGER, Role.FINANCIAL_ANALYST, Role.SAFETY_OFFICER]);
    const q = new URL(request.url).searchParams;
    const status = q.get("status");
    if (status && !Object.values(MaintenanceStatus).includes(status)) throw new ApiError("status is invalid.");
    const logs = await prisma.maintenanceLog.findMany({ where: { ...(status ? { status } : {}), ...(q.get("vehicleId") ? { vehicleId: id(q.get("vehicleId"), "vehicleId") } : {}) }, include: { vehicle: true }, orderBy: { scheduledAt: "desc" } });
    return json({ maintenanceLogs: toPlain(logs) });
  } catch (error) { return apiError(error); }
}

export async function POST(request) {
  try {
    authenticate(request, [Role.FLEET_MANAGER]);
    const input = await body(request);
    const vehicleId = id(input.vehicleId, "vehicleId");
    const log = await prisma.$transaction(async (tx) => {
      const vehicle = await tx.vehicle.findUniqueOrThrow({ where: { id: vehicleId } });
      if (vehicle.status === VehicleStatus.RETIRED) throw new ApiError("A retired vehicle cannot receive an active maintenance record.");
      if (vehicle.status === VehicleStatus.ON_TRIP) throw new ApiError("Complete or cancel the active trip before starting maintenance.");
      const created = await tx.maintenanceLog.create({ data: maintenanceData(input, vehicleId) });
      await tx.vehicle.update({ where: { id: vehicleId }, data: { status: VehicleStatus.IN_SHOP } });
      return created;
    });
    return json({ maintenanceLog: toPlain(log) }, 201);
  } catch (error) { return apiError(error); }
}

export async function PATCH(request) {
  try {
    authenticate(request, [Role.FLEET_MANAGER]);
    const input = await body(request);
    const logId = id(input.id);
    if (input.status && !Object.values(MaintenanceStatus).includes(input.status)) throw new ApiError("status is invalid.");
    const log = await prisma.$transaction(async (tx) => {
      const existing = await tx.maintenanceLog.findUniqueOrThrow({ where: { id: logId } });
      const nextStatus = input.status || existing.status;
      const updated = await tx.maintenanceLog.update({ where: { id: logId }, data: { ...maintenanceData(input, existing.vehicleId, true), ...(activeStatuses.includes(nextStatus) ? {} : { completedAt: date(input.completedAt, "completedAt", { required: false }) || new Date() }) } });
      if (!activeStatuses.includes(nextStatus)) {
        const remaining = await tx.maintenanceLog.count({ where: { vehicleId: existing.vehicleId, status: { in: activeStatuses } } });
        const vehicle = await tx.vehicle.findUniqueOrThrow({ where: { id: existing.vehicleId } });
        if (remaining === 0 && vehicle.status !== VehicleStatus.RETIRED) await tx.vehicle.update({ where: { id: existing.vehicleId }, data: { status: VehicleStatus.AVAILABLE } });
      }
      return updated;
    });
    return json({ maintenanceLog: toPlain(log) });
  } catch (error) { return apiError(error); }
}

function maintenanceData(input, vehicleId, partial = false) {
  const data = partial ? {} : { vehicleId };
  if (!partial || input.description !== undefined) data.description = String(required(input.description, "description"));
  if (!partial || input.cost !== undefined) data.cost = number(input.cost, "cost");
  if (!partial || input.scheduledAt !== undefined) data.scheduledAt = date(input.scheduledAt, "scheduledAt", { required: !partial });
  if (input.notes !== undefined) data.notes = input.notes === "" ? null : String(input.notes);
  if (input.status !== undefined) data.status = input.status;
  return data;
}
