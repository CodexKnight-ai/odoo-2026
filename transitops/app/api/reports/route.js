import { TripStatus, VehicleStatus } from "@/lib/generated/prisma/client";
import { apiError, authenticate, json, toPlain } from "@/app/src/lib/api";
import { prisma } from "@/app/src/lib/db";

export async function GET(request) {
  try {
    // All authenticated users can view analytics (DRIVER role included)
    authenticate(request);

    const q = new URL(request.url).searchParams;
    const region = q.get("region") || undefined;
    const type = q.get("type") || undefined;

    const whereVehicle = {
      ...(region ? { region } : {}),
      ...(type ? { type } : {}),
    };

    // Fetch vehicles with all related data (ALL trips for revenue, not just COMPLETED)
    const vehicles = await prisma.vehicle.findMany({
      where: whereVehicle,
      include: {
        trips: {
          where: { status: { in: [TripStatus.COMPLETED, TripStatus.DISPATCHED] } },
        },
        fuelLogs: true,
        expenses: true,
        maintenanceLogs: true,
      },
    });

    // Vehicle status distribution
    const counts = await prisma.vehicle.groupBy({
      by: ["status"],
      _count: { _all: true },
      where: whereVehicle,
    });

    // Driver + trip counts
    const driversOnDuty = await prisma.driver.count({ where: { status: "ON_TRIP" } });
    const pendingTrips = await prisma.trip.count({ where: { status: TripStatus.DRAFT } });
    const activeTrips = await prisma.trip.count({ where: { status: TripStatus.DISPATCHED } });

    const byStatus = Object.fromEntries(
      counts.map((entry) => [entry.status, entry._count._all])
    );

    // Per-vehicle metrics
    const vehicleMetrics = vehicles.map((vehicle) => {
      // Only count completed trips for distance & revenue (dispatched trips are in-progress)
      const completedTrips = vehicle.trips.filter((t) => t.status === TripStatus.COMPLETED);
      const distance = completedTrips.reduce(
        (sum, trip) => sum + Number(trip.actualDistance ?? trip.plannedDistance),
        0
      );
      const revenue = completedTrips.reduce((sum, trip) => sum + Number(trip.revenue), 0);

      const fuelLiters = vehicle.fuelLogs.reduce((sum, log) => sum + Number(log.liters), 0);
      const fuelCost = vehicle.fuelLogs.reduce((sum, log) => sum + Number(log.cost), 0);
      const maintenanceCost = vehicle.maintenanceLogs.reduce(
        (sum, log) => sum + Number(log.cost),
        0
      );
      const otherExpenseCost = vehicle.expenses.reduce(
        (sum, expense) => sum + Number(expense.amount),
        0
      );
      const operationalCost = fuelCost + maintenanceCost + otherExpenseCost;

      const acquisitionCost = Number(vehicle.acquisitionCost);
      // ROI = (Revenue - Total Costs) / Acquisition Cost * 100
      // If no acquisition cost recorded, fall back to margin over costs
      const roi =
        acquisitionCost > 0
          ? (revenue - operationalCost) / acquisitionCost
          : operationalCost > 0
          ? (revenue - operationalCost) / operationalCost
          : null;

      return {
        vehicleId: vehicle.id,
        registrationNumber: vehicle.registrationNumber,
        name: vehicle.name,
        acquisitionCost,
        distance,
        fuelLiters,
        fuelEfficiency: fuelLiters > 0 ? distance / fuelLiters : null,
        fuelCost,
        maintenanceCost,
        otherExpenseCost,
        operationalCost,
        revenue,
        roi,
        tripCount: completedTrips.length,
      };
    });

    // KPI aggregations
    const totalVehicles = vehicles.length;
    const activeVehicles = byStatus[VehicleStatus.ON_TRIP] || 0;
    const availableVehicles = byStatus[VehicleStatus.AVAILABLE] || 0;
    const vehiclesInMaintenance = byStatus[VehicleStatus.IN_SHOP] || 0;
    const operationalCost = vehicleMetrics.reduce((sum, m) => sum + m.operationalCost, 0);
    const totalRevenue = vehicleMetrics.reduce((sum, m) => sum + m.revenue, 0);
    const totalAcquisition = vehicleMetrics.reduce((sum, m) => sum + m.acquisitionCost, 0);

    // Fleet utilization: % of vehicles that have dispatched or completed trips
    const vehiclesWithActivity = vehicleMetrics.filter((m) => m.tripCount > 0).length;
    const fleetUtilization = totalVehicles > 0 ? (vehiclesWithActivity / totalVehicles) * 100 : 0;

    // Average fuel efficiency across vehicles that have fuel logs
    const vehiclesWithFuel = vehicleMetrics.filter((m) => m.fuelEfficiency !== null);
    const avgFuelEfficiency =
      vehiclesWithFuel.length > 0
        ? vehiclesWithFuel.reduce((sum, m) => sum + m.fuelEfficiency, 0) / vehiclesWithFuel.length
        : 0;

    return json(
      toPlain({
        kpis: {
          totalVehicles,
          activeVehicles,
          availableVehicles,
          vehiclesInMaintenance,
          activeTrips,
          pendingTrips,
          driversOnDuty,
          fleetUtilization,
          operationalCost,
          totalRevenue,
          totalAcquisition,
          avgFuelEfficiency,
        },
        vehicles: vehicleMetrics,
      })
    );
  } catch (error) {
    return apiError(error);
  }
}
