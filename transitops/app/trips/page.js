"use client";

import { useEffect, useState } from "react";
import { Play, Check, X, AlertCircle, ArrowRight, ShieldAlert, Navigation, User, Truck, Route } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const STATUS_BADGES = {
  DRAFT: "bg-slate-100 text-slate-500 border-slate-200",
  DISPATCHED: "bg-blue-50 text-blue-700 border-blue-200 animate-pulse",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function TripsPage() {
  const user = useAuthStore((s) => s.user);
  const [trips, setTrips] = useState([]);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals / Overlays
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [activeTrip, setActiveTrip] = useState(null);
  const [error, setError] = useState(null);
  const [createSuccess, setCreateSuccess] = useState(false);

  // Forms
  const [createForm, setCreateForm] = useState({
    source: "",
    destination: "",
    vehicleId: "",
    driverId: "",
    cargoWeight: "",
    plannedDistance: "",
    revenue: "0",
  });

  const [completeForm, setCompleteForm] = useState({
    finalOdometer: "",
    actualDistance: "",
    revenue: "",
    addFuelLog: false,
    fuelLiters: "",
    fuelCost: "",
    fuelDate: new Date().toISOString().split("T")[0],
  });

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/trips");
      if (res.ok) {
        const data = await res.json();
        setTrips(data.trips || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchResources = async () => {
    try {
      const [vRes, dRes] = await Promise.all([
        fetch("/api/vehicles?status=AVAILABLE"),
        fetch("/api/drivers?status=AVAILABLE"),
      ]);
      if (vRes.ok) {
        const vData = await vRes.json();
        setAvailableVehicles(vData.vehicles || []);
      }
      if (dRes.ok) {
        const dData = await dRes.json();
        setAvailableDrivers(dData.drivers || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTrips();
    fetchResources();
  }, []);

  const selectedVehicle = availableVehicles.find((v) => v.id === Number(createForm.vehicleId));
  const capacityWarning = selectedVehicle && Number(createForm.cargoWeight) > Number(selectedVehicle.maxLoadCapacity);
  const capacityDiff = selectedVehicle ? Number(createForm.cargoWeight) - Number(selectedVehicle.maxLoadCapacity) : 0;

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setCreateSuccess(false);

    if (capacityWarning) {
      setError(`Capacity exceeded. Dispatch is blocked.`);
      return;
    }

    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to establish trip draft.");
        return;
      }
      setCreateSuccess(true);
      resetCreateForm();
      fetchTrips();
      fetchResources();
    } catch (err) {
      setError("Server connection issue.");
    }
  };

  const handleDispatch = async (tripId) => {
    try {
      const res = await fetch("/api/trips", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: tripId, action: "dispatch" }),
      });
      if (res.ok) {
        fetchTrips();
        fetchResources();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to dispatch.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = async (tripId) => {
    try {
      const res = await fetch("/api/trips", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: tripId, action: "cancel" }),
      });
      if (res.ok) {
        fetchTrips();
        fetchResources();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to cancel.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openCompleteModal = (trip) => {
    setActiveTrip(trip);
    const minOdo = Number(trip.vehicle.odometer);
    setCompleteForm({
      finalOdometer: String(minOdo),
      actualDistance: String(trip.plannedDistance),
      revenue: String(trip.revenue),
      addFuelLog: false,
      fuelLiters: "",
      fuelCost: "",
      fuelDate: new Date().toISOString().split("T")[0],
    });
    setError(null);
    setShowCompleteModal(true);
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const vehicleOdo = Number(activeTrip.vehicle.odometer);
    const finalOdo = Number(completeForm.finalOdometer);
    if (finalOdo < vehicleOdo) {
      setError(`Final odometer cannot be lower than start odometer (${vehicleOdo} km).`);
      return;
    }

    try {
      const payload = {
        id: activeTrip.id,
        action: "complete",
        finalOdometer: finalOdo,
        actualDistance: Number(completeForm.actualDistance),
        revenue: Number(completeForm.revenue),
      };

      if (completeForm.addFuelLog) {
        payload.fuelLiters = Number(completeForm.fuelLiters);
        payload.fuelCost = Number(completeForm.fuelCost);
        payload.fuelDate = completeForm.fuelDate;
      }

      const res = await fetch("/api/trips", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to complete trip.");
        return;
      }
      setShowCompleteModal(false);
      fetchTrips();
      fetchResources();
    } catch (err) {
      setError("Server connection issue.");
    }
  };

  const resetCreateForm = () => {
    setCreateForm({
      source: "",
      destination: "",
      vehicleId: "",
      driverId: "",
      cargoWeight: "",
      plannedDistance: "",
      revenue: "0",
    });
    setError(null);
  };

  const isDriverOrManager = user?.role === "FLEET_MANAGER" || user?.role === "DRIVER";

  return (
    <div className="space-y-6 text-slate-800 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Trip Dispatcher</h1>
        <p className="text-xs text-slate-500 mt-1">
          Plan shipment routes, audit weight allocations, dispatch active rosters, and manage the live operational workflow.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Create Form */}
        <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-slate-50/50 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Plan Shipment Route</h3>
            <Badge variant="secondary" className="text-[9px] bg-amber-500/10 text-amber-700 border-amber-500/20 font-bold uppercase py-0.5 border-none">
              Draft Phase
            </Badge>
          </div>

          <form onSubmit={handleCreateSubmit} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Source Depot</label>
                <Input
                  required
                  placeholder="e.g., Delhi Terminal"
                  value={createForm.source}
                  onChange={(e) => setCreateForm({ ...createForm, source: e.target.value })}
                  className="mt-1 bg-white border-slate-200 text-xs focus:border-slate-300"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Destination Hub</label>
                <Input
                  required
                  placeholder="e.g., Mumbai Dock"
                  value={createForm.destination}
                  onChange={(e) => setCreateForm({ ...createForm, destination: e.target.value })}
                  className="mt-1 bg-white border-slate-200 text-xs focus:border-slate-300"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select Available Asset</label>
              <select
                required
                className="w-full h-8.5 rounded-lg border border-slate-200 bg-white px-3 text-xs focus-visible:outline-none focus-visible:border-slate-300 text-slate-600 mt-1"
                value={createForm.vehicleId}
                onChange={(e) => setCreateForm({ ...createForm, vehicleId: e.target.value })}
              >
                <option value="">Select asset...</option>
                {availableVehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.registrationNumber}) — Max Load: {Number(v.maxLoadCapacity)}kg
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select Available Operator</label>
              <select
                required
                className="w-full h-8.5 rounded-lg border border-slate-200 bg-white px-3 text-xs focus-visible:outline-none focus-visible:border-slate-300 text-slate-600 mt-1"
                value={createForm.driverId}
                onChange={(e) => setCreateForm({ ...createForm, driverId: e.target.value })}
              >
                <option value="">Select operator...</option>
                {availableDrivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} — Compliance Score: {Number(d.safetyScore)}%
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cargo Weight (kg)</label>
                <Input
                  required
                  type="number"
                  min="1"
                  placeholder="e.g., 2500"
                  value={createForm.cargoWeight}
                  onChange={(e) => setCreateForm({ ...createForm, cargoWeight: e.target.value })}
                  className="mt-1 bg-white border-slate-200 text-xs text-right focus:border-slate-300"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Planned Dist (km)</label>
                <Input
                  required
                  type="number"
                  min="1"
                  placeholder="e.g., 850"
                  value={createForm.plannedDistance}
                  onChange={(e) => setCreateForm({ ...createForm, plannedDistance: e.target.value })}
                  className="mt-1 bg-white border-slate-200 text-xs text-right focus:border-slate-300"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Revenue (₹)</label>
                <Input
                  required
                  type="number"
                  min="0"
                  value={createForm.revenue}
                  onChange={(e) => setCreateForm({ ...createForm, revenue: e.target.value })}
                  className="mt-1 bg-white border-slate-200 text-xs text-right focus:border-slate-300"
                />
              </div>
            </div>

            {/* Capacity Warning Box */}
            {capacityWarning && (
              <div className="rounded-lg border border-rose-25 bg-rose-50 p-3 text-xs text-rose-600 space-y-1 animate-in fade-in-0 duration-150">
                <div className="flex items-center gap-1.5 font-bold">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>Capacity Block Warning</span>
                </div>
                <div className="text-[10px] font-medium leading-normal pl-5">
                  Vehicle Max Limit: <span className="font-mono text-slate-700">{Number(selectedVehicle.maxLoadCapacity).toLocaleString()} kg</span>
                  <br />
                  Allocated Payload: <span className="font-mono text-slate-700">{Number(createForm.cargoWeight).toLocaleString()} kg</span>
                  <br />
                  <span className="text-rose-600 font-bold uppercase text-[9px] tracking-wide block mt-1">
                    ❌ Exceeded by {capacityDiff.toLocaleString()} kg — Creation Disabled
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-600 border border-rose-100">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {createSuccess && (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-600 border border-emerald-100">
                <Check className="h-4 w-4 shrink-0" />
                <span>Trip draft established successfully!</span>
              </div>
            )}

            {isDriverOrManager && (
              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={capacityWarning}
                  className="flex-1 bg-amber-400 text-slate-900 hover:bg-amber-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 border-none font-semibold"
                >
                  Save Route Draft
                </Button>
                <Button type="button" variant="outline" onClick={resetCreateForm} className="border-slate-200 hover:bg-slate-50 text-xs">
                  Reset
                </Button>
              </div>
            )}
          </form>
        </div>

        {/* Right Column: Live Board */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Live Dispatch Board</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Operations</span>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {loading ? (
              <p className="text-xs text-slate-400 py-6 text-center">Refreshing live tracking grid...</p>
            ) : trips.length === 0 ? (
              <p className="text-xs text-slate-400 py-12 text-center rounded-xl border border-slate-200 border-dashed">
                No routes logged yet. Create a draft route on the left.
              </p>
            ) : (
              trips.map((t) => {
                return (
                  <div key={t.id} className="rounded-xl border border-slate-200 bg-white p-4 space-y-3.5 hover:border-slate-300 transition-all shadow-xs">
                    {/* Top Row: Trip ID, Status Timeline, Status Badge */}
                    <div className="flex items-center justify-between flex-wrap gap-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-700">T-{String(t.id).padStart(3, "0")}</span>
                        <Badge variant="outline" className={STATUS_BADGES[t.status]}>
                          {t.status}
                        </Badge>
                      </div>

                      {/* Timeline Pipeline visual */}
                      <div className="hidden sm:flex items-center gap-1 text-[9px] font-semibold text-slate-400">
                        <span className={t.status === "DRAFT" ? "text-amber-600 font-bold" : "text-slate-400"}>Draft</span>
                        <ArrowRight className="h-2 w-2" />
                        <span className={t.status === "DISPATCHED" ? "text-blue-600 font-bold" : "text-slate-400"}>Dispatched</span>
                        <ArrowRight className="h-2 w-2" />
                        <span className={t.status === "COMPLETED" ? "text-emerald-600 font-bold" : t.status === "CANCELLED" ? "text-rose-600 font-bold" : "text-slate-400"}>
                          {t.status === "CANCELLED" ? "Cancelled" : "Completed"}
                        </span>
                      </div>
                    </div>

                    {/* Middle Row: Source ➔ Destination */}
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <Navigation className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      <span>{t.source}</span>
                      <ArrowRight className="h-3 w-3 text-slate-400" />
                      <span>{t.destination}</span>
                    </div>

                    {/* Meta information */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-[10px] font-semibold text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Truck className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate" title={t.vehicle.name}>{t.vehicle.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate" title={t.driver.name}>{t.driver.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono">
                        <Route className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{t.actualDistance ? `${Number(t.actualDistance)}km` : `${Number(t.plannedDistance)}km (plan)`}</span>
                      </div>
                      <div className="text-right text-emerald-600 font-bold font-mono">
                        ₹{Number(t.revenue).toLocaleString()}
                      </div>
                    </div>

                    {/* Lower Row: Action Control */}
                    {isDriverOrManager && (t.status === "DRAFT" || t.status === "DISPATCHED") && (
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100 justify-end">
                        {t.status === "DRAFT" && (
                          <>
                            <Button
                              variant="outline"
                              size="xs"
                              className="text-emerald-600 hover:bg-emerald-50 border-emerald-200 text-[10px] h-7"
                              onClick={() => handleDispatch(t.id)}
                            >
                              Dispatch Route
                            </Button>
                            <Button
                              variant="outline"
                              size="xs"
                              className="text-rose-600 hover:bg-rose-50 border-rose-200 text-[10px] h-7"
                              onClick={() => handleCancel(t.id)}
                            >
                              Cancel Draft
                            </Button>
                          </>
                        )}
                        {t.status === "DISPATCHED" && (
                          <>
                            <Button
                              variant="outline"
                              size="xs"
                              className="text-blue-600 hover:bg-blue-50 border-blue-200 text-[10px] h-7"
                              onClick={() => openCompleteModal(t)}
                            >
                              Log Completion
                            </Button>
                            <Button
                              variant="outline"
                              size="xs"
                              className="text-rose-600 hover:bg-rose-50 border-rose-200 text-[10px] h-7"
                              onClick={() => handleCancel(t.id)}
                            >
                              Cancel Trip
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Complete Modal */}
      {showCompleteModal && activeTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl animate-in fade-in-0 zoom-in-95">
            <h2 className="text-sm font-bold text-slate-800">Log Shipment Completion</h2>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Enter final odometer, actual distances, final revenue, and optional fuel entries.
            </p>

            <form onSubmit={handleCompleteSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Final Odometer (km)</label>
                  <Input
                    required
                    type="number"
                    min={Number(activeTrip.vehicle.odometer)}
                    value={completeForm.finalOdometer}
                    onChange={(e) => {
                      const finalVal = Number(e.target.value);
                      const initialVal = Number(activeTrip.vehicle.odometer);
                      const distance = Math.max(0, finalVal - initialVal);
                      setCompleteForm({
                        ...completeForm,
                        finalOdometer: e.target.value,
                        actualDistance: String(distance),
                      });
                    }}
                    className="mt-1 bg-white border-slate-200 text-xs text-right focus:border-slate-300"
                  />
                  <span className="text-[9px] text-slate-400 mt-1 block">
                    Starting: {Number(activeTrip.vehicle.odometer).toLocaleString()} km
                  </span>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Actual Distance (km)</label>
                  <Input
                    required
                    type="number"
                    min="0"
                    value={completeForm.actualDistance}
                    onChange={(e) => setCompleteForm({ ...completeForm, actualDistance: e.target.value })}
                    className="mt-1 bg-white border-slate-200 text-xs text-right focus:border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Final Earned Revenue (₹)</label>
                <Input
                  required
                  type="number"
                  min="0"
                  value={completeForm.revenue}
                  onChange={(e) => setCompleteForm({ ...completeForm, revenue: e.target.value })}
                  className="mt-1 bg-white border-slate-200 text-xs text-right font-mono focus:border-slate-300"
                />
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="addFuelLog"
                    className="rounded border-slate-300 bg-white text-amber-600 focus:ring-amber-500/50 h-3.5 w-3.5"
                    checked={completeForm.addFuelLog}
                    onChange={(e) => setCompleteForm({ ...completeForm, addFuelLog: e.target.checked })}
                  />
                  <label htmlFor="addFuelLog" className="text-xs font-semibold cursor-pointer text-slate-700">
                    Log fuel purchases for this trip?
                  </label>
                </div>

                {completeForm.addFuelLog && (
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200 animate-in slide-in-from-top-1 duration-150">
                    <div>
                      <label className="text-[9px] font-bold text-slate-550 uppercase">Fuel Amount (Liters)</label>
                      <Input
                        required
                        type="number"
                        min="0.1"
                        step="0.01"
                        placeholder="e.g., 120"
                        value={completeForm.fuelLiters}
                        onChange={(e) => setCompleteForm({ ...completeForm, fuelLiters: e.target.value })}
                        className="mt-1 bg-white border-slate-200 text-xs text-right focus:border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-550 uppercase">Fuel Invoice (₹)</label>
                      <Input
                        required
                        type="number"
                        min="1"
                        placeholder="e.g., 11000"
                        value={completeForm.fuelCost}
                        onChange={(e) => setCompleteForm({ ...completeForm, fuelCost: e.target.value })}
                        className="mt-1 bg-white border-slate-200 text-xs text-right focus:border-slate-300"
                      />
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-600 border border-rose-100">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowCompleteModal(false)} className="border-slate-200 hover:bg-slate-50">
                  Cancel
                </Button>
                <Button type="submit" className="bg-amber-400 text-slate-900 hover:bg-amber-500 border-none font-semibold">
                  Mark Completed
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
