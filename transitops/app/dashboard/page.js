"use client";

import { useEffect, useState } from "react";
import KpiCard from "@/components/cards/KpiCard";
import RecentTripsTable from "@/components/dashboard/RecentTripsTable";
import VehicleStatusBar from "@/components/dashboard/VehicleStatusBar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFilterStore } from "@/store/filterStore";

const EMPTY_KPIS = {
  totalVehicles: 0,
  activeVehicles: 0,
  availableVehicles: 0,
  vehiclesInMaintenance: 0,
  activeTrips: 0,
  pendingTrips: 0,
  driversOnDuty: 0,
  fleetUtilization: 0,
  operationalCost: 0,
};

const FILTER_OPTIONS = {
  vehicleType: ["All", "Truck", "Van", "Mini"],
  status: ["All", "Available", "On Trip", "In Shop", "Retired"],
  region: ["All", "North", "South", "East", "West"],
};

export default function DashboardPage() {
  const { vehicleType, status, region, setFilter } = useFilterStore();
  const [kpis, setKpis] = useState(EMPTY_KPIS);
  const [vehicleStatus, setVehicleStatus] = useState({ available: 0, onTrip: 0, inShop: 0, retired: 0 });
  const [recentTrips, setRecentTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch dashboard/reports data
        const params = new URLSearchParams();
        if (region !== "All") params.set("region", region);
        if (vehicleType !== "All") params.set("type", vehicleType);

        const [dashRes, tripsRes] = await Promise.all([
          fetch(`/api/dashboard?${params.toString()}`),
          fetch("/api/trips"),
        ]);

        if (dashRes.ok) {
          const dashData = await dashRes.json();
          setKpis(dashData.kpis || EMPTY_KPIS);

          // Calculate vehicle status distribution for the bar chart
          const total = dashData.kpis?.totalVehicles || 1;
          setVehicleStatus({
            available: Math.round(((dashData.kpis?.availableVehicles || 0) / total) * 100),
            onTrip: Math.round(((dashData.kpis?.activeVehicles || 0) / total) * 100),
            inShop: Math.round(((dashData.kpis?.vehiclesInMaintenance || 0) / total) * 100),
            retired: Math.max(0, 100 - Math.round(((dashData.kpis?.availableVehicles || 0) / total) * 100) - Math.round(((dashData.kpis?.activeVehicles || 0) / total) * 100) - Math.round(((dashData.kpis?.vehiclesInMaintenance || 0) / total) * 100)),
          });
        }

        if (tripsRes.ok) {
          const tripsData = await tripsRes.json();
          // Map trips to the table format, take latest 5
          const mapped = (tripsData.trips || []).slice(0, 5).map((trip) => ({
            tripId: `T-${String(trip.id).padStart(3, "0")}`,
            vehicle: trip.vehicle?.name || trip.vehicle?.registrationNumber || "—",
            driver: trip.driver?.name || "—",
            status: trip.status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            eta: trip.completedAt
              ? new Date(trip.completedAt).toLocaleDateString()
              : trip.dispatchedAt
                ? "In Transit"
                : "—",
          }));
          setRecentTrips(mapped);
        }
      } catch (err) {
        // Graceful fallback — UI stays with empty state
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [vehicleType, status, region]);

  return (
    <>
      {/* Filters */}
      <div className="mb-4">
        <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">Filters</p>
        <div className="flex flex-wrap gap-3">
          <Select value={vehicleType} onValueChange={(v) => setFilter("vehicleType", v)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Vehicle Type" />
            </SelectTrigger>
            <SelectContent>
              {FILTER_OPTIONS.vehicleType.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  Vehicle Type: {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={(v) => setFilter("status", v)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {FILTER_OPTIONS.status.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  Status: {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={region} onValueChange={(v) => setFilter("region", v)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              {FILTER_OPTIONS.region.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  Region: {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mb-6 flex flex-wrap gap-3">
        <KpiCard label="Total Vehicles" value={kpis.totalVehicles} accentColor="blue" loading={loading} />
        <KpiCard label="Available" value={kpis.availableVehicles} accentColor="green" loading={loading} />
        <KpiCard label="In Maintenance" value={String(kpis.vehiclesInMaintenance).padStart(2, "0")} accentColor="orange" loading={loading} />
        <KpiCard label="Active Trips" value={kpis.activeTrips} accentColor="blue" loading={loading} />
        <KpiCard label="Pending Trips" value={String(kpis.pendingTrips).padStart(2, "0")} accentColor="blue" loading={loading} />
        <KpiCard label="Drivers On Duty" value={kpis.driversOnDuty} accentColor="blue" loading={loading} />
        <KpiCard label="Fleet Utilization" value={`${Math.round(kpis.fleetUtilization)}%`} accentColor="green" loading={loading} />
      </div>

      {/* Recent Trips + Vehicle Status */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[65%_35%]">
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase text-muted-foreground">
            Recent Trips
          </h2>
          <RecentTripsTable trips={recentTrips} loading={loading} />
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase text-muted-foreground">
            Vehicle Status
          </h2>
          <div className="rounded-md border bg-card p-4">
            <VehicleStatusBar label="Available" value={vehicleStatus.available} color="green" />
            <VehicleStatusBar label="On Trip" value={vehicleStatus.onTrip} color="blue" />
            <VehicleStatusBar label="In Shop" value={vehicleStatus.inShop} color="orange" />
            <VehicleStatusBar label="Retired" value={vehicleStatus.retired} color="red" />
          </div>
        </div>
      </div>
    </>
  );
}