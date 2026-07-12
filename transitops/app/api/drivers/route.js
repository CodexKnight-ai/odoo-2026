import { DriverStatus, Role } from "@/lib/generated/prisma/client";
import { apiError, authenticate, body, date, id, json, number, required, toPlain, ApiError } from "@/app/src/lib/api";
import { prisma } from "@/app/src/lib/db";

export async function GET(request) {
  try {
    authenticate(request);
    const q = new URL(request.url).searchParams;
    const status = q.get("status");
    if (status && !Object.values(DriverStatus).includes(status)) throw new ApiError("status is invalid.");
    const drivers = await prisma.driver.findMany({ where: status ? { status } : {}, orderBy: { name: "asc" } });
    return json({ drivers: toPlain(drivers) });
  } catch (error) { return apiError(error); }
}

export async function POST(request) {
  try {
    authenticate(request, [Role.FLEET_MANAGER, Role.SAFETY_OFFICER]);
    const driver = await prisma.driver.create({ data: driverData(await body(request)) });
    return json({ driver: toPlain(driver) }, 201);
  } catch (error) { return apiError(error); }
}

export async function PATCH(request) {
  try {
    authenticate(request, [Role.FLEET_MANAGER, Role.SAFETY_OFFICER]);
    const input = await body(request);
    if (input.status && !Object.values(DriverStatus).includes(input.status)) throw new ApiError("status is invalid.");
    if (input.status === DriverStatus.ON_TRIP) throw new ApiError("On Trip status is set by the dispatch workflow.");
    const driver = await prisma.driver.update({ where: { id: id(input.id) }, data: driverData(input, true) });
    return json({ driver: toPlain(driver) });
  } catch (error) { return apiError(error); }
}

export async function DELETE(request) {
  try {
    authenticate(request, [Role.FLEET_MANAGER, Role.SAFETY_OFFICER]);
    const driver = await prisma.driver.delete({ where: { id: id(new URL(request.url).searchParams.get("id")) } });
    return json({ driver: toPlain(driver) });
  } catch (error) { return apiError(error); }
}

function driverData(input, partial = false) {
  const data = {};
  for (const field of ["name", "licenseNumber", "licenseCategory", "contactNumber"]) if (!partial || input[field] !== undefined) data[field] = String(required(input[field], field));
  if (!partial || input.licenseExpiryDate !== undefined) data.licenseExpiryDate = date(input.licenseExpiryDate, "licenseExpiryDate");
  if (!partial || input.safetyScore !== undefined) data.safetyScore = number(input.safetyScore, "safetyScore", { min: 0 });
  if (input.status !== undefined) data.status = input.status;
  return data;
}
