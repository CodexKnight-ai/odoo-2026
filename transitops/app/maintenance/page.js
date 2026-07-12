"use client";

import { useEffect, useState } from "react";
import { Plus, Check, Play, X, AlertCircle, ClipboardList } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const STATUS_BADGES = {
  OPEN: "bg-slate-100 text-slate-500 border-slate-200",
  IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function MaintenancePage() {
  const user = useAuthStore((s) => s.user);
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");

  // Modals / Overlays
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [activeLog, setActiveLog] = useState(null);
  const [error, setError] = useState(null);
  const [createSuccess, setCreateSuccess] = useState(false);

  // Forms
  const [createForm, setCreateForm] = useState({
    vehicleId: "",
    description: "",
    cost: "0",
    scheduledAt: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [completeForm, setCompleteForm] = useState({
    cost: "",
    notes: "",
    status: "COMPLETED",
  });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (statusFilter !== "All") q.set("status", statusFilter);
      const res = await fetch(`/api/maintenance?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.maintenanceLogs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const res = await fetch("/api/vehicles");
      if (res.ok) {
        const data = await res.json();
        const filtered = (data.vehicles || []).filter((v) => v.status !== "RETIRED" && v.status !== "ON_TRIP");
        setVehicles(filtered);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchVehicles();
  }, [statusFilter]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setCreateSuccess(false);
    try {
      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...createForm,
          cost: Number(createForm.cost),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create maintenance log.");
        return;
      }
      setCreateSuccess(true);
      resetCreateForm();
      fetchLogs();
      fetchVehicles();
    } catch (err) {
      setError("Server connection issue.");
    }
  };

  const handleStatusChange = async (logId, status) => {
    try {
      const res = await fetch("/api/maintenance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: logId, status }),
      });
      if (res.ok) {
        fetchLogs();
        fetchVehicles();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update status.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openCompleteModal = (log) => {
    setActiveLog(log);
    setCompleteForm({
      cost: String(log.cost),
      notes: log.notes || "",
      status: "COMPLETED",
    });
    setError(null);
    setShowCompleteModal(true);
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/maintenance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeLog.id,
          status: completeForm.status,
          cost: Number(completeForm.cost),
          notes: completeForm.notes,
          completedAt: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update log.");
        return;
      }
      setShowCompleteModal(false);
      fetchLogs();
      fetchVehicles();
    } catch (err) {
      setError("Server connection issue.");
    }
  };

  const resetCreateForm = () => {
    setCreateForm({
      vehicleId: "",
      description: "",
      cost: "0",
      scheduledAt: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setError(null);
  };

  const isManager = user?.role === "FLEET_MANAGER";

  return (
    <div className="space-y-6 text-slate-800 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Asset Maintenance & Service</h1>
        <p className="text-xs text-slate-500 mt-1">
          Log equipment service logs, schedule scheduled repairs, and track shop dwell time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form */}
        <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-slate-50/50 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Log Service Record</h3>
            <BadgeAlertIcon className="h-4.5 w-4.5 text-slate-400" />
          </div>

          <form onSubmit={handleCreateSubmit} className="space-y-3.5">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select Asset</label>
              <select
                required
                className="w-full h-8.5 rounded-lg border border-slate-200 bg-white px-3 text-xs focus-visible:outline-none focus-visible:border-slate-300 text-slate-600 mt-1"
                value={createForm.vehicleId}
                onChange={(e) => setCreateForm({ ...createForm, vehicleId: e.target.value })}
              >
                <option value="">Choose asset...</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.registrationNumber}) — Currently: {v.status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Service Description</label>
              <Input
                required
                placeholder="e.g., Engine tune-up, hydraulic repairs"
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                className="mt-1 bg-white border-slate-200 text-xs focus:border-slate-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Scheduled Date</label>
                <Input
                  required
                  type="date"
                  value={createForm.scheduledAt}
                  onChange={(e) => setCreateForm({ ...createForm, scheduledAt: e.target.value })}
                  className="mt-1 bg-white border-slate-200 text-xs focus:border-slate-300"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Est. Cost (₹)</label>
                <Input
                  required
                  type="number"
                  min="0"
                  value={createForm.cost}
                  onChange={(e) => setCreateForm({ ...createForm, cost: e.target.value })}
                  className="mt-1 bg-white border-slate-200 text-xs text-right focus:border-slate-300"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Additional Notes</label>
              <textarea
                className="w-full min-h-[60px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus-visible:outline-none focus-visible:border-slate-300 text-slate-600 mt-1"
                placeholder="Spare parts specifications, mechanic notes..."
                value={createForm.notes}
                onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-600 border border-rose-100">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {createSuccess && (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-600 border border-emerald-100">
                <Check className="h-4 w-4 shrink-0" />
                <span>Service scheduled successfully!</span>
              </div>
            )}

            {/* Workflow state diagram text */}
            <div className="rounded-lg border border-slate-200 bg-white p-3 text-[10px] text-slate-500 space-y-1.5 leading-relaxed font-semibold">
              <div className="flex justify-between items-center text-slate-400 uppercase tracking-widest text-[8px] font-bold pb-1 border-b border-slate-100">
                <span>Asset Isolation Policy</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Available Asset</span>
                <span className="text-slate-400">➔ (schedule service) ➔</span>
                <span className="text-amber-600">In Shop</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-amber-600">In Shop Asset</span>
                <span className="text-slate-400">➔ (complete service) ➔</span>
                <span className="text-emerald-650 font-bold text-emerald-600">Available</span>
              </div>
              <p className="text-[9px] text-slate-400 font-medium italic mt-1 pt-1.5 border-t border-slate-100 leading-normal">
                * Note: In Shop assets are automatically removed from the active workflows dispatch pool.
              </p>
            </div>

            {isManager && (
              <Button type="submit" className="w-full bg-amber-400 text-slate-900 hover:bg-amber-500 border-none font-semibold">
                Schedule & Send to Shop
              </Button>
            )}
          </form>
        </div>

        {/* Right Column: Table */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Service Logs</h3>
            <select
              className="h-7.5 rounded-lg border border-slate-200 bg-white text-[10px] font-bold px-2.5 focus-visible:outline-none text-slate-600"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">Status: All</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3">Asset</th>
                  <th className="px-4 py-3">Job Service</th>
                  <th className="px-4 py-3 text-right">Cost</th>
                  <th className="px-4 py-3">Status</th>
                  {isManager && <th className="px-4 py-3 text-right font-medium">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                      Loading service records...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                      No active service records logged.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        <div>{log.vehicle.name}</div>
                        <div className="text-[10px] text-slate-450 text-slate-450 font-mono mt-0.5">{log.vehicle.registrationNumber}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <div>{log.description}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Sched: {new Date(log.scheduledAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-amber-600 font-semibold">
                        ₹{Number(log.cost).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={STATUS_BADGES[log.status]}>
                          {log.status.replace("_", " ")}
                        </Badge>
                      </td>
                      {isManager && (
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {log.status === "OPEN" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="xs"
                                  className="text-blue-600 border-blue-200 hover:bg-blue-50 text-[9px] h-7"
                                  onClick={() => handleStatusChange(log.id, "IN_PROGRESS")}
                                >
                                  Work
                                </Button>
                                <Button
                                  variant="outline"
                                  size="xs"
                                  className="text-rose-600 border-rose-200 hover:bg-rose-50 text-[9px] h-7"
                                  onClick={() => handleStatusChange(log.id, "CANCELLED")}
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                            {log.status === "IN_PROGRESS" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="xs"
                                  className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 text-[9px] h-7"
                                  onClick={() => openCompleteModal(log)}
                                >
                                  Complete
                                </Button>
                                <Button
                                  variant="outline"
                                  size="xs"
                                  className="text-rose-600 border-rose-200 hover:bg-rose-50 text-[9px] h-7"
                                  onClick={() => handleStatusChange(log.id, "CANCELLED")}
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                            {["COMPLETED", "CANCELLED"].includes(log.status) && (
                              <span className="text-[10px] text-slate-400">—</span>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Complete Modal */}
      {showCompleteModal && activeLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl animate-in fade-in-0 zoom-in-95">
            <h2 className="text-sm font-bold text-slate-800">Complete Service Record</h2>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Enter final invoice cost and diagnostic notes.
            </p>

            <form onSubmit={handleCompleteSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Final Cost (₹)</label>
                <Input
                  required
                  type="number"
                  min="0"
                  value={completeForm.cost}
                  onChange={(e) => setCompleteForm({ ...completeForm, cost: e.target.value })}
                  className="mt-1 bg-white border-slate-200 text-xs text-right font-mono focus:border-slate-300"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Resolution Status</label>
                <select
                  className="w-full h-8.5 rounded-lg border border-slate-200 bg-white px-3 text-xs focus-visible:outline-none focus-visible:border-slate-300 text-slate-600 mt-1"
                  value={completeForm.status}
                  onChange={(e) => setCompleteForm({ ...completeForm, status: e.target.value })}
                >
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Notes & Diagnosis</label>
                <textarea
                  className="w-full min-h-[80px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus-visible:outline-none focus-visible:border-slate-300 text-slate-600 mt-1"
                  placeholder="Provide mechanical resolution log notes..."
                  value={completeForm.notes}
                  onChange={(e) => setCompleteForm({ ...completeForm, notes: e.target.value })}
                />
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
                  Update Record
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function BadgeAlertIcon(props) {
  return (
    <div {...props} className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 border border-slate-200">
      <ClipboardList className="h-4 w-4 text-amber-600" />
    </div>
  );
}
