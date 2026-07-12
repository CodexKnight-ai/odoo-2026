import { DriverStatus, Role, TripStatus, VehicleStatus } from "@/lib/generated/prisma/client";
import { apiError, authenticate, body, date, id, json, number, required, toPlain, ApiError } from "@/app/src/lib/api";
import { prisma } from "@/app/src/lib/db";

const tripRoles = [Role.FLEET_MANAGER, Role.DRIVER];

export async function GET(request) {
  try {
    authenticate(request);
    const q = new URL(request.url).searchParams;
    const status = q.get("status");
    if (status && !Object.values(TripStatus).includes(status)) throw new ApiError("status is invalid.");
    const trips = await prisma.trip.findMany({ where: status ? { status } : {}, include: { vehicle: true, driver: true, fuelLogs: true, expenses: true }, orderBy: { createdAt: "desc" } });
    return json({ trips: toPlain(trips) });
  } catch (error) { return apiError(error); }
}

export async function POST(request) {
  try {
    authenticate(request, tripRoles);
    const input = await body(request);
    const trip = await validateAndCreateTrip(input);
    return json({ trip: toPlain(trip) }, 201);
  } catch (error) { return apiError(error); }
}

export async function PATCH(request) {
  try {
    authenticate(request, tripRoles);
    const input = await body(request);
    const tripId = id(input.id);
    if (input.action === "dispatch") return json({ trip: toPlain(await dispatch(tripId)) });
    if (input.action === "complete") return json({ trip: toPlain(await complete(tripId, input)) });
    if (input.action === "cancel") return json({ trip: toPlain(await cancel(tripId)) });
    if (input.action === "update") {
      const existing = await prisma.trip.findUniqueOrThrow({ where: { id: tripId } });
      if (existing.status !== TripStatus.DRAFT) throw new ApiError("Only draft trips can be edited.");
      const data = tripData(input, true);
      if (input.vehicleId !== undefined || input.cargoWeight !== undefined) {
        const vehicle = await prisma.vehicle.findUniqueOrThrow({ where: { id: Number(input.vehicleId ?? existing.vehicleId) } });
        if (Number(input.cargoWeight ?? existing.cargoWeight) > Number(vehicle.maxLoadCapacity)) throw new ApiError("Cargo weight exceeds the vehicle's maximum load capacity.");
      }
      const trip = await prisma.trip.update({ where: { id: tripId }, data, include: { vehicle: true, driver: true } });
      return json({ trip: toPlain(trip) });
    }
    throw new ApiError("action must be dispatch, complete, cancel, or update.");
  } catch (error) { return apiError(error); }
}

async function validateAndCreateTrip(input) {
  const vehicleId = id(input.vehicleId, "vehicleId");
  const driverId = id(input.driverId, "driverId");
  const cargoWeight = number(input.cargoWeight, "cargoWeight", { min: 0.01 });
  const [vehicle, driver] = await Promise.all([prisma.vehicle.findUniqueOrThrow({ where: { id: vehicleId } }), prisma.driver.findUniqueOrThrow({ where: { id: driverId } })]);
  if (cargoWeight > Number(vehicle.maxLoadCapacity)) throw new ApiError("Cargo weight exceeds the vehicle's maximum load capacity.");
  if (driver.licenseExpiryDate <= new Date()) throw new ApiError("The selected driver's license has expired.");
  return prisma.trip.create({ data: tripData(input, false), include: { vehicle: true, driver: true } });
}

async function dispatch(tripId) {
  return prisma.$transaction(async (tx) => {
    const trip = await tx.trip.findUniqueOrThrow({ where: { id: tripId }, include: { vehicle: true, driver: true } });
    if (trip.status !== TripStatus.DRAFT) throw new ApiError("Only draft trips can be dispatched.");
    if (trip.vehicle.status !== VehicleStatus.AVAILABLE) throw new ApiError("The selected vehicle is not available for dispatch.");
    if (trip.driver.status !== DriverStatus.AVAILABLE || trip.driver.licenseExpiryDate <= new Date()) throw new ApiError("The selected driver is not eligible for dispatch.");
    if (Number(trip.cargoWeight) > Number(trip.vehicle.maxLoadCapacity)) throw new ApiError("Cargo weight exceeds the vehicle's maximum load capacity.");
    await tx.vehicle.update({ where: { id: trip.vehicleId }, data: { status: VehicleStatus.ON_TRIP } });
    await tx.driver.update({ where: { id: trip.driverId }, data: { status: DriverStatus.ON_TRIP } });
    return tx.trip.update({ where: { id: tripId }, data: { status: TripStatus.DISPATCHED, dispatchedAt: new Date() }, include: { vehicle: true, driver: true } });
  });
}

async function complete(tripId, input) {
  return prisma.$transaction(async (tx) => {
    const trip = await tx.trip.findUniqueOrThrow({ where: { id: tripId }, include: { vehicle: true } });
    if (trip.status !== TripStatus.DISPATCHED) throw new ApiError("Only dispatched trips can be completed.");
    const finalOdometer = number(input.finalOdometer, "finalOdometer");
    if (finalOdometer < Number(trip.vehicle.odometer)) throw new ApiError("finalOdometer cannot be lower than the vehicle's current odometer.");
    const actualDistance = number(input.actualDistance, "actualDistance", { min: 0, required: false }) ?? finalOdometer - Number(trip.vehicle.odometer);
    const updated = await tx.trip.update({ where: { id: tripId }, data: { status: TripStatus.COMPLETED, completedAt: new Date(), finalOdometer, actualDistance, ...(input.revenue !== undefined ? { revenue: number(input.revenue, "revenue") } : {}) } });
    await tx.vehicle.update({ where: { id: trip.vehicleId }, data: { status: VehicleStatus.AVAILABLE, odometer: finalOdometer } });
    await tx.driver.update({ where: { id: trip.driverId }, data: { status: DriverStatus.AVAILABLE } });
    if (input.fuelLiters !== undefined) await tx.fuelLog.create({ data: { vehicleId: trip.vehicleId, tripId, liters: number(input.fuelLiters, "fuelLiters", { min: 0.01 }), cost: number(input.fuelCost, "fuelCost"), date: date(input.fuelDate, "fuelDate", { required: false }) || new Date(), odometer: finalOdometer } });
    return tx.trip.findUniqueOrThrow({ where: { id: updated.id }, include: { vehicle: true, driver: true, fuelLogs: true } });
  });
}

async function cancel(tripId) {
  return prisma.$transaction(async (tx) => {
    const trip = await tx.trip.findUniqueOrThrow({ where: { id: tripId } });
    if (![TripStatus.DRAFT, TripStatus.DISPATCHED].includes(trip.status)) throw new ApiError("Only draft or dispatched trips can be cancelled.");
    if (trip.status === TripStatus.DISPATCHED) {
      await tx.vehicle.update({ where: { id: trip.vehicleId }, data: { status: VehicleStatus.AVAILABLE } });
      await tx.driver.update({ where: { id: trip.driverId }, data: { status: DriverStatus.AVAILABLE } });
    }
    return tx.trip.update({ where: { id: tripId }, data: { status: TripStatus.CANCELLED, cancelledAt: new Date() }, include: { vehicle: true, driver: true } });
  });
}

function tripData(input, partial) {
  const data = {};
  for (const field of ["source", "destination"]) if (!partial || input[field] !== undefined) data[field] = String(required(input[field], field));
  for (const field of ["vehicleId", "driverId"]) if (!partial || input[field] !== undefined) data[field] = id(input[field], field);
  for (const field of ["cargoWeight", "plannedDistance"]) if (!partial || input[field] !== undefined) data[field] = number(input[field], field, { min: 0.01 });
  if (input.revenue !== undefined) data.revenue = number(input.revenue, "revenue");
  return data;
}
