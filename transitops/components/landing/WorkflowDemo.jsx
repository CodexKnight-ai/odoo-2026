"use client"

import { useState } from "react"
import { Play, Check, AlertTriangle, RefreshCw, Plus, Calendar, ArrowRight, ShieldCheck, HelpCircle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function WorkflowDemo() {
  // Simulator State
  const [step, setStep] = useState(1)
  
  // Registered entities in state
  const [vehicles, setVehicles] = useState([
    { id: "V1", regNo: "Truck-01", name: "Heavy Duty Titan", type: "Truck", capacity: 5000, odometer: 45000, cost: 75000, status: "Available" }
  ])
  const [drivers, setDrivers] = useState([
    { id: "D1", name: "Sarah Connor", licenseNo: "L-90210", category: "Heavy", expiry: "2029-05-15", safetyScore: 98, status: "Available" }
  ])
  const [trips, setTrips] = useState([])
  const [maintenanceLogs, setMaintenanceLogs] = useState([])
  const [fuelLogs, setFuelLogs] = useState([])

  // Form states
  const [newVehicle, setNewVehicle] = useState({ regNo: "Van-05", name: "Van-05 Transit", type: "Van", capacity: "500", odometer: "10000", cost: "25000" })
  const [newDriver, setNewDriver] = useState({ name: "Alex", licenseNo: "L-77481", category: "Light Commercial", expiry: "2028-11-20", safetyScore: "95" })
  const [tripForm, setTripForm] = useState({ vehicleId: "", driverId: "", cargoWeight: "450", distance: "300", source: "Warehouse A", destination: "City Terminal" })
  const [tripError, setTripError] = useState("")
  const [odometerEnd, setOdometerEnd] = useState("10300")
  const [fuelConsumed, setFuelConsumed] = useState("30")
  const [fuelCost, setFuelCost] = useState("120")
  const [maintenanceForm, setMaintenanceForm] = useState({ vehicleId: "", description: "Engine Oil & Filter Change", cost: "350" })

  // Simulation controls
  const resetSimulator = () => {
    setVehicles([
      { id: "V1", regNo: "Truck-01", name: "Heavy Duty Titan", type: "Truck", capacity: 5000, odometer: 45000, cost: 75000, status: "Available" }
    ])
    setDrivers([
      { id: "D1", name: "Sarah Connor", licenseNo: "L-90210", category: "Heavy", expiry: "2029-05-15", safetyScore: 98, status: "Available" }
    ])
    setTrips([])
    setMaintenanceLogs([])
    setFuelLogs([])
    setStep(1)
    setTripError("")
    setTripForm({ vehicleId: "", driverId: "", cargoWeight: "450", distance: "300", source: "Warehouse A", destination: "City Terminal" })
    setNewVehicle({ regNo: "Van-05", name: "Van-05 Transit", type: "Van", capacity: "500", odometer: "10000", cost: "25000" })
    setNewDriver({ name: "Alex", licenseNo: "L-77481", category: "Light Commercial", expiry: "2028-11-20", safetyScore: "95" })
  }

  // Step Action Handlers
  const handleRegisterVehicle = () => {
    // Unique check
    if (vehicles.some(v => v.regNo.toLowerCase() === newVehicle.regNo.toLowerCase())) {
      alert("Registration number must be unique!")
      return
    }
    const newId = `V${vehicles.length + 1}`
    setVehicles([...vehicles, {
      id: newId,
      regNo: newVehicle.regNo,
      name: newVehicle.name,
      type: newVehicle.type,
      capacity: parseFloat(newVehicle.capacity) || 500,
      odometer: parseFloat(newVehicle.odometer) || 10000,
      cost: parseFloat(newVehicle.cost) || 25000,
      status: "Available"
    }])
    // Autofill trip dropdown in step 3
    setTripForm(prev => ({ ...prev, vehicleId: newId }))
    setStep(2)
  }

  const handleRegisterDriver = () => {
    const newId = `D${drivers.length + 1}`
    setDrivers([...drivers, {
      id: newId,
      name: newDriver.name,
      licenseNo: newDriver.licenseNo,
      category: newDriver.category,
      expiry: newDriver.expiry,
      safetyScore: parseFloat(newDriver.safetyScore) || 95,
      status: "Available"
    }])
    // Autofill trip dropdown in step 3
    setTripForm(prev => ({ ...prev, driverId: newId }))
    setStep(3)
  }

  const handleDispatchTrip = () => {
    const selectedVehicle = vehicles.find(v => v.id === tripForm.vehicleId)
    const selectedDriver = drivers.find(d => d.id === tripForm.driverId)
    const cargo = parseFloat(tripForm.cargoWeight) || 0

    if (!selectedVehicle || !selectedDriver) {
      setTripError("Please select both a vehicle and a driver.")
      return
    }

    // Business Rules Valdiations
    if (selectedVehicle.status !== "Available") {
      setTripError(`Vehicle is not available (Status: ${selectedVehicle.status})`)
      return
    }
    if (selectedDriver.status !== "Available") {
      setTripError(`Driver is not available (Status: ${selectedDriver.status})`)
      return
    }

    // Expiry Check
    const expiryDate = new Date(selectedDriver.expiry)
    const currentDate = new Date("2026-07-12") // Context date
    if (expiryDate < currentDate) {
      setTripError("Cannot assign driver: License is expired!")
      return
    }

    // Cargo capacity check
    if (cargo > selectedVehicle.capacity) {
      setTripError(`Dispatch blocked: Cargo weight (${cargo}kg) exceeds vehicle max capacity (${selectedVehicle.capacity}kg).`)
      return
    }

    // Pass: Dispatch trip
    const newTrip = {
      id: `T${trips.length + 1}`,
      vehicleId: selectedVehicle.id,
      driverId: selectedDriver.id,
      cargoWeight: cargo,
      distance: parseFloat(tripForm.distance) || 300,
      source: tripForm.source,
      destination: tripForm.destination,
      status: "Dispatched",
      odometerStart: selectedVehicle.odometer
    }

    // Update statuses
    setVehicles(vehicles.map(v => v.id === selectedVehicle.id ? { ...v, status: "On Trip" } : v))
    setDrivers(drivers.map(d => d.id === selectedDriver.id ? { ...d, status: "On Trip" } : d))
    setTrips([...trips, newTrip])
    setTripError("")
    setStep(4)
  }

  const handleCompleteTrip = () => {
    const activeTrip = trips.find(t => t.status === "Dispatched")
    if (!activeTrip) return

    const fuelLiters = parseFloat(fuelConsumed) || 30
    const costFuel = parseFloat(fuelCost) || 120
    const finalOdo = parseFloat(odometerEnd) || (activeTrip.odometerStart + activeTrip.distance)

    // Complete trip log
    setTrips(trips.map(t => t.id === activeTrip.id ? { ...t, status: "Completed", odometerEnd: finalOdo, fuelLiters, fuelCost: costFuel } : t))
    
    // Add fuel log entry
    setFuelLogs([...fuelLogs, {
      id: `F${fuelLogs.length + 1}`,
      vehicleId: activeTrip.vehicleId,
      liters: fuelLiters,
      cost: costFuel,
      date: "2026-07-12"
    }])

    // Restore vehicle & driver
    setVehicles(vehicles.map(v => v.id === activeTrip.vehicleId ? { ...v, status: "Available", odometer: finalOdo } : v))
    setDrivers(drivers.map(d => d.id === activeTrip.driverId ? { ...d, status: "Available" } : d))

    // Pre-fill maintenance target
    setMaintenanceForm(prev => ({ ...prev, vehicleId: activeTrip.vehicleId }))
    setStep(5)
  }

  const handleCreateMaintenance = () => {
    if (!maintenanceForm.vehicleId) {
      alert("Please select a vehicle.")
      return
    }

    const newLog = {
      id: `M${maintenanceLogs.length + 1}`,
      vehicleId: maintenanceForm.vehicleId,
      description: maintenanceForm.description,
      cost: parseFloat(maintenanceForm.cost) || 350,
      status: "Active",
      date: "2026-07-12"
    }

    // Set Vehicle to In Shop
    setVehicles(vehicles.map(v => v.id === maintenanceForm.vehicleId ? { ...v, status: "In Shop" } : v))
    setMaintenanceLogs([...maintenanceLogs, newLog])
    setStep(6)
  }

  const handleCloseMaintenance = (logId) => {
    const log = maintenanceLogs.find(m => m.id === logId)
    if (!log) return

    // Close maintenance
    setMaintenanceLogs(maintenanceLogs.map(m => m.id === logId ? { ...m, status: "Closed" } : m))
    
    // Set Vehicle back to Available
    setVehicles(vehicles.map(v => v.id === log.vehicleId ? { ...v, status: "Available" } : v))
    setStep(7)
  }

  // Computed ROI and Metrics
  const van05 = vehicles.find(v => v.regNo === "Van-05")
  const totalMaintenanceForVan = maintenanceLogs
    .filter(m => m.vehicleId === van05?.id)
    .reduce((sum, item) => sum + item.cost, 0)
  
  const totalFuelForVan = fuelLogs
    .filter(f => f.vehicleId === van05?.id)
    .reduce((sum, item) => sum + item.cost, 0)

  const vanTrips = trips.filter(t => t.vehicleId === van05?.id)
  const totalDistanceVan = vanTrips.reduce((sum, t) => sum + (t.odometerEnd - t.odometerStart || 0), 0)
  const totalFuelLitersVan = fuelLogs.filter(f => f.vehicleId === van05?.id).reduce((sum, f) => sum + f.liters, 0)
  const fuelEfficiency = totalFuelLitersVan > 0 ? (totalDistanceVan / totalFuelLitersVan).toFixed(1) : "0.0"

  // Formula: [Revenue - (Maintenance + Fuel)] / Acquisition Cost
  // Assume mock revenue of $2 per km
  const vanRevenue = totalDistanceVan * 2
  const vanROI = van05 && van05.cost > 0 
    ? (((vanRevenue - (totalMaintenanceForVan + totalFuelForVan)) / van05.cost) * 100).toFixed(2)
    : "0.00"

  const stepsList = [
    { title: "Vehicle Registration", desc: "Register Van-05 (500kg load cap)" },
    { title: "Driver Onboarding", desc: "Register driver Alex (safety score 95)" },
    { title: "Trip Setup & Rules Validation", desc: "Test limits: load capacity check" },
    { title: "Trip Complete & Fuel Logs", desc: "Auto-calculate cost and distance" },
    { title: "Maintenance Switch", desc: "Set Van-05 status to 'In Shop'" },
    { title: "Exclusion Verification", desc: "Excluding 'In Shop' items from Dispatch" },
    { title: "Real-time Metrics Report", desc: "Compute total fuel cost and ROI" }
  ]

  return (
    <section id="workflow" className="py-20 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight">
            Interactive Operations Simulator
          </h2>
          <p className="mt-2 text-muted-foreground">
            Experience the automated workflow and strict business validation rules step-by-step.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Timeline / Step Navigation (Left) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-border mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Workflow Tracker</span>
                <Button variant="ghost" size="sm" onClick={resetSimulator} className="h-7 text-xs flex items-center gap-1">
                  <RefreshCw className="h-3 w-3" /> Reset
                </Button>
              </div>

              {stepsList.map((s, idx) => {
                const sNum = idx + 1
                const isActive = step === sNum
                const isCompleted = step > sNum

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (isCompleted || sNum <= step) setStep(sNum)
                    }}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer text-left ${
                      isActive 
                        ? "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-600 dark:border-indigo-400 text-foreground shadow-2xs"
                        : isCompleted
                        ? "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-muted-foreground hover:bg-slate-100/50 dark:hover:bg-slate-900/50"
                        : "bg-transparent border-transparent text-muted-foreground hover:bg-slate-50/30 dark:hover:bg-slate-900/20"
                    }`}
                  >
                    <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                      isActive
                        ? "bg-indigo-600 text-white"
                        : isCompleted
                        ? "bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-950"
                        : "bg-muted text-muted-foreground border border-border"
                    }`}>
                      {isCompleted ? <Check className="h-3 w-3" /> : sNum}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold leading-tight">{s.title}</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Interactive Workspace (Right) */}
          <div className="lg:col-span-8">
            <Card className="border border-slate-200 dark:border-slate-800 bg-card shadow-xs">
              <CardHeader className="border-b border-slate-100 dark:border-slate-900 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                      <span className="flex h-2 w-2 rounded-full bg-indigo-600" />
                      Workspace Terminal
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Step {step} of 7: {stepsList[step - 1]?.title}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1 bg-muted px-2.5 py-1 rounded-md text-[10px] font-mono text-muted-foreground">
                    <span>Target: </span>
                    <span className="font-semibold text-foreground">Van-05 LifeCycle</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-6">
                
                {/* STEP 1: REGISTER VEHICLE */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 text-xs space-y-2">
                      <div className="flex items-center gap-2 font-bold text-indigo-600 dark:text-indigo-400">
                        <Info className="h-4 w-4" />
                        <span>Action: Register Vehicle Van-05</span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        To initiate operations, register your assets. We will create the delivery vehicle &quot;Van-05&quot; with a maximum weight capacity of **500 kg** and status set to **Available**.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="vReg" className="text-xs">Registration Number</Label>
                        <Input
                          id="vReg"
                          value={newVehicle.regNo}
                          onChange={(e) => setNewVehicle({ ...newVehicle, regNo: e.target.value })}
                          className="h-9 text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="vName" className="text-xs">Vehicle Model</Label>
                        <Input
                          id="vName"
                          value={newVehicle.name}
                          onChange={(e) => setNewVehicle({ ...newVehicle, name: e.target.value })}
                          className="h-9 text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="vCapacity" className="text-xs">Max Load Capacity (kg)</Label>
                        <Input
                          id="vCapacity"
                          type="number"
                          value={newVehicle.capacity}
                          onChange={(e) => setNewVehicle({ ...newVehicle, capacity: e.target.value })}
                          className="h-9 text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="vOdo" className="text-xs">Initial Odometer (km)</Label>
                        <Input
                          id="vOdo"
                          type="number"
                          value={newVehicle.odometer}
                          onChange={(e) => setNewVehicle({ ...newVehicle, odometer: e.target.value })}
                          className="h-9 text-xs"
                        />
                      </div>
                    </div>

                    <Button onClick={handleRegisterVehicle} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs h-9">
                      Register & Save Asset <Plus className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* STEP 2: REGISTER DRIVER */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 text-xs space-y-2">
                      <div className="flex items-center gap-2 font-bold text-indigo-600 dark:text-indigo-400">
                        <Info className="h-4 w-4" />
                        <span>Action: Onboard Driver &quot;Alex&quot;</span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        Onboard drivers into the centralized dashboard. We will setup Alex with a valid Commercial license and an initial safety rating of **95**.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="dName" className="text-xs">Driver Full Name</Label>
                        <Input
                          id="dName"
                          value={newDriver.name}
                          onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                          className="h-9 text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="dLicense" className="text-xs">License Number</Label>
                        <Input
                          id="dLicense"
                          value={newDriver.licenseNo}
                          onChange={(e) => setNewDriver({ ...newDriver, licenseNo: e.target.value })}
                          className="h-9 text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="dExpiry" className="text-xs">License Expiry Date</Label>
                        <Input
                          id="dExpiry"
                          type="date"
                          value={newDriver.expiry}
                          onChange={(e) => setNewDriver({ ...newDriver, expiry: e.target.value })}
                          className="h-9 text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="dSafety" className="text-xs">Safety Rating Score</Label>
                        <Input
                          id="dSafety"
                          type="number"
                          value={newDriver.safetyScore}
                          onChange={(e) => setNewDriver({ ...newDriver, safetyScore: e.target.value })}
                          className="h-9 text-xs"
                        />
                      </div>
                    </div>

                    <Button onClick={handleRegisterDriver} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs h-9">
                      Save Driver & Progress <Plus className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* STEP 3: DISPATCH TRIP & VALIDATION */}
                {step === 3 && (
                  <div className="space-y-4">
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 text-xs space-y-2">
                      <div className="flex items-center gap-2 font-bold text-indigo-600 dark:text-indigo-400">
                        <Info className="h-4 w-4" />
                        <span>Core Rule: Weight Capacity validation</span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        Create a dispatch. Try scheduling a load weight of **450 kg**. Notice what happens if you set Cargo Weight to **600 kg** (which violates Van-05&apos;s 500kg capacity limit).
                      </p>
                    </div>

                    {tripError && (
                      <div className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>{tripError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Select Vehicle</Label>
                        <select
                          value={tripForm.vehicleId}
                          onChange={(e) => setTripForm({ ...tripForm, vehicleId: e.target.value })}
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-hidden"
                        >
                          <option value="">-- Choose --</option>
                          {vehicles.map(v => (
                            <option key={v.id} value={v.id}>{v.regNo} (Cap: {v.capacity}kg - {v.status})</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs">Select Driver</Label>
                        <select
                          value={tripForm.driverId}
                          onChange={(e) => setTripForm({ ...tripForm, driverId: e.target.value })}
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-hidden"
                        >
                          <option value="">-- Choose --</option>
                          {drivers.map(d => (
                            <option key={d.id} value={d.id}>{d.name} (Status: {d.status})</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs">Cargo Load Weight (kg)</Label>
                        <Input
                          type="number"
                          value={tripForm.cargoWeight}
                          onChange={(e) => setTripForm({ ...tripForm, cargoWeight: e.target.value })}
                          className="h-9 text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs">Planned Distance (km)</Label>
                        <Input
                          type="number"
                          value={tripForm.distance}
                          onChange={(e) => setTripForm({ ...tripForm, distance: e.target.value })}
                          className="h-9 text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setTripForm(prev => ({ ...prev, cargoWeight: "650" }))
                          setTripError("")
                        }}
                        className="text-xs h-9"
                      >
                        Set Overweight (650kg)
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setTripForm(prev => ({ ...prev, cargoWeight: "450" }))
                          setTripError("")
                        }}
                        className="text-xs h-9"
                      >
                        Set Valid (450kg)
                      </Button>
                      <Button onClick={handleDispatchTrip} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs h-9">
                        Dispatch Dispatch! <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 4: ON TRIP -> COMPLETE */}
                {step === 4 && (
                  <div className="space-y-4">
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 text-xs space-y-2">
                      <div className="flex items-center gap-2 font-bold text-indigo-600 dark:text-indigo-400">
                        <ShieldCheck className="h-4 w-4" />
                        <span>Dispatch Successful: Auto-Transitions Active</span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        **Automatic status transitions triggered!** Both vehicle **{vehicles.find(v => v.id === trips[trips.length - 1]?.vehicleId)?.regNo}** and driver **{drivers.find(d => d.id === trips[trips.length - 1]?.driverId)?.name}** have changed their status to **On Trip**.
                      </p>
                    </div>

                    {/* Simulator active card */}
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-4 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400">ACTIVE TRIP ID: {trips[trips.length - 1]?.id}</span>
                        <span className="text-[9px] bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 px-2.5 py-0.5 rounded-full font-bold">ON TRIP</span>
                      </div>

                      <div className="grid grid-cols-2 gap-y-2 text-xs">
                        <span className="text-muted-foreground">Source:</span> <span className="font-semibold text-right">{trips[trips.length - 1]?.source}</span>
                        <span className="text-muted-foreground">Destination:</span> <span className="font-semibold text-right">{trips[trips.length - 1]?.destination}</span>
                        <span className="text-muted-foreground">Odometer Start:</span> <span className="font-semibold text-right">{trips[trips.length - 1]?.odometerStart} km</span>
                      </div>

                      <div className="border-t border-border pt-3 mt-2 grid grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-[10px]">Odometer End (km)</Label>
                          <Input
                            type="number"
                            value={odometerEnd}
                            onChange={(e) => setOdometerEnd(e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[10px]">Fuel Consumed (L)</Label>
                          <Input
                            type="number"
                            value={fuelConsumed}
                            onChange={(e) => setFuelConsumed(e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[10px]">Fuel Cost ($)</Label>
                          <Input
                            type="number"
                            value={fuelCost}
                            onChange={(e) => setFuelCost(e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    <Button onClick={handleCompleteTrip} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs h-9">
                      Log Fuel & Complete Trip <Check className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* STEP 5: CREATE MAINTENANCE */}
                {step === 5 && (
                  <div className="space-y-4">
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 text-xs space-y-2">
                      <div className="flex items-center gap-2 font-bold text-indigo-600 dark:text-indigo-400">
                        <Info className="h-4 w-4" />
                        <span>Action: Trigger Maintenance &quot;In Shop&quot; Lock</span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        Create a maintenance record (e.g. oil change) for **Van-05**. This will automatically trigger the vehicle&apos;s status change to **In Shop**, withdrawing it from driver assign pool.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Select Vehicle</Label>
                        <select
                          value={maintenanceForm.vehicleId}
                          onChange={(e) => setMaintenanceForm({ ...maintenanceForm, vehicleId: e.target.value })}
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-hidden"
                        >
                          <option value="">-- Choose --</option>
                          {vehicles.map(v => (
                            <option key={v.id} value={v.id}>{v.regNo} ({v.status})</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs">Repair Description</Label>
                        <Input
                          value={maintenanceForm.description}
                          onChange={(e) => setMaintenanceForm({ ...maintenanceForm, description: e.target.value })}
                          className="h-9 text-xs"
                        />
                      </div>

                      <div className="space-y-1.5 col-span-2">
                        <Label className="text-xs">Maintenance Cost ($)</Label>
                        <Input
                          type="number"
                          value={maintenanceForm.cost}
                          onChange={(e) => setMaintenanceForm({ ...maintenanceForm, cost: e.target.value })}
                          className="h-9 text-xs"
                        />
                      </div>
                    </div>

                    <Button onClick={handleCreateMaintenance} className="w-full bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs h-9">
                      Send to Maintenance (In Shop) <Plus className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* STEP 6: VERIFY EXCLUSION FROM POOL */}
                {step === 6 && (
                  <div className="space-y-4">
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 text-xs space-y-2">
                      <div className="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-400">
                        <Info className="h-4 w-4" />
                        <span>Verification: Exclusion Rule Enforced</span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        **Verify the business rule:** Below is a simulated Dispatch form selection pool. Notice that **Van-05** is marked **In Shop** in the database and is **hidden / disabled** from the selection pool, preventing conflicts!
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-3">
                      <Label className="text-xs font-bold text-slate-900 dark:text-white">Select dispatch vehicle (Filtered View)</Label>
                      <div className="space-y-2">
                        {vehicles.map(v => {
                          const isInShop = v.status === "In Shop"
                          return (
                            <div
                              key={v.id}
                              className={`flex items-center justify-between p-2 rounded-lg border text-xs ${
                                isInShop 
                                  ? "bg-red-50/50 dark:bg-red-950/10 border-red-200/50 dark:border-red-900/20 text-slate-400 opacity-60" 
                                  : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                              }`}
                            >
                              <span className="font-semibold">{v.regNo} ({v.type})</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isInShop ? "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30" : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30"
                              }`}>
                                {v.status} {isInShop ? " (DISPATCH BLOCKED)" : ""}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-2">Active Maintenance Logs</span>
                      {maintenanceLogs.map(mLog => (
                        <div key={mLog.id} className="flex items-center justify-between text-xs">
                          <div>
                            <span className="font-semibold block">{mLog.description}</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Vehicle: {vehicles.find(v => v.id === mLog.vehicleId)?.regNo} | Cost: ${mLog.cost}</span>
                          </div>
                          <Button size="xs" onClick={() => handleCloseMaintenance(mLog.id)} className="h-7 text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white rounded-md">
                            Close & Approve
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 7: ANALYTICS & ROI REPORT */}
                {step === 7 && (
                  <div className="space-y-4">
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 text-xs space-y-2">
                      <div className="flex items-center gap-2 font-bold text-indigo-600 dark:text-indigo-400">
                        <Check className="h-4 w-4" />
                        <span>Closed maintenance! Vehicle returned to Available.</span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        The maintenance log has been successfully closed. **Van-05** has returned to **Available** status. Real-time expenses, fuel efficiencies, and ROI metrics are recalculated automatically.
                      </p>
                    </div>

                    {/* Analytics Board */}
                    <div className="grid grid-cols-2 gap-4">
                      
                      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-1">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Total Operational Cost (Van-05)</span>
                        <div className="text-2xl font-extrabold text-foreground">${totalMaintenanceForVan + totalFuelForVan}</div>
                        <div className="text-[10px] text-muted-foreground pt-1">
                          Fuel: ${totalFuelForVan} | Maintenance: ${totalMaintenanceForVan}
                        </div>
                      </div>

                      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-1">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Fuel Efficiency (Van-05)</span>
                        <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{fuelEfficiency} <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">km/L</span></div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono pt-1">
                          Total Distance: {totalDistanceVan} km | Fuel: {totalFuelLitersVan}L
                        </div>
                      </div>

                      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-1 col-span-2">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Computed Vehicle ROI (%)</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">{vanROI}%</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Formula: [Revenue - (Maint + Fuel)] / Acq Cost</span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 pt-1 leading-relaxed">
                          Acquisition Cost: ${van05?.cost} | Est. Revenue: ${vanRevenue} (@ $2/km)
                        </p>
                      </div>

                    </div>

                    <Button onClick={resetSimulator} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs h-9">
                      Restart Simulation Flow <RefreshCw className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}

              </CardContent>
            </Card>

            {/* Entity database state visualizer */}
            <div className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 p-4 font-mono text-[10px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-900 mb-3 font-sans text-xs font-bold text-slate-900 dark:text-white">
                <span>Database Entity State Visualizer (Memory)</span>
                <span className="text-[9px] bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-850">Reactive JSON State</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-indigo-600 dark:text-indigo-400 block font-bold mb-1">vehicles_table:</span>
                  <pre className="max-h-24 overflow-y-auto bg-slate-100 dark:bg-slate-950 p-2 rounded border border-slate-250 dark:border-slate-900">
                    {JSON.stringify(vehicles.map(v => ({ regNo: v.regNo, cap: v.capacity, odo: v.odometer, status: v.status })), null, 2)}
                  </pre>
                </div>
                <div>
                  <span className="text-indigo-600 dark:text-indigo-400 block font-bold mb-1">drivers_table:</span>
                  <pre className="max-h-24 overflow-y-auto bg-slate-100 dark:bg-slate-950 p-2 rounded border border-slate-250 dark:border-slate-900">
                    {JSON.stringify(drivers.map(d => ({ name: d.name, license: d.licenseNo, status: d.status, score: d.safetyScore })), null, 2)}
                  </pre>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  )
}