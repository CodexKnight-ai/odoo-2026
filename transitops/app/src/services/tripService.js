import { prisma } from "../lib/db.js";
import { redis } from "../lib/redis.js";
import { toPlain, ApiError } from "../lib/api.js";
import { DriverStatus, TripStatus, VehicleStatus } from "../../../lib/generated/prisma/client.js";

const CACHE_TTL = 300; // 5 minutes in seconds

async function invalidateTripCaches() {
  try {
    const keys = await redis.keys("trips:list:*");
    if (keys && keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error("Failed to invalidate trip cache:", error);
  }
}

async function invalidateVehicleCaches() {
  try {
    const keys = await redis.keys("vehicles:list:*");
    if (keys && keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error("Failed to invalidate vehicle cache:", error);
  }
}

export async function getTrips(filters = {}) {
  const cacheKey = `trips:list:${JSON.stringify(filters)}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return typeof cached === "string" ? JSON.parse(cached) : cached;
    }
  } catch (error) {
    console.error("Redis read error in getTrips:", error);
  }

  const { status } = filters;
  const trips = await prisma.trip.findMany({
    where: status ? { status } : {},
    include: {
      vehicle: true,
      driver: true,
      fuelLogs: true,
      expenses: true
    },
    orderBy: { createdAt: "desc" }
  });

  const plainTrips = toPlain(trips);

  try {
    await redis.set(cacheKey, JSON.stringify(plainTrips), { ex: CACHE_TTL });
  } catch (error) {
    console.error("Redis write error in getTrips:", error);
  }

  return plainTrips;
}

export async function createTrip(data) {
  const vehicleId = Number(data.vehicleId);
  const driverId = Number(data.driverId);
  const cargoWeight = Number(data.cargoWeight);

  const [vehicle, driver] = await Promise.all([
    prisma.vehicle.findUniqueOrThrow({ where: { id: vehicleId } }),
    prisma.driver.findUniqueOrThrow({ where: { id: driverId } })
  ]);

  if (cargoWeight > Number(vehicle.maxLoadCapacity)) {
    throw new ApiError("Cargo weight exceeds the vehicle's maximum load capacity.");
  }
  if (new Date(driver.licenseExpiryDate) <= new Date()) {
    throw new ApiError("The selected driver's license has expired.");
  }

  const trip = await prisma.trip.create({
    data,
    include: { vehicle: true, driver: true }
  });

  await invalidateTripCaches();
  return toPlain(trip);
}

export async function updateTrip(tripId, data) {
  const existing = await prisma.trip.findUniqueOrThrow({ where: { id: tripId } });
  if (existing.status !== TripStatus.DRAFT) {
    throw new ApiError("Only draft trips can be edited.");
  }

  if (data.vehicleId !== undefined || data.cargoWeight !== undefined) {
    const vehicle = await prisma.vehicle.findUniqueOrThrow({
      where: { id: Number(data.vehicleId ?? existing.vehicleId) }
    });
    if (Number(data.cargoWeight ?? existing.cargoWeight) > Number(vehicle.maxLoadCapacity)) {
      throw new ApiError("Cargo weight exceeds the vehicle's maximum load capacity.");
    }
  }

  const trip = await prisma.trip.update({
    where: { id: tripId },
    data,
    include: { vehicle: true, driver: true }
  });

  await invalidateTripCaches();
  return toPlain(trip);
}

export async function dispatchTrip(tripId) {
  const trip = await prisma.$transaction(async (tx) => {
    const existing = await tx.trip.findUniqueOrThrow({
      where: { id: tripId },
      include: { vehicle: true, driver: true }
    });

    if (existing.status !== TripStatus.DRAFT) {
      throw new ApiError("Only draft trips can be dispatched.");
    }
    if (existing.vehicle.status !== VehicleStatus.AVAILABLE) {
      throw new ApiError("The selected vehicle is not available for dispatch.");
    }
    if (existing.driver.status !== DriverStatus.AVAILABLE || new Date(existing.driver.licenseExpiryDate) <= new Date()) {
      throw new ApiError("The selected driver is not eligible for dispatch.");
    }
    if (Number(existing.cargoWeight) > Number(existing.vehicle.maxLoadCapacity)) {
      throw new ApiError("Cargo weight exceeds the vehicle's maximum load capacity.");
    }

    await tx.vehicle.update({
      where: { id: existing.vehicleId },
      data: { status: VehicleStatus.ON_TRIP }
    });

    await tx.driver.update({
      where: { id: existing.driverId },
      data: { status: DriverStatus.ON_TRIP }
    });

    return tx.trip.update({
      where: { id: tripId },
      data: { status: TripStatus.DISPATCHED, dispatchedAt: new Date() },
      include: { vehicle: true, driver: true }
    });
  });

  await Promise.all([invalidateTripCaches(), invalidateVehicleCaches()]);
  return toPlain(trip);
}

export async function completeTrip(tripId, input) {
  const trip = await prisma.$transaction(async (tx) => {
    const existing = await tx.trip.findUniqueOrThrow({
      where: { id: tripId },
      include: { vehicle: true }
    });

    if (existing.status !== TripStatus.DISPATCHED) {
      throw new ApiError("Only dispatched trips can be completed.");
    }

    const finalOdometer = Number(input.finalOdometer);
    if (finalOdometer < Number(existing.vehicle.odometer)) {
      throw new ApiError("finalOdometer cannot be lower than the vehicle's current odometer.");
    }

    const actualDistance = input.actualDistance !== undefined && input.actualDistance !== null
      ? Number(input.actualDistance)
      : finalOdometer - Number(existing.vehicle.odometer);

    const updated = await tx.trip.update({
      where: { id: tripId },
      data: {
        status: TripStatus.COMPLETED,
        completedAt: new Date(),
        finalOdometer,
        actualDistance,
        ...(input.revenue !== undefined ? { revenue: Number(input.revenue) } : {})
      }
    });

    await tx.vehicle.update({
      where: { id: existing.vehicleId },
      data: { status: VehicleStatus.AVAILABLE, odometer: finalOdometer }
    });

    await tx.driver.update({
      where: { id: existing.driverId },
      data: { status: DriverStatus.AVAILABLE }
    });

    if (input.fuelLiters !== undefined) {
      await tx.fuelLog.create({
        data: {
          vehicleId: existing.vehicleId,
          tripId,
          liters: Number(input.fuelLiters),
          cost: Number(input.fuelCost),
          date: input.fuelDate ? new Date(input.fuelDate) : new Date(),
          odometer: finalOdometer
        }
      });
    }

    return tx.trip.findUniqueOrThrow({
      where: { id: updated.id },
      include: { vehicle: true, driver: true, fuelLogs: true }
    });
  });

  await Promise.all([invalidateTripCaches(), invalidateVehicleCaches()]);
  return toPlain(trip);
}

export async function cancelTrip(tripId) {
  const trip = await prisma.$transaction(async (tx) => {
    const existing = await tx.trip.findUniqueOrThrow({ where: { id: tripId } });
    if (![TripStatus.DRAFT, TripStatus.DISPATCHED].includes(existing.status)) {
      throw new ApiError("Only draft or dispatched trips can be cancelled.");
    }

    if (existing.status === TripStatus.DISPATCHED) {
      await tx.vehicle.update({
        where: { id: existing.vehicleId },
        data: { status: VehicleStatus.AVAILABLE }
      });
      await tx.driver.update({
        where: { id: existing.driverId },
        data: { status: DriverStatus.AVAILABLE }
      });
    }

    return tx.trip.update({
      where: { id: tripId },
      data: { status: TripStatus.CANCELLED, cancelledAt: new Date() },
      include: { vehicle: true, driver: true }
    });
  });

  await Promise.all([invalidateTripCaches(), invalidateVehicleCaches()]);
  return toPlain(trip);
}
