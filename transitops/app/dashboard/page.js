"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
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

const MOCK_DATA = {
  kpis: {
    activeVehicles: 0,
    availableVehicles: 0,
    inMaintenance: 0,
    activeTrips: 0,
    pendingTrips: 0,
    driversOnDuty: 0,
    fleetUtilization: 0,
  },
  recentTrips: [],
  vehicleStatus: { available: 0, onTrip: 0, inShop: 0, retired: 0 },
};

const FILTER_OPTIONS = {
  vehicleType: ["All", "Truck", "Van", "Mini"],
  status: ["All", "Available", "On Trip", "In Shop", "Retired"],
  region: ["All", "North", "South", "East", "West"],
};

export default function DashboardPage() {
  const { vehicleType, status, region, setFilter } = useFilterStore();
  const [data, setData] = useState(MOCK_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ vehicleType, status, region });
        const res = await fetch(`/api/dashboard?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch dashboard data");
        const json = await res.json();
        setData(json);
      } catch (err) {
        // Fall back to mock data so the UI still looks complete
        setData(MOCK_DATA);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [vehicleType, status, region]);

  const { kpis, recentTrips, vehicleStatus } = data;

  return (
    <AppShell>
      {/* Filters */}
      <div className="mb-4">
        <p className="mb-2 text-xs font-medium uppercase text-slate-500">Filters</p>
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
        <KpiCard label="Active Vehicles" value={kpis.activeVehicles} accentColor="blue" loading={loading} />
        <KpiCard label="Available Vehicles" value={kpis.availableVehicles} accentColor="green" loading={loading} />
        <KpiCard label="Vehicles in Maintenance" value={String(kpis.inMaintenance).padStart(2, "0")} accentColor="orange" loading={loading} />
        <KpiCard label="Active Trips" value={kpis.activeTrips} accentColor="blue" loading={loading} />
        <KpiCard label="Pending Trips" value={String(kpis.pendingTrips).padStart(2, "0")} accentColor="blue" loading={loading} />
        <KpiCard label="Drivers On Duty" value={kpis.driversOnDuty} accentColor="blue" loading={loading} />
        <KpiCard label="Fleet Utilization" value={`${kpis.fleetUtilization}%`} accentColor="green" loading={loading} />
      </div>

      {/* Recent Trips + Vehicle Status */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[65%_35%]">
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase text-slate-600">
            Recent Trips
          </h2>
          <RecentTripsTable trips={recentTrips} loading={loading} />
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase text-slate-600">
            Vehicle Status
          </h2>
          <div className="rounded-md border bg-white p-4">
            <VehicleStatusBar label="Available" value={vehicleStatus.available} color="green" />
            <VehicleStatusBar label="On Trip" value={vehicleStatus.onTrip} color="blue" />
            <VehicleStatusBar label="In Shop" value={vehicleStatus.inShop} color="orange" />
            <VehicleStatusBar label="Retired" value={vehicleStatus.retired} color="red" />
          </div>
        </div>
      </div>
    </AppShell>
  );
}