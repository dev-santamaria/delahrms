"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Truck,
  Car,
  Receipt,
  FileCheck2,
  ShieldCheck,
  Plus,
  ArrowRight,
  DollarSign,
  Fuel,
  Gauge,
  Calendar,
  UserCheck,
  CheckCircle2,
  X,
  Sparkles,
} from "lucide-react";
import { usePortal } from "@/components/portal/portal-context";

interface FleetVehicle {
  id: string;
  registrationNumber: string;
  make: string;
  model: string;
  bodyType: "suv" | "pickup" | "truck";
  engineCapacityCc: number;
  initialCost: number;
  ownershipType: "purchased" | "leased";
  providesFuel: boolean;
  assignedEmployeeName: string;
  assignedEmployeeCode: string;
  station: string;
  odometerKm: number;
  status: "active" | "maintenance";
  carBenefitMonthly: number;
  fuelBenefitMonthly: number;
  totalTaxableMonthly: number;
  taxRuleApplied: string;
}

interface TripLog {
  id: string;
  vehicleReg: string;
  driverName: string;
  departureStation: string;
  arrivalStation: string;
  startOdometer: number;
  endOdometer: number;
  distanceKm: number;
  fuelLitres: number;
  date: string;
  purpose: string;
}

export default function StationFleetPage() {
  const { entityInfo } = usePortal();

  const [activeTab, setActiveTab] = useState<"vehicles" | "trips" | "tax">("vehicles");

  const [vehicles, setVehicles] = useState<FleetVehicle[]>([
    {
      id: "veh-001",
      registrationNumber: "KDF 123A",
      make: "Toyota",
      model: "Land Cruiser Prado TX L-Package",
      bodyType: "suv",
      engineCapacityCc: 2982,
      initialCost: 7500000,
      ownershipType: "purchased",
      providesFuel: true,
      assignedEmployeeName: "Nelson Mandela CP",
      assignedEmployeeCode: "EMP-4091",
      station: "Nairobi Industrial Plant",
      odometerKm: 42150,
      status: "active",
      carBenefitMonthly: 150000,
      fuelBenefitMonthly: 45000,
      totalTaxableMonthly: 195000,
      taxRuleApplied: "2% of KES 7.5M (KES 150,000) > Prescribed CC Rate (KES 7,200)",
    },
    {
      id: "veh-002",
      registrationNumber: "KDD 456B",
      make: "Isuzu",
      model: "D-Max V-Cross 3.0 4x4 Heavy Duty",
      bodyType: "pickup",
      engineCapacityCc: 2999,
      initialCost: 5800000,
      ownershipType: "purchased",
      providesFuel: true,
      assignedEmployeeName: "Kennedy Omondi",
      assignedEmployeeCode: "EMP-008",
      station: "Kisumu Lake Basin Depot",
      odometerKm: 68420,
      status: "active",
      carBenefitMonthly: 116000,
      fuelBenefitMonthly: 34800,
      totalTaxableMonthly: 150800,
      taxRuleApplied: "2% of KES 5.8M (KES 116,000) > Prescribed CC Rate (KES 7,200)",
    },
    {
      id: "veh-003",
      registrationNumber: "KDC 789C",
      make: "Toyota",
      model: "Corolla Cross Hybrid Commercial",
      bodyType: "suv",
      engineCapacityCc: 1798,
      initialCost: 4200000,
      ownershipType: "leased",
      providesFuel: false,
      assignedEmployeeName: "David Omondi",
      assignedEmployeeCode: "EMP-2190",
      station: "Nairobi Industrial Plant",
      odometerKm: 28900,
      status: "active",
      carBenefitMonthly: 84000,
      fuelBenefitMonthly: 0,
      totalTaxableMonthly: 84000,
      taxRuleApplied: "2% of KES 4.2M (KES 84,000) • Zero Employer Fuel",
    },
  ]);

  const [trips, setTrips] = useState<TripLog[]>([
    {
      id: "trp-01",
      vehicleReg: "KDD 456B",
      driverName: "Kennedy Omondi",
      departureStation: "Kisumu Lake Basin Depot",
      arrivalStation: "Nairobi Industrial Plant",
      startOdometer: 68070,
      endOdometer: 68420,
      distanceKm: 350,
      fuelLitres: 38.5,
      date: "Sep 15, 2026",
      purpose: "Transfer logistics haulage & inspection equipment transit",
    },
    {
      id: "trp-02",
      vehicleReg: "KDF 123A",
      driverName: "Nelson Mandela CP",
      departureStation: "Nairobi Industrial Plant",
      arrivalStation: "Mombasa Port Terminal",
      startOdometer: 41660,
      endOdometer: 42150,
      distanceKm: 490,
      fuelLitres: 52.0,
      date: "Sep 08, 2026",
      purpose: "Port logistics clearance & hazardous boiler inspection",
    },
  ]);

  const [tripModalOpen, setTripModalOpen] = useState(false);
  const [newVehicleReg, setNewVehicleReg] = useState("KDD 456B");
  const [newDriver, setNewDriver] = useState("Kennedy Omondi");
  const [newOrigin, setNewOrigin] = useState("Kisumu Lake Basin Depot");
  const [newDest, setNewDest] = useState("Nairobi Industrial Plant");
  const [newDist, setNewDist] = useState("350");
  const [newFuel, setNewFuel] = useState("38");
  const [newPurpose, setNewPurpose] = useState("Routine station transfer trip");

  const handleLogTrip = (e: React.FormEvent) => {
    e.preventDefault();
    const distance = Number(newDist);
    const newTripItem: TripLog = {
      id: `trp-${Date.now()}`,
      vehicleReg: newVehicleReg,
      driverName: newDriver,
      departureStation: newOrigin,
      arrivalStation: newDest,
      startOdometer: 68420,
      endOdometer: 68420 + distance,
      distanceKm: distance,
      fuelLitres: Number(newFuel),
      date: "Today",
      purpose: newPurpose,
    };
    setTrips((prev) => [newTripItem, ...prev]);
    setTripModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              Station Commercial Fleet
            </span>
            <span className="text-xs font-mono text-[var(--gray-muted)]">
              KRA Section 5(4) Tax Automated
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--gray-text)] mt-1">
            Commercial Fleet & Station Logistics
          </h1>
          <p className="text-xs text-[var(--gray-muted)] mt-0.5">
            Station vehicles registry, driver custody handovers, inter-station trip logging, and statutory car benefit taxation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTripModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[var(--emerald-deep)] text-white text-xs font-bold hover:bg-[var(--emerald-deep-hover)] shadow-xs transition flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Log Station Trip</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--gray-muted)]">Station Fleet Units</span>
          <h3 className="text-2xl font-extrabold text-[var(--gray-text)] font-mono">{vehicles.length} Vehicles</h3>
          <p className="text-[11px] text-emerald-700 font-semibold">100% Operational • 0 In Maintenance</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--gray-muted)]">Monthly Car Benefit Tax</span>
          <h3 className="text-2xl font-extrabold text-blue-700 font-mono">KES 429,800</h3>
          <p className="text-[11px] text-[var(--gray-muted)]">Automatically exported to KRA iTax CSV</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--gray-muted)]">Total Logged Fleet Mileage</span>
          <h3 className="text-2xl font-extrabold text-purple-700 font-mono">139,470 KM</h3>
          <p className="text-[11px] text-[var(--gray-muted)]">Nairobi ⇄ Kisumu ⇄ Mombasa Corridors</p>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--gray-border)] pb-2 overflow-x-auto">
        {[
          { key: "vehicles", label: "Station Vehicle Registry", icon: Truck, count: vehicles.length },
          { key: "trips", label: "Inter-Station Trip Logs", icon: Gauge, count: trips.length },
          { key: "tax", label: "KRA Section 5(4) Tax Ledger", icon: Receipt },
        ].map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? "bg-white text-[var(--emerald-deep)] border border-[var(--gray-border)] shadow-xs"
                  : "text-[var(--gray-muted)] hover:text-[var(--gray-text)] hover:bg-gray-100/60"
              }`}
            >
              <IconComp className={`h-3.5 w-3.5 ${isActive ? "text-[var(--emerald-deep)]" : ""}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                  isActive ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-700"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. Tab Contents */}

      {/* TAB 1: Vehicles Registry */}
      {activeTab === "vehicles" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {vehicles.map((veh) => (
            <div
              key={veh.id}
              className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-extrabold text-[var(--gray-text)] bg-gray-100 px-2.5 py-1 rounded-xl">
                    {veh.registrationNumber}
                  </span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                    {veh.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[var(--gray-text)]">{veh.make} {veh.model}</h3>
                  <p className="text-xs text-[var(--gray-muted)]">{veh.station} • {veh.engineCapacityCc} CC</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[var(--cool-gray)] border border-[var(--gray-border)] space-y-1.5 text-xs">
                  <div className="flex justify-between text-[var(--gray-muted)]">
                    <span>Custody Driver:</span>
                    <span className="font-bold text-[var(--gray-text)]">{veh.assignedEmployeeName}</span>
                  </div>
                  <div className="flex justify-between text-[var(--gray-muted)]">
                    <span>Odometer Reading:</span>
                    <span className="font-mono font-bold text-zinc-700">{veh.odometerKm.toLocaleString()} KM</span>
                  </div>
                  <div className="flex justify-between text-[var(--gray-muted)]">
                    <span>Initial Cost:</span>
                    <span className="font-mono font-bold text-zinc-700">KES {veh.initialCost.toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs space-y-1">
                  <div className="flex justify-between text-blue-900 font-bold">
                    <span>Monthly Taxable Benefit:</span>
                    <span className="font-mono">KES {veh.totalTaxableMonthly.toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] text-blue-800 leading-snug">{veh.taxRuleApplied}</p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-mono text-[10px]">Fuel: {veh.providesFuel ? "Company Card" : "Self"}</span>
                <button
                  type="button"
                  onClick={() => {
                    setNewVehicleReg(veh.registrationNumber);
                    setTripModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[var(--emerald-deep)] text-white text-xs font-bold hover:bg-[var(--emerald-deep-hover)] transition shadow-xs"
                >
                  Log Trip
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: Inter-Station Trips */}
      {activeTab === "trips" && (
        <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[var(--gray-text)]">
              Logged Station Haulage & Inter-Facility Trips
            </h2>
            <button
              type="button"
              onClick={() => setTripModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-[var(--emerald-deep)] text-white text-xs font-bold hover:bg-[var(--emerald-deep-hover)] transition"
            >
              Log New Trip
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {trips.map((trp) => (
              <div key={trp.id} className="py-4 first:pt-0 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[var(--gray-text)] bg-gray-100 px-2 py-0.5 rounded">
                      {trp.vehicleReg}
                    </span>
                    <span className="text-xs font-bold text-[var(--gray-text)]">{trp.departureStation} ⇄ {trp.arrivalStation}</span>
                  </div>
                  <p className="text-xs text-[var(--gray-muted)]">{trp.purpose}</p>
                  <p className="text-[10px] text-zinc-400">Driver: {trp.driverName} • Date: {trp.date}</p>
                </div>

                <div className="flex items-center gap-4 self-end md:self-center text-xs">
                  <div className="text-right">
                    <span className="text-[10px] text-[var(--gray-muted)]">Distance Covered:</span>
                    <p className="font-mono font-bold text-[var(--emerald-deep)]">{trp.distanceKm} KM</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[var(--gray-muted)]">Fuel Consumed:</span>
                    <p className="font-mono font-bold text-zinc-700">{trp.fuelLitres} L</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: KRA Section 5(4) Tax Ledger */}
      {activeTab === "tax" && (
        <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-5">
          <div>
            <h2 className="text-base font-bold text-[var(--gray-text)] flex items-center gap-2">
              <Receipt className="h-4 w-4 text-[var(--emerald-deep)]" />
              <span>KRA Section 5(4) Statutory Car Benefit Formula</span>
            </h2>
            <p className="text-xs text-[var(--gray-muted)] mt-0.5 leading-relaxed">
              In accordance with Kenyan tax law, employer-provided motor vehicle benefits are taxable at the higher of <strong>2% per month of the vehicle initial cost</strong> or the <strong>prescribed engine CC rate</strong>, plus an additional monthly fuel benefit if fuel is company-provided.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-[var(--gray-muted)] font-bold text-[10px] uppercase">
                  <th className="py-2.5 px-3">Vehicle</th>
                  <th className="py-2.5 px-3">Engine CC</th>
                  <th className="py-2.5 px-3">Initial Cost</th>
                  <th className="py-2.5 px-3">2% Cost Rule</th>
                  <th className="py-2.5 px-3">Fuel Benefit</th>
                  <th className="py-2.5 px-3 text-right">Taxable Benefit / Mo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="py-3 px-3 font-bold font-mono text-[var(--gray-text)]">{v.registrationNumber}</td>
                    <td className="py-3 px-3 font-mono">{v.engineCapacityCc} CC</td>
                    <td className="py-3 px-3 font-mono">KES {v.initialCost.toLocaleString()}</td>
                    <td className="py-3 px-3 font-mono">KES {v.carBenefitMonthly.toLocaleString()}</td>
                    <td className="py-3 px-3 font-mono">KES {v.fuelBenefitMonthly.toLocaleString()}</td>
                    <td className="py-3 px-3 font-mono font-bold text-right text-[var(--emerald-deep)]">
                      KES {v.totalTaxableMonthly.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Log Trip Modal */}
      {tripModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="w-full max-w-md rounded-3xl bg-white border border-[var(--gray-border)] shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-[var(--gray-text)] flex items-center gap-2">
                <Truck className="h-5 w-5 text-[var(--emerald-deep)]" />
                <span>Log Inter-Station Trip</span>
              </h3>
              <button type="button" onClick={() => setTripModalOpen(false)} className="p-1 text-gray-400">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleLogTrip} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--gray-text)]">Vehicle Registration</label>
                <select
                  value={newVehicleReg}
                  onChange={(e) => setNewVehicleReg(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--gray-border)] bg-gray-50 focus:outline-none focus:border-[var(--emerald-deep)] font-mono"
                >
                  <option value="KDF 123A">KDF 123A (Toyota Land Cruiser)</option>
                  <option value="KDD 456B">KDD 456B (Isuzu D-Max)</option>
                  <option value="KDC 789C">KDC 789C (Toyota Corolla Cross)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--gray-text)]">Departure Station</label>
                  <input
                    type="text"
                    required
                    value={newOrigin}
                    onChange={(e) => setNewOrigin(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--gray-border)] bg-gray-50 focus:outline-none focus:border-[var(--emerald-deep)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--gray-text)]">Arrival Station</label>
                  <input
                    type="text"
                    required
                    value={newDest}
                    onChange={(e) => setNewDest(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--gray-border)] bg-gray-50 focus:outline-none focus:border-[var(--emerald-deep)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--gray-text)]">Distance (KM)</label>
                  <input
                    type="number"
                    required
                    value={newDist}
                    onChange={(e) => setNewDist(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-[var(--gray-border)] bg-gray-50 focus:outline-none focus:border-[var(--emerald-deep)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--gray-text)]">Fuel Consumed (Litres)</label>
                  <input
                    type="number"
                    required
                    value={newFuel}
                    onChange={(e) => setNewFuel(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-[var(--gray-border)] bg-gray-50 focus:outline-none focus:border-[var(--emerald-deep)]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--gray-text)]">Trip Purpose</label>
                <input
                  type="text"
                  required
                  value={newPurpose}
                  onChange={(e) => setNewPurpose(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--gray-border)] bg-gray-50 focus:outline-none focus:border-[var(--emerald-deep)]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTripModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-bold text-[var(--gray-muted)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-bold shadow-xs"
                >
                  Save Trip Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
