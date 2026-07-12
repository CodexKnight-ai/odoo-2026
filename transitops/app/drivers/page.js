"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Trash2, Edit, AlertCircle, Calendar, Phone, Tag } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const STATUS_BADGES = {
  AVAILABLE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ON_TRIP: "bg-blue-50 text-blue-700 border-blue-200",
  OFF_DUTY: "bg-slate-50 text-slate-700 border-slate-200",
  SUSPENDED: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function DriversPage() {
  const user = useAuthStore((s) => s.user);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentDriver, setCurrentDriver] = useState(null);
  const [error, setError] = useState(null);

  // Form inputs
  const [formData, setFormData] = useState({
    name: "",
    licenseNumber: "",
    licenseCategory: "",
    licenseExpiryDate: "",
    contactNumber: "",
    safetyScore: "100",
    status: "AVAILABLE",
  });

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (statusFilter !== "All") q.set("status", statusFilter);
      const res = await fetch(`/api/drivers?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const term = search.toLowerCase();
        const filtered = (data.drivers || []).filter((d) => 
          d.name.toLowerCase().includes(term) || 
          d.licenseNumber.toLowerCase().includes(term) ||
          d.contactNumber.includes(term)
        );
        setDrivers(filtered);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [search, statusFilter]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          safetyScore: Number(formData.safetyScore),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to add team operator.");
        return;
      }
      setShowAddModal(false);
      resetForm();
      fetchDrivers();
    } catch (err) {
      setError("Server connection issue.");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/drivers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentDriver.id,
          ...formData,
          safetyScore: Number(formData.safetyScore),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update operator profile.");
        return;
      }
      setShowEditModal(false);
      fetchDrivers();
    } catch (err) {
      setError("Server connection issue.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to remove this operator profile?")) return;
    try {
      const res = await fetch(`/api/drivers?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchDrivers();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to remove profile.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      licenseNumber: "",
      licenseCategory: "",
      licenseExpiryDate: "",
      contactNumber: "",
      safetyScore: "100",
      status: "AVAILABLE",
    });
    setError(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (d) => {
    setCurrentDriver(d);
    const expiryStr = d.licenseExpiryDate ? new Date(d.licenseExpiryDate).toISOString().split("T")[0] : "";
    setFormData({
      name: d.name,
      licenseNumber: d.licenseNumber,
      licenseCategory: d.licenseCategory,
      licenseExpiryDate: expiryStr,
      contactNumber: d.contactNumber,
      safetyScore: String(d.safetyScore),
      status: d.status,
    });
    setError(null);
    setShowEditModal(true);
  };

  const canManage = user?.role === "FLEET_MANAGER" || user?.role === "SAFETY_OFFICER";

  return (
    <div className="space-y-6 text-slate-800 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Operators Tracker</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track operational staff, licensing category updates, license renewal deadlines, and performance safety rating audits.
          </p>
        </div>
        {canManage && (
          <Button onClick={openAddModal} className="bg-amber-400 text-slate-900 hover:bg-amber-500 h-9 font-semibold text-xs rounded-lg shadow-sm border-none">
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Operator
          </Button>
        )}
      </div>

      {/* Toolbar Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Search by name, credential code or phone..."
            className="pl-9 h-8.5 text-xs bg-white border-slate-200 focus:border-slate-300 text-slate-800 placeholder:text-slate-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="h-8.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold px-3 focus-visible:outline-none focus-visible:border-slate-300 text-slate-600"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">Status: All</option>
          <option value="AVAILABLE">Available</option>
          <option value="ON_TRIP">On Trip</option>
          <option value="OFF_DUTY">Off Duty</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <th className="px-5 py-3">Operator Name</th>
              <th className="px-5 py-3">License Info</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Expiration Date</th>
              <th className="px-5 py-3">Contact</th>
              <th className="px-5 py-3 text-right">Compliance Rating</th>
              <th className="px-5 py-3">Status</th>
              {canManage && <th className="px-5 py-3 text-right">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-slate-400">
                  Retrieving operators roster...
                </td>
              </tr>
            ) : drivers.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-slate-400">
                  No registered operators matched.
                </td>
              </tr>
            ) : (
              drivers.map((d) => {
                const isExpired = new Date(d.licenseExpiryDate) <= new Date();
                const score = Number(d.safetyScore);
                const scoreColor = score >= 85 ? "bg-emerald-500" : score >= 70 ? "bg-amber-500" : "bg-rose-500";
                
                return (
                  <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-slate-800">{d.name}</td>
                    <td className="px-5 py-3.5 text-slate-600 font-mono">{d.licenseNumber}</td>
                    <td className="px-5 py-3.5 text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <Tag className="h-3 w-3 text-slate-400" />
                        {d.licenseCategory}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span className={isExpired ? "text-rose-600 font-semibold" : "text-slate-600"}>
                          {new Date(d.licenseExpiryDate).toLocaleDateString()}
                        </span>
                        {isExpired && (
                          <Badge variant="destructive" className="text-[9px] px-1.5 h-4 bg-rose-50 text-rose-600 border-rose-100 font-bold border-none">
                            RENEW
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-slate-400" />
                        {d.contactNumber}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-mono font-bold text-slate-700">{score}%</span>
                        <div className="w-16 bg-slate-100 h-1 rounded-full overflow-hidden">
                          <div className={`h-full ${scoreColor}`} style={{ width: `${score}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant="outline" className={STATUS_BADGES[d.status]}>
                        {d.status.replace("_", " ")}
                      </Badge>
                    </td>
                    {canManage && (
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            title="Edit Profile"
                            onClick={() => openEditModal(d)}
                            className="hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                            title="Remove Profile"
                            onClick={() => handleDelete(d.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl animate-in fade-in-0 zoom-in-95">
            <h2 className="text-sm font-bold text-slate-800">Register New Team Operator</h2>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Enter operator metadata credentials for compliance auditing.
            </p>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                <Input
                  required
                  placeholder="e.g., Ramesh Kumar"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 bg-white border-slate-200 text-xs focus:border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">License / Code Number</label>
                  <Input
                    required
                    placeholder="DL-XXXXXXXXXXXX"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    className="mt-1 bg-white border-slate-200 text-xs focus:border-slate-300"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category Tag</label>
                  <Input
                    required
                    placeholder="e.g., LMV, HGV, Heavy"
                    value={formData.licenseCategory}
                    onChange={(e) => setFormData({ ...formData, licenseCategory: e.target.value })}
                    className="mt-1 bg-white border-slate-200 text-xs focus:border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Expiry Date</label>
                  <Input
                    required
                    type="date"
                    value={formData.licenseExpiryDate}
                    onChange={(e) => setFormData({ ...formData, licenseExpiryDate: e.target.value })}
                    className="mt-1 bg-white border-slate-200 text-xs focus:border-slate-300"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contact Number</label>
                  <Input
                    required
                    type="tel"
                    placeholder="e.g., 9876543210"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    className="mt-1 bg-white border-slate-200 text-xs focus:border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Initial Safety Rating (%)</label>
                  <Input
                    required
                    type="number"
                    min="0"
                    max="100"
                    value={formData.safetyScore}
                    onChange={(e) => setFormData({ ...formData, safetyScore: e.target.value })}
                    className="mt-1 bg-white border-slate-200 text-xs text-right focus:border-slate-300"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</label>
                  <select
                    className="w-full h-8.5 rounded-lg border border-slate-200 bg-white px-3 text-xs focus-visible:outline-none focus-visible:border-slate-300 text-slate-600 mt-1"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="OFF_DUTY">Off Duty</option>
                  </select>
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
                  Register Operator
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
            <h2 className="text-sm font-bold text-slate-800">Update Operator Profile</h2>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Revise contact information or toggle driver duty logs.
            </p>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 bg-white border-slate-200 text-xs focus:border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">License Number</label>
                  <Input
                    required
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    className="mt-1 bg-white border-slate-200 text-xs focus:border-slate-300"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category Tag</label>
                  <Input
                    required
                    value={formData.licenseCategory}
                    onChange={(e) => setFormData({ ...formData, licenseCategory: e.target.value })}
                    className="mt-1 bg-white border-slate-200 text-xs focus:border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Expiry Date</label>
                  <Input
                    required
                    type="date"
                    value={formData.licenseExpiryDate}
                    onChange={(e) => setFormData({ ...formData, licenseExpiryDate: e.target.value })}
                    className="mt-1 bg-white border-slate-200 text-xs focus:border-slate-300"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contact Number</label>
                  <Input
                    required
                    type="tel"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    className="mt-1 bg-white border-slate-200 text-xs focus:border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Safety Score (%)</label>
                  <Input
                    required
                    type="number"
                    min="0"
                    max="100"
                    value={formData.safetyScore}
                    onChange={(e) => setFormData({ ...formData, safetyScore: e.target.value })}
                    className="mt-1 bg-white border-slate-200 text-xs text-right focus:border-slate-300"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Duty Status</label>
                  <select
                    className="w-full h-8.5 rounded-lg border border-slate-200 bg-white px-3 text-xs focus-visible:outline-none focus-visible:border-slate-300 text-slate-600 mt-1"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="OFF_DUTY">Off Duty</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-600 border border-rose-100">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowEditModal(false)} className="border-slate-200 hover:bg-slate-50">
                  Cancel
                </Button>
                <Button type="submit" className="bg-amber-400 text-slate-900 hover:bg-amber-500 border-none font-semibold">
                  Update Operator
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
