import { prisma } from "../lib/db.js";
import { redis } from "../lib/redis.js";
import { toPlain } from "../lib/api.js";

const CACHE_TTL = 300; // 5 minutes in seconds

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

export async function getVehicles(filters = {}) {
  const cacheKey = `vehicles:list:${JSON.stringify(filters)}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return typeof cached === "string" ? JSON.parse(cached) : cached;
    }
  } catch (error) {
    console.error("Redis read error in getVehicles:", error);
  }

  const { status, type, region, search } = filters;

  const vehicles = await prisma.vehicle.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(type ? { type } : {}),
      ...(region ? { region } : {}),
      ...(search ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { registrationNumber: { contains: search, mode: "insensitive" } }
        ]
      } : {})
    },
    orderBy: { createdAt: "desc" },
  });

  const plainVehicles = toPlain(vehicles);

  try {
    await redis.set(cacheKey, JSON.stringify(plainVehicles), { ex: CACHE_TTL });
  } catch (error) {
    console.error("Redis write error in getVehicles:", error);
  }

  return plainVehicles;
}

export async function createVehicle(data) {
  const vehicle = await prisma.vehicle.create({ data });
  await invalidateVehicleCaches();
  return toPlain(vehicle);
}

export async function updateVehicle(id, data) {
  const vehicle = await prisma.vehicle.update({
    where: { id },
    data,
  });
  await invalidateVehicleCaches();
  return toPlain(vehicle);
}

export async function deleteVehicle(id) {
  const vehicle = await prisma.vehicle.delete({
    where: { id },
  });
  await invalidateVehicleCaches();
  return toPlain(vehicle);
}
