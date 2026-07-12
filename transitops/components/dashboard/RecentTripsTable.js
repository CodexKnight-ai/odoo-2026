import { Skeleton } from "@/components/ui/skeleton";

const STATUS_STYLES = {
  "On Trip": "bg-blue-500 text-white",
  Completed: "bg-green-500 text-white",
  Dispatched: "bg-blue-600 text-white",
  Draft: "bg-slate-400 text-white",
  Cancelled: "bg-red-500 text-white",
};

export default function RecentTripsTable({ trips = [], loading }) {
  return (
    <div className="overflow-hidden rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-slate-50 text-left text-xs uppercase text-slate-500">
            <th className="px-4 py-2">Trip</th>
            <th className="px-4 py-2">Vehicle</th>
            <th className="px-4 py-2">Driver</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">ETA</th>
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b">
                  {Array.from({ length: 5 }).map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <Skeleton className="h-4 w-16" />
                    </td>
                  ))}
                </tr>
              ))
            : trips.map((trip) => (
                <tr key={trip.tripId} className="border-b last:border-b-0">
                  <td className="px-4 py-3 font-medium text-slate-700">
                    {trip.tripId}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{trip.vehicle || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{trip.driver || "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        STATUS_STYLES[trip.status] || "bg-slate-300 text-slate-800"
                      }`}
                    >
                      {trip.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{trip.eta || "—"}</td>
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}