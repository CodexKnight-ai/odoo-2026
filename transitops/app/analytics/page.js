"use client";

import { useEffect, useState } from "react";
import { TrendingUp, DollarSign, Fuel, Award, BarChart2, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AnalyticsPage() {
  const [data, setData] = useState({ kpis: {}, vehicles: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/reports", { credentials: "include" });
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          const err = await res.json().catch(() => ({}));
          setError(err.error || `Error ${res.status}`);
        }
      } catch (err) {
        setError("Failed to connect to server.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const { kpis = {}, vehicles = [] } = data;

  const handleExportCSV = () => {
    if (!vehicles || vehicles.length === 0) return;
    const headers = [
      "Vehicle Name",
      "Registration Number",
      "Distance (km)",
      "Fuel Spend (INR)",
      "Service Spend (INR)",
      "Incidentals (INR)",
      "Total Overhead (INR)",
      "Revenue (INR)",
      "Returns Index (ROI %)"
    ];
    
    const rows = vehicles.map(v => [
      v.name,
      v.registrationNumber,
      v.distance,
      v.fuelCost,
      v.maintenanceCost,
      v.otherExpenseCost,
      v.operationalCost,
      v.revenue,
      v.roi !== null ? `${(Number(v.roi) * 100).toFixed(2)}%` : "N/A"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `fleet_analytics_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sorting calculations
  const topRoiVehicles = [...vehicles]
    .filter((v) => v.roi !== null)
    .sort((a, b) => b.roi - a.roi)
    .slice(0, 3);

  const costliestVehicles = [...vehicles]
    .sort((a, b) => b.operationalCost - a.operationalCost)
    .slice(0, 3);

  // Use server-computed aggregates when available, fall back to client-side calculation
  const avgFuelEfficiency =
    kpis.avgFuelEfficiency ??
    (vehicles.filter((v) => v.fuelEfficiency).length > 0
      ? vehicles.filter((v) => v.fuelEfficiency).reduce((sum, v) => sum + v.fuelEfficiency, 0) /
        vehicles.filter((v) => v.fuelEfficiency).length
      : 0);

  const totalRevenue = kpis.totalRevenue ?? vehicles.reduce((sum, v) => sum + Number(v.revenue || 0), 0);
  const totalCosts = vehicles.reduce((sum, v) => sum + Number(v.operationalCost || 0), 0);
  const totalAcquisition = kpis.totalAcquisition ?? vehicles.reduce((sum, v) => sum + Number(v.acquisitionCost || 0), 0);
  const averageRoi = totalAcquisition > 0
    ? ((totalRevenue - totalCosts) / totalAcquisition) * 100
    : totalCosts > 0
    ? ((totalRevenue - totalCosts) / totalCosts) * 100
    : 0;

  return (
    <div className="space-y-6 text-slate-800 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Reports & Analytics</h1>
          <p className="text-xs text-slate-500 mt-1">
            Perform multi-dimensional audits on asset resource values, cost metrics, operational margins, and ROIs.
          </p>
        </div>
        <Button
          onClick={handleExportCSV}
          disabled={loading || vehicles.length === 0}
          className="bg-amber-400 text-slate-900 hover:bg-amber-500 h-9 font-semibold text-xs rounded-lg shadow-sm border-none flex items-center gap-1.5"
        >
          <Download className="h-3.5 w-3.5" /> Export CSV
        </Button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700">
          ⚠ {error}
        </div>
      )}

      {/* KPI Cards Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-widest">Avg Fuel Efficiency</span>
            <Fuel className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2.5 text-xl font-bold font-mono text-slate-850 text-slate-800">
            {loading ? "..." : avgFuelEfficiency > 0 ? `${avgFuelEfficiency.toFixed(1)} km/L` : "—"}
          </div>
          <p className="text-[9px] text-slate-400 mt-1 font-medium">Kilometers per liter operational average</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-widest">Fleet Utilization</span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2.5 text-xl font-bold font-mono text-slate-850 text-slate-800">
            {loading ? "..." : `${Number(kpis.fleetUtilization || 0).toFixed(1)}%`}
          </div>
          <p className="text-[9px] text-slate-400 mt-1 font-medium">Rostered resource dispatch percentage</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-widest">Operational cost</span>
            <DollarSign className="h-4 w-4 text-rose-600" />
          </div>
          <div className="mt-2.5 text-xl font-bold font-mono text-slate-850 text-slate-800">
            {loading ? "..." : `₹${Number(kpis.operationalCost || 0).toLocaleString()}`}
          </div>
          <p className="text-[9px] text-slate-400 mt-1 font-medium">Aggregated operational and maintenance spend</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-widest">Revenue ROI (%)</span>
            <BarChart2 className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2.5 text-xl font-bold font-mono text-slate-850 text-slate-800">
            {loading ? "..." : `${averageRoi.toFixed(1)}%`}
          </div>
          <p className="text-[9px] text-slate-400 mt-1 font-medium">Overall capital returns index rating</p>
        </div>
      </div>

      {/* Visual Chart Elements */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Monthly Revenue Bar Chart (SVG-based) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-7 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Revenue Generation Logs</h3>
            <span className="text-[9px] text-slate-400 font-bold uppercase">Real-time Data</span>
          </div>

          {loading ? (
            <p className="text-xs text-slate-400 py-12 text-center">Processing revenue ledger...</p>
          ) : vehicles.length === 0 ? (
            <p className="text-xs text-slate-400 py-12 text-center">No transactions registered.</p>
          ) : (
            <div className="space-y-4">
              {/* Custom SVG Bar Chart */}
              <div className="h-48 w-full flex items-end justify-between gap-2.5 pt-4 px-2">
                {vehicles.map((v) => {
                  const maxRevenue = Math.max(...vehicles.map(item => Number(item.revenue || 0))) || 1;
                  const barHeight = `${(Number(v.revenue || 0) / maxRevenue) * 90}%`;
                  return (
                    <div key={v.vehicleId} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                      {/* Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-[9px] font-mono text-emerald-400 font-semibold px-1.5 py-0.5 rounded-md absolute -translate-y-16 shadow-lg pointer-events-none z-10">
                        ₹{Number(v.revenue).toLocaleString()}
                      </div>
                      <div
                        className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-xs transition-all duration-200"
                        style={{ height: barHeight }}
                      />
                      <span className="text-[9px] font-mono text-slate-400 truncate max-w-[60px]" title={v.registrationNumber}>
                        {v.registrationNumber}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Costliest Assets Panel */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Top Costliest Assets</h3>
            <span className="text-[9px] text-slate-400 font-bold uppercase">Expense Audit</span>
          </div>

          <div className="space-y-3.5">
            {loading ? (
              <p className="text-xs text-slate-400 py-12 text-center">Auditing operating costs...</p>
            ) : costliestVehicles.length === 0 ? (
              <p className="text-xs text-slate-400 py-12 text-center">No cost records logged.</p>
            ) : (
              costliestVehicles.map((v, i) => {
                const maxCost = Math.max(...vehicles.map(item => Number(item.operationalCost || 0))) || 1;
                const costPercent = `${(Number(v.operationalCost || 0) / maxCost) * 100}%`;
                return (
                  <div key={v.vehicleId} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>{v.name}</span>
                      <span className="font-mono text-amber-600 font-bold">₹{Number(v.operationalCost).toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full rounded-full" style={{ width: costPercent }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Performance Matrix Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/75">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Asset Performance Matrix</h3>
        </div>
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-55 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3">Asset identifier</th>
              <th className="px-4 py-3 text-right">Distance (km)</th>
              <th className="px-4 py-3 text-right">Fuel Spend</th>
              <th className="px-4 py-3 text-right">Service Spend</th>
              <th className="px-4 py-3 text-right">Incidentals</th>
              <th className="px-4 py-3 text-right">Total Overhead</th>
              <th className="px-4 py-3 text-right">Revenue</th>
              <th className="px-4 py-3 text-right">Returns index</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-slate-400">
                  Retrieving metrics spreadsheet...
                </td>
              </tr>
            ) : (
              vehicles.map((v) => {
                const roiPercentage = v.roi !== null ? `${(Number(v.roi) * 100).toFixed(1)}%` : "—";
                return (
                  <tr key={v.vehicleId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      <div>{v.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{v.registrationNumber}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-600">{Number(v.distance).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-500">₹{Number(v.fuelCost).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-500">₹{Number(v.maintenanceCost).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-500">₹{Number(v.otherExpenseCost).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono text-amber-600 font-semibold">₹{Number(v.operationalCost).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-600 font-semibold">₹{Number(v.revenue).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold">
                      <span className={v.roi > 0 ? "text-emerald-600" : v.roi < 0 ? "text-rose-600" : "text-slate-400"}>
                        {roiPercentage}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
