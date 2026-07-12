"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Trash2, Edit, AlertCircle, Tag, MapPin, Gauge } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const STATUS_BADGES = {
  AVAILABLE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ON_TRIP: "bg-blue-50 text-blue-700 border-blue-200",
  IN_SHOP: "bg-amber-50 text-amber-700 border-amber-200",
  RETIRED: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function FleetPage() {
  const user = useAuthStore((s) => s.user);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [regionFilter, setRegionFilter] = useState("All");

  // Form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState(null);
  const [error, setError] = useState(null);

  // Form inputs
  const [formData, setFormData] = useState({
    name: "",
    registrationNumber: "",
    type: "Truck",
    maxLoadCapacity: "",
    odometer: "",
    acquisitionCost: "",
    region: "",
    status: "AVAILABLE",
  });

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (statusFilter !== "All") q.set("status", statusFilter);
      if (typeFilter !== "All") q.set("type", typeFilter);
      if (regionFilter !== "All") q.set("region", regionFilter);
      if (search) q.set("search", search);

      const res = await fetch(`/api/vehicles?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setVehicles(data.vehicles || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [search, statusFilter, typeFilter, regionFilter]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create resource.");
        return;
      }
      setShowAddModal(false);
      resetForm();
      fetchVehicles();
    } catch (err) {
      setError("Server connection issue.");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/vehicles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: currentVehicle.id, ...formData }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update resource.");
        return;
      }
      setShowEditModal(false);
      fetchVehicles();
    } catch (err) {
      setError("Server connection issue.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to decommission this asset?")) return;
    try {
      const res = await fetch(`/api/vehicles?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchVehicles();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to decommission.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      registrationNumber: "",
      type: "Truck",
      maxLoadCapacity: "",
      odometer: "",
      acquisitionCost: "",
      region: "",
      status: "AVAILABLE",
    });
    setError(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (v) => {
    setCurrentVehicle(v);
    setFormData({
      name: v.name,
      registrationNumber: v.registrationNumber,
      type: v.type,
      maxLoadCapacity: String(v.maxLoadCapacity),
      odometer: String(v.odometer),
      acquisitionCost: String(v.acquisitionCost),
      region: v.region || "",
      status: v.status,
    });
    setError(null);
    setShowEditModal(true);
  };

  const isManager = user?.role === "FLEET_MANAGER";

  return (
    <div className="space-y-6 text-slate-800 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Asset Registry</h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain and configure global physical assets, capacities, live trackers, and lifecycle statuses.
          </p>
        </div>
        {isManager && (
          <Button onClick={openAddModal} className="bg-amber-400 text-slate-900 hover:bg-amber-500 h-9 font-semibold text-xs rounded-lg shadow-sm border-none">
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Asset
          </Button>
        )}
      </div>

      {/* Toolbar Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Search by asset identifier..."
            className="pl-9 h-8.5 text-xs bg-white border-slate-200 focus:border-slate-300 text-slate-800 placeholder:text-slate-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2.5 items-center">
          <select
            className="h-8.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold px-3 focus-visible:outline-none focus-visible:border-slate-300 text-slate-600"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">Status: All</option>
            <option value="AVAILABLE">Available</option>
            <option value="ON_TRIP">On Trip</option>
            <option value="IN_SHOP">In Shop</option>
            <option value="RETIRED">Retired</option>
          </select>

          <select
            className="h-8.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold px-3 focus-visible:outline-none focus-visible:border-slate-300 text-slate-600"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="All">Type: All</option>
            <option value="Truck">Truck</option>
            <option value="Van">Van</option>
            <option value="Mini">Mini</option>
          </select>

          <select
            className="h-8.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold px-3 focus-visible:outline-none focus-visible:border-slate-300 text-slate-600"
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
          >
            <option value="All">Region: All</option>
            <option value="North">North</option>
            <option value="South">South</option>
            <option value="East">East</option>
            <option value="West">West</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <th className="px-5 py-3">Asset Details</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Region</th>
              <th className="px-5 py-3 text-right">Max Load</th>
              <th className="px-5 py-3 text-right">Odometer</th>
              <th className="px-5 py-3 text-right">Cost Value</th>
              <th className="px-5 py-3">Status</th>
              {isManager && <th className="px-5 py-3 text-right">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-slate-400">
                  Retrieving registered resources...
                </td>
              </tr>
            ) : vehicles.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-slate-400">
                  No operational assets matching criteria.
                </td>
              </tr>
            ) : (
              vehicles.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5 font-medium">
                    <div className="text-slate-800 font-semibold">{v.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{v.registrationNumber}</div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Tag className="h-3 w-3 text-slate-400" />
                      {v.type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      {v.region || "—"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono text-slate-600">{Number(v.maxLoadCapacity).toLocaleString()} kg</td>
                  <td className="px-5 py-3.5 text-right font-mono text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <Gauge className="h-3 w-3 text-slate-400" />
                      {Number(v.odometer).toLocaleString()} km
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono text-slate-600">₹{Number(v.acquisitionCost).toLocaleString()}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant="outline" className={STATUS_BADGES[v.status]}>
                      {v.status.replace("_", " ")}
                    </Badge>
                  </td>
                  {isManager && (
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          title="Edit"
                          onClick={() => openEditModal(v)}
                          className="hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          title="Decommission"
                          onClick={() => handleDelete(v.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl animate-in fade-in-0 zoom-in-95">
            <h2 className="text-sm font-bold text-slate-800">Add New Resource</h2>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Enter configuration details. The identifier must be unique.
            </p>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Resource Name</label>
                <Input
                  required
                  placeholder="e.g., Tata Ultra / Forklift A"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 bg-white border-slate-200 text-xs focus:border-slate-300"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Unique Identifier / Reg No</label>
                <Input
                  required
                  placeholder="e.g., MH-12-PQ-9999"
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                  className="mt-1 bg-white border-slate-200 text-xs focus:border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category Type</label>
                  <select
                    className="w-full h-8.5 rounded-lg border border-slate-200 bg-white px-3 text-xs focus-visible:outline-none focus-visible:border-slate-300 text-slate-600 mt-1"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="Truck">Truck</option>
                    <option value="Van">Van</option>
                    <option value="Mini">Mini</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Region Scope</label>
                  <select
                    className="w-full h-8.5 rounded-lg border border-slate-200 bg-white px-3 text-xs focus-visible:outline-none focus-visible:border-slate-300 text-slate-600 mt-1"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  >
                    <option value="">None</option>
                    <option value="North">North</option>
                    <option value="South">South</option>
                    <option value="East">East</option>
                    <option value="West">West</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Max Capacity (kg)</label>
                  <Input
                    required
                    type="number"
                    min="1"
                    placeholder="5000"
                    value={formData.maxLoadCapacity}
                    onChange={(e) => setFormData({ ...formData, maxLoadCapacity: e.target.value })}
                    className="mt-1 bg-white border-slate-200 text-xs text-right"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Start Odom (km)</label>
                  <Input
                    required
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.odometer}
                    onChange={(e) => setFormData({ ...formData, odometer: e.target.value })}
                    className="mt-1 bg-white border-slate-200 text-xs text-right"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Acq Value (₹)</label>
                  <Input
                    required
                    type="number"
                    min="0"
                    placeholder="2500000"
                    value={formData.acquisitionCost}
                    onChange={(e) => setFormData({ ...formData, acquisitionCost: e.target.value })}
                    className="mt-1 bg-white border-slate-200 text-xs text-right"
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
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="border-slate-200 hover:bg-slate-50">
                  Cancel
                </Button>
                <Button type="submit" className="bg-amber-400 text-slate-900 hover:bg-amber-500 border-none font-semibold">
                  Save Resource
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl animate-in fade-in-0 zoom-in-95">
            <h2 className="text-sm font-bold text-slate-800">Modify Resource</h2>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Update performance ratings or configuration states.
            </p>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Resource Name</label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 bg-white border-slate-200 text-xs focus:border-slate-300"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Unique Identifier</label>
                <Input
                  required
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                  className="mt-1 bg-white border-slate-200 text-xs focus:border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Type</label>
                  <select
                    className="w-full h-8.5 rounded-lg border border-slate-200 bg-white px-3 text-xs focus-visible:outline-none focus-visible:border-slate-300 text-slate-600 mt-1"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="Truck">Truck</option>
                    <option value="Van">Van</option>
                    <option value="Mini">Mini</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Region</label>
                  <select
                    className="w-full h-8.5 rounded-lg border border-slate-200 bg-white px-3 text-xs focus-visible:outline-none focus-visible:border-slate-300 text-slate-600 mt-1"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  >
                    <option value="">None</option>
                    <option value="North">North</option>
                    <option value="South">South</option>
                    <option value="East">East</option>
                    <option value="West">West</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Capacity Rating (kg)</label>
                  <Input
                    required
                    type="number"
                    min="1"
                    value={formData.maxLoadCapacity}
                    onChange={(e) => setFormData({ ...formData, maxLoadCapacity: e.target.value })}
                    className="mt-1 bg-white border-slate-200 text-xs text-right font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status Override</label>
                  <select
                    className="w-full h-8.5 rounded-lg border border-slate-200 bg-white px-3 text-xs focus-visible:outline-none focus-visible:border-slate-300 text-slate-600 mt-1"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="RETIRED">Retired</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-rose-55 p-3 text-xs text-rose-600 border border-rose-100">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowEditModal(false)} className="border-slate-200 hover:bg-slate-50">
                  Cancel
                </Button>
                <Button type="submit" className="bg-amber-400 text-slate-900 hover:bg-amber-500 border-none font-semibold">
                  Update Asset
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
