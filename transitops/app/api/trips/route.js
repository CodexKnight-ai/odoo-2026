import { DriverStatus, Role, TripStatus, VehicleStatus } from "@/lib/generated/prisma/client";
import { apiError, authenticate, body, id, json, number, required, toPlain, ApiError } from "@/app/src/lib/api";
import { getTrips, createTrip, updateTrip, dispatchTrip, completeTrip, cancelTrip } from "@/app/src/services/tripService.js";

const tripRoles = [Role.FLEET_MANAGER, Role.DRIVER];

export async function GET(request) {
  try {
    authenticate(request);
    const q = new URL(request.url).searchParams;
    const status = q.get("status");
    if (status && !Object.values(TripStatus).includes(status)) throw new ApiError("status is invalid.");
    
    const trips = await getTrips({ status });
    return json({ trips });
  } catch (error) { return apiError(error); }
}

export async function POST(request) {
  try {
    authenticate(request, tripRoles);
    const input = await body(request);
    const trip = await createTrip(tripData(input, false));
    return json({ trip }, 201);
  } catch (error) { return apiError(error); }
}

export async function PATCH(request) {
  try {
    authenticate(request, tripRoles);
    const input = await body(request);
    const tripId = id(input.id);
    if (input.action === "dispatch") return json({ trip: await dispatchTrip(tripId) });
    if (input.action === "complete") return json({ trip: await completeTrip(tripId, input) });
    if (input.action === "cancel") return json({ trip: await cancelTrip(tripId) });
    if (input.action === "update") {
      const data = tripData(input, true);
      const trip = await updateTrip(tripId, data);
      return json({ trip });
    }
    throw new ApiError("action must be dispatch, complete, cancel, or update.");
  } catch (error) { return apiError(error); }
}

function tripData(input, partial) {
  const data = {};
  for (const field of ["source", "destination"]) if (!partial || input[field] !== undefined) data[field] = String(required(input[field], field));
  for (const field of ["vehicleId", "driverId"]) if (!partial || input[field] !== undefined) data[field] = id(input[field], field);
  for (const field of ["cargoWeight", "plannedDistance"]) if (!partial || input[field] !== undefined) data[field] = number(input[field], field, { min: 0.01 });
  if (input.revenue !== undefined) data.revenue = number(input.revenue, "revenue");
  return data;
}
