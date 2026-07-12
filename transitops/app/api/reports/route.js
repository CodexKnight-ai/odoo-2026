import { Role, TripStatus, VehicleStatus } from "@/lib/generated/prisma/client";
import { apiError, authenticate, json, toPlain } from "@/app/src/lib/api";
import { prisma } from "@/app/src/lib/db";

export async function GET(request) {
  try {
    authenticate(request, [Role.FLEET_MANAGER, Role.FINANCIAL_ANALYST, Role.SAFETY_OFFICER]);
    const q = new URL(request.url).searchParams;
    const region = q.get("region") || undefined;
    const type = q.get("type") || undefined;
    const vehicles = await prisma.vehicle.findMany({ where: { ...(region ? { region } : {}), ...(type ? { type } : {}) }, include: { trips: { where: { status: TripStatus.COMPLETED } }, fuelLogs: true, expenses: true, maintenanceLogs: true } });
    const counts = await prisma.vehicle.groupBy({ by: ["status"], _count: { _all: true }, where: { ...(region ? { region } : {}), ...(type ? { type } : {}) } });
    const driversOnDuty = await prisma.driver.count({ where: { status: "ON_TRIP" } });
    const pendingTrips = await prisma.trip.count({ where: { status: TripStatus.DRAFT } });
    const activeTrips = await prisma.trip.count({ where: { status: TripStatus.DISPATCHED } });
    const byStatus = Object.fromEntries(counts.map((entry) => [entry.status, entry._count._all]));
    const vehicleMetrics = vehicles.map((vehicle) => {
      const distance = vehicle.trips.reduce((sum, trip) => sum + Number(trip.actualDistance || trip.plannedDistance), 0);
      const fuelLiters = vehicle.fuelLogs.reduce((sum, log) => sum + Number(log.liters), 0);
      const fuelCost = vehicle.fuelLogs.reduce((sum, log) => sum + Number(log.cost), 0);
      const maintenanceCost = vehicle.maintenanceLogs.reduce((sum, log) => sum + Number(log.cost), 0);
      const otherExpenseCost = vehicle.expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
      const revenue = vehicle.trips.reduce((sum, trip) => sum + Number(trip.revenue), 0);
      return { vehicleId: vehicle.id, registrationNumber: vehicle.registrationNumber, name: vehicle.name, distance, fuelLiters, fuelEfficiency: fuelLiters ? distance / fuelLiters : null, fuelCost, maintenanceCost, otherExpenseCost, operationalCost: fuelCost + maintenanceCost + otherExpenseCost, revenue, roi: Number(vehicle.acquisitionCost) ? (revenue - fuelCost - maintenanceCost) / Number(vehicle.acquisitionCost) : null };
    });
    const operationalCost = vehicleMetrics.reduce((sum, metric) => sum + metric.operationalCost, 0);
    const totalVehicles = vehicles.length;
    const activeVehicles = byStatus[VehicleStatus.ON_TRIP] || 0;
    return json(toPlain({ kpis: { totalVehicles, activeVehicles, availableVehicles: byStatus[VehicleStatus.AVAILABLE] || 0, vehiclesInMaintenance: byStatus[VehicleStatus.IN_SHOP] || 0, activeTrips, pendingTrips, driversOnDuty, fleetUtilization: totalVehicles ? (activeVehicles / totalVehicles) * 100 : 0, operationalCost }, vehicles: vehicleMetrics }));
  } catch (error) { return apiError(error); }
}
