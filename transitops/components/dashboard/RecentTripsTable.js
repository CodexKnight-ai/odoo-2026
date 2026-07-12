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
    <div className="overflow-hidden rounded-md border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted text-left text-xs uppercase text-muted-foreground">
            <th className="px-4 py-2">Trip</th>
            <th className="px-4 py-2">Vehicle</th>
            <th className="px-4 py-2">Driver</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  {Array.from({ length: 5 }).map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <Skeleton className="h-4 w-16" />
                    </td>
                  ))}
                </tr>
              ))
            : trips.length === 0
              ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No trips found. Create a trip to get started.
                  </td>
                </tr>
              )
              : trips.map((trip) => (
                <tr key={trip.tripId} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {trip.tripId}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{trip.vehicle || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{trip.driver || "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        STATUS_STYLES[trip.status] || "bg-slate-300 text-slate-800"
                      }`}
                    >
                      {trip.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{trip.eta || "—"}</td>
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}