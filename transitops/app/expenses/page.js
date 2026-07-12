"use client";

import { useEffect, useState } from "react";
import { Plus, Search, AlertCircle, Fuel, Coins, Tag } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function ExpensesPage() {
  const user = useAuthStore((s) => s.user);

  // Lists
  const [fuelLogs, setFuelLogs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showFuelModal, setShowFuelModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [error, setError] = useState(null);

  // Fuel Form
  const [fuelForm, setFuelForm] = useState({
    vehicleId: "",
    tripId: "",
    liters: "",
    cost: "",
    date: new Date().toISOString().split("T")[0],
    odometer: "",
  });

  // Expense Form
  const [expenseForm, setExpenseForm] = useState({
    vehicleId: "",
    tripId: "",
    type: "TOLL",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fuelRes, expRes, vehRes, tripRes] = await Promise.all([
        fetch("/api/fuel"),
        fetch("/api/expenses"),
        fetch("/api/vehicles"),
        fetch("/api/trips"),
      ]);

      if (fuelRes.ok) {
        const fuelData = await fuelRes.json();
        setFuelLogs(fuelData.fuelLogs || []);
      }
      if (expRes.ok) {
        const expData = await expRes.json();
        setExpenses(expData.expenses || []);
      }
      if (vehRes.ok) {
        const vehData = await vehRes.json();
        setVehicles(vehData.vehicles || []);
      }
      if (tripRes.ok) {
        const tripData = await tripRes.json();
        setTrips(tripData.trips || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute stats
  const totalFuelSpend = fuelLogs.reduce((sum, log) => sum + Number(log.cost), 0);
  const totalIncidentalSpend = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const totalOperationalCost = totalFuelSpend + totalIncidentalSpend;

  const handleFuelSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const payload = {
        vehicleId: Number(fuelForm.vehicleId),
        liters: Number(fuelForm.liters),
        cost: Number(fuelForm.cost),
        date: fuelForm.date,
      };
      if (fuelForm.tripId) payload.tripId = Number(fuelForm.tripId);
      if (fuelForm.odometer) payload.odometer = Number(fuelForm.odometer);

      const res = await fetch("/api/fuel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to log fuel entry.");
        return;
      }
      setShowFuelModal(false);
      resetFuelForm();
      fetchData();
    } catch (err) {
      setError("Server connection issue.");
    }
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const payload = {
        vehicleId: Number(expenseForm.vehicleId),
        type: expenseForm.type,
        amount: Number(expenseForm.amount),
        date: expenseForm.date,
        description: expenseForm.description,
      };
      if (expenseForm.tripId) payload.tripId = Number(expenseForm.tripId);

      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to add expense.");
        return;
      }
      setShowExpenseModal(false);
      resetExpenseForm();
      fetchData();
    } catch (err) {
      setError("Server connection issue.");
    }
  };

  const resetFuelForm = () => {
    setFuelForm({
      vehicleId: "",
      tripId: "",
      liters: "",
      cost: "",
      date: new Date().toISOString().split("T")[0],
      odometer: "",
    });
    setError(null);
  };

  const resetExpenseForm = () => {
    setExpenseForm({
      vehicleId: "",
      tripId: "",
      type: "TOLL",
      amount: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    });
    setError(null);
  };

  const openFuelModal = () => {
    resetFuelForm();
    setShowFuelModal(true);
  };

  const openExpenseModal = () => {
    resetExpenseForm();
    setShowExpenseModal(true);
  };

  const isFinancialOrManager = user?.role === "FLEET_MANAGER" || user?.role === "FINANCIAL_ANALYST" || user?.role === "DRIVER";

  return (
    <div className="space-y-6 text-slate-800 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Expenses & Cost Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Log diesel fill-ups, track highway toll tickets, parkings, and compile total fleet operational costs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={openFuelModal} className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs h-8.5 font-semibold">
            <Fuel className="mr-1.5 h-3.5 w-3.5" /> Log Fuel Refill
          </Button>
          {isFinancialOrManager && (
            <Button onClick={openExpenseModal} className="bg-amber-400 text-slate-900 hover:bg-amber-500 border-none text-xs h-8.5 font-semibold">
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Incidentals
            </Button>
          )}
        </div>
      </div>

      {/* Unified Financial Summary Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-455 text-slate-400 uppercase tracking-widest block">Fuel Spend</span>
          <div className="text-xl font-bold font-mono text-slate-800">₹{totalFuelSpend.toLocaleString()}</div>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-455 text-slate-400 uppercase tracking-widest block">Tolls & Incidentals</span>
          <div className="text-xl font-bold font-mono text-slate-800">₹{totalIncidentalSpend.toLocaleString()}</div>
        </div>
        <div className="space-y-1 bg-amber-50 rounded-lg p-3 border border-amber-100">
          <span className="text-[10px] font-bold text-amber-850 text-amber-700 uppercase tracking-widest block">Total Operational Cost</span>
          <div className="text-xl font-bold font-mono text-amber-700">₹{totalOperationalCost.toLocaleString()}</div>
        </div>
      </div>

      {/* Stacked Layout Panel 1: Fuel Logs */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/75 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Fuel className="h-4 w-4 text-slate-400" /> Fuel Transaction Registry
          </h3>
          <span className="text-[10px] text-slate-400 font-semibold uppercase">{fuelLogs.length} Entries</span>
        </div>
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50/20">
              <th className="px-5 py-3">Asset Registration</th>
              <th className="px-5 py-3">Associated Trip</th>
              <th className="px-5 py-3">Refill Date</th>
              <th className="px-5 py-3 text-right">Liters Amount</th>
              <th className="px-5 py-3 text-right">Odometer At log</th>
              <th className="px-5 py-3 text-right">Fuel Bill Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-center text-slate-400">
                  Retrieving fuel registry...
                </td>
              </tr>
            ) : fuelLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                  No fuel transactions logged.
                </td>
              </tr>
            ) : (
              fuelLogs.slice(0, 5).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3 font-semibold">
                    <div>{log.vehicle.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{log.vehicle.registrationNumber}</div>
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {log.trip ? `T-${String(log.trip.id).padStart(3, "0")} (${log.trip.source} ➔ ${log.trip.destination})` : "Manual Log"}
                  </td>
                  <td className="px-5 py-3 text-slate-550 text-slate-500 font-mono">
                    {new Date(log.date).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 text-right font-mono text-slate-600">{Number(log.liters).toFixed(2)} L</td>
                  <td className="px-5 py-3 text-right font-mono text-slate-500">{log.odometer ? `${Number(log.odometer).toLocaleString()} km` : "—"}</td>
                  <td className="px-5 py-3 text-right font-mono text-emerald-600 font-bold">
                    ₹{Number(log.cost).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Stacked Layout Panel 2: Incidentals & Tolls */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/75 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Coins className="h-4 w-4 text-slate-400" /> Other Expenses (Toll / Parking / Repairs)
          </h3>
          <span className="text-[10px] text-slate-400 font-semibold uppercase">{expenses.length} Records</span>
        </div>
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50/20">
              <th className="px-5 py-3">Asset Registry</th>
              <th className="px-5 py-3">Incidental Category</th>
              <th className="px-5 py-3">Linked workflow</th>
              <th className="px-5 py-3">Expense Date</th>
              <th className="px-5 py-3">Billing Remarks</th>
              <th className="px-5 py-3 text-right">Cost Invoice</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-center text-slate-400">
                  Retrieving incidentals...
                </td>
              </tr>
            ) : expenses.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                  No incidental expenses recorded.
                </td>
              </tr>
            ) : (
              expenses.slice(0, 5).map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3 font-semibold">
                    <div>{e.vehicle.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{e.vehicle.registrationNumber}</div>
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-slate-200 text-[10px] font-bold py-0.5 border-none">
                      {e.type}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {e.trip ? `T-${String(e.trip.id).padStart(3, "0")} (${e.trip.source} ➔ ${e.trip.destination})` : "General"}
                  </td>
                  <td className="px-5 py-3 text-slate-550 text-slate-500 font-mono">
                    {new Date(e.date).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 text-slate-500 max-w-xs truncate" title={e.description}>
                    {e.description || "—"}
                  </td>
                  <td className="px-5 py-3 text-right font-mono text-emerald-600 font-bold">
                    ₹{Number(e.amount).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Log Fuel Modal */}
      {showFuelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl animate-in fade-in-0 zoom-in-95">
            <h2 className="text-sm font-bold text-slate-800">Log Fuel Receipt</h2>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Submit fuel purchase audits to calculate dynamic km/L metrics.
            </p>

            <form onSubmit={handleFuelSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select Asset</label>
                <select
                  required
                  className="w-full h-8.5 rounded-lg border border-slate-200 bg-white px-3 text-xs focus-visible:outline-none focus-visible:border-slate-300 text-slate-600 mt-1"
                  value={fuelForm.vehicleId}
                  onChange={(e) => setFuelForm({ ...fuelForm, vehicleId: e.target.value })}
                >
                  <option value="">Choose asset...</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.registrationNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Associated Workflow / Trip (Optional)</label>
                <select
                  className="w-full h-8.5 rounded-lg border border-slate-200 bg-white px-3 text-xs focus-visible:outline-none focus-visible:border-slate-300 text-slate-600 mt-1"
                  value={fuelForm.tripId}
                  onChange={(e) => setFuelForm({ ...fuelForm, tripId: e.target.value })}
                >
                  <option value="">No trip association</option>
                  {trips.map((t) => (
                    <option key={t.id} value={t.id}>
                      T-{String(t.id).padStart(3, "0")} ({t.source} ➔ {t.destination})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Liters Amount</label>
                  <Input
                    required
                    type="number"
                    min="0.1"
                    step="0.01"
                    placeholder="e.g., 85"
                    value={fuelForm.liters}
                    onChange={(e) => setFuelForm({ ...fuelForm, liters: e.target.value })}
                    className="mt-1 bg-white border-slate-200 text-xs text-right focus:border-slate-300"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fuel Cost Bill (₹)</label>
                  <Input
                    required
                    type="number"
                    min="1"
                    placeholder="e.g., 8000"
                    value={fuelForm.cost}
                    onChange={(e) => setFuelForm({ ...fuelForm, cost: e.target.value })}
                    className="mt-1 bg-white border-slate-200 text-xs text-right focus:border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Refill Date</label>
                  <Input
                    required
                    type="date"
                    value={fuelForm.date}
                    onChange={(e) => setFuelForm({ ...fuelForm, date: e.target.value })}
                    className="mt-1 bg-white border-slate-200 text-xs focus:border-slate-300"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Odometer Reading (Optional)</label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="e.g., 45000"
                    value={fuelForm.odometer}
                    onChange={(e) => setFuelForm({ ...fuelForm, odometer: e.target.value })}
                    className="mt-1 bg-white border-slate-200 text-xs text-right focus:border-slate-300"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-600 border border-rose-100">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowFuelModal(false)} className="border-slate-200 hover:bg-slate-50">
                  Cancel
                </Button>
                <Button type="submit" className="bg-amber-400 text-slate-900 hover:bg-amber-500 border-none font-semibold">
                  Log Fuel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl animate-in fade-in-0 zoom-in-95">
            <h2 className="text-sm font-bold text-slate-800">Log Incidental Bill</h2>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Enter operational costs like highway tolls or parking tickets.
            </p>

            <form onSubmit={handleExpenseSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select Asset</label>
                <select
                  required
                  className="w-full h-8.5 rounded-lg border border-slate-200 bg-white px-3 text-xs focus-visible:outline-none focus-visible:border-slate-300 text-slate-600 mt-1"
                  value={expenseForm.vehicleId}
                  onChange={(e) => setExpenseForm({ ...expenseForm, vehicleId: e.target.value })}
                >
                  <option value="">Choose asset...</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.registrationNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Expense Category</label>
                  <select
                    className="w-full h-8.5 rounded-lg border border-slate-200 bg-white px-3 text-xs focus-visible:outline-none focus-visible:border-slate-300 text-slate-600 mt-1"
                    value={expenseForm.type}
                    onChange={(e) => setExpenseForm({ ...expenseForm, type: e.target.value })}
                  >
                    <option value="TOLL">Toll</option>
                    <option value="PARKING">Parking</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Invoice Date</label>
                  <Input
                    required
                    type="date"
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    className="mt-1 bg-white border-slate-200 text-xs focus:border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Linked Trip (Optional)</label>
                  <select
                    className="w-full h-8.5 rounded-lg border border-slate-200 bg-white px-3 text-xs focus-visible:outline-none focus-visible:border-slate-300 text-slate-600 mt-1"
                    value={expenseForm.tripId}
                    onChange={(e) => setExpenseForm({ ...expenseForm, tripId: e.target.value })}
                  >
                    <option value="">No trip association</option>
                    {trips.map((t) => (
                      <option key={t.id} value={t.id}>
                        T-{String(t.id).padStart(3, "0")} ({t.source} ➔ {t.destination})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cost Value (₹)</label>
                  <Input
                    required
                    type="number"
                    min="1"
                    placeholder="e.g., 450"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    className="mt-1 bg-white border-slate-200 text-xs text-right font-mono focus:border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Billing Remarks / Description</label>
                <Input
                  placeholder="e.g., Toll receipt ticket or parking ticket number..."
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="mt-1 bg-white border-slate-200 text-xs focus:border-slate-300"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-600 border border-rose-100">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowExpenseModal(false)} className="border-slate-200 hover:bg-slate-50">
                  Cancel
                </Button>
                <Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700">
                  Save Incidental
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
