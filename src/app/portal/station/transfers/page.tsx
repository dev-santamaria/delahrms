"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Truck,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  DollarSign,
  Plus,
  Navigation,
  FileCheck2,
  AlertTriangle,
  Receipt,
  Users,
  X,
  ChevronRight,
} from "lucide-react";
import { usePortal } from "@/components/portal/portal-context";
import { apiClient } from "@/lib/api-client";

interface DomesticTransfer {
  id: string;
  transferNumber: string;
  employeeName: string;
  employeeCode: string;
  originLocationName: string;
  destinationLocationName: string;
  transferReason: string;
  effectiveDate: string;
  reportingDate: string;
  handoverDate: string;
  status: "pending_approval" | "approved" | "completed";
  geofenceRebound: boolean;
  relocationPackage: {
    disturbanceAllowance: number;
    haulageAssistance: number;
    transitLodgingDays: number;
    transitLodgingDailyRate: number;
    transitLodgingTotal: number;
    relocationLeaveDays: number;
    stationHardshipDifferential: number;
    totalRelocationSupport: number;
    currency: string;
  };
}

export default function StationTransfersPage() {
  const { entityInfo } = usePortal();

  const [transfers, setTransfers] = useState<DomesticTransfer[]>([
    {
      id: "trf-dom-001",
      transferNumber: "TRF-2026-0104",
      employeeName: "Kennedy Omondi",
      employeeCode: "EMP-008",
      originLocationName: "Kisumu Lake Basin Depot",
      destinationLocationName: "Nairobi Industrial Plant",
      transferReason: "Promotion to Regional Operations Supervisor",
      effectiveDate: "2026-10-01",
      reportingDate: "2026-10-06",
      handoverDate: "2026-09-30",
      status: "approved",
      geofenceRebound: false,
      relocationPackage: {
        disturbanceAllowance: 150000,
        haulageAssistance: 80000,
        transitLodgingDays: 21,
        transitLodgingDailyRate: 6000,
        transitLodgingTotal: 126000,
        relocationLeaveDays: 4,
        stationHardshipDifferential: -15000,
        totalRelocationSupport: 356000,
        currency: "KES",
      },
    },
    {
      id: "trf-dom-002",
      transferNumber: "TRF-2026-0098",
      employeeName: "Engineer David Mutua",
      employeeCode: "EMP-002",
      originLocationName: "Mombasa Port Logistics Terminal",
      destinationLocationName: "Nairobi Industrial Plant",
      transferReason: "Plant maintenance turnaround leadership",
      effectiveDate: "2026-08-15",
      reportingDate: "2026-08-20",
      handoverDate: "2026-08-14",
      status: "completed",
      geofenceRebound: true,
      relocationPackage: {
        disturbanceAllowance: 180000,
        haulageAssistance: 95000,
        transitLodgingDays: 14,
        transitLodgingDailyRate: 6500,
        transitLodgingTotal: 91000,
        relocationLeaveDays: 5,
        stationHardshipDifferential: 0,
        totalRelocationSupport: 366000,
        currency: "KES",
      },
    },
  ]);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<DomesticTransfer | null>(null);

  // Form State
  const [empName, setEmpName] = useState("David Omondi (EMP-2190)");
  const [origin, setOrigin] = useState("Kisumu Lake Basin Depot");
  const [dest, setDest] = useState("Nairobi Industrial Plant");
  const [reason, setReason] = useState("Station rotation for technical upskilling");
  const [effDate, setEffDate] = useState("2026-11-01");
  const [repDate, setRepDate] = useState("2026-11-06");
  const [disturbance, setDisturbance] = useState(150000);
  const [haulage, setHaulage] = useState(75000);
  const [lodgingDays, setLodgingDays] = useState(21);
  const [lodgingRate, setLodgingRate] = useState(5000);

  const handleCreateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const transitLodgingTotal = lodgingDays * lodgingRate;
    const totalRelocationSupport = disturbance + haulage + transitLodgingTotal;

    const newTrf: DomesticTransfer = {
      id: `trf-dom-${Date.now()}`,
      transferNumber: `TRF-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      employeeName: empName.split(" (")[0],
      employeeCode: empName.split("(")[1]?.replace(")", "") || "EMP-XXXX",
      originLocationName: origin,
      destinationLocationName: dest,
      transferReason: reason,
      effectiveDate: effDate,
      reportingDate: repDate,
      handoverDate: effDate,
      status: "pending_approval",
      geofenceRebound: false,
      relocationPackage: {
        disturbanceAllowance: disturbance,
        haulageAssistance: haulage,
        transitLodgingDays: lodgingDays,
        transitLodgingDailyRate: lodgingRate,
        transitLodgingTotal,
        relocationLeaveDays: 4,
        stationHardshipDifferential: 0,
        totalRelocationSupport,
        currency: "KES",
      },
    };

    setTransfers((prev) => [newTrf, ...prev]);
    setCreateModalOpen(false);
  };

  const handleExecuteTransfer = (id: string) => {
    setTransfers((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: "completed", geofenceRebound: true } : t
      )
    );
    if (selectedTransfer?.id === id) {
      setSelectedTransfer((prev) =>
        prev ? { ...prev, status: "completed", geofenceRebound: true } : null
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Domestic Mobility & Transfers
            </span>
            <span className="text-xs font-mono text-[var(--gray-muted)]">
              Depot to Plant Logistics
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--gray-text)] mt-1">
            Station Relocation Packages & Transfers
          </h1>
          <p className="text-xs text-[var(--gray-muted)] mt-0.5">
            Manage local staff relocations between stations (e.g. Kisumu Depot to Nairobi Plant) with disturbance allowances, haulage assistance, and automatic geofence re-binding.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[var(--emerald-deep)] text-white text-xs font-bold hover:bg-[var(--emerald-deep-hover)] shadow-xs transition flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Initiate Domestic Transfer</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--gray-muted)]">Active Relocations</span>
          <h3 className="text-2xl font-extrabold text-[var(--gray-text)] font-mono">
            {transfers.filter((t) => t.status !== "completed").length} In-Flight
          </h3>
          <p className="text-[11px] text-[var(--emerald-deep)] font-semibold">1 Ready for Geofence Re-bind</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--gray-muted)]">Avg Relocation Support</span>
          <h3 className="text-2xl font-extrabold text-[var(--gray-text)] font-mono">KES 356,000</h3>
          <p className="text-[11px] text-[var(--gray-muted)]">Disturbance + Haulage + Transit Lodging</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--gray-muted)]">Attendance Geofence Lock</span>
          <h3 className="text-2xl font-extrabold text-emerald-700 font-mono">Automated</h3>
          <p className="text-[11px] text-emerald-700 font-semibold">Zero gap in biometric compliance</p>
        </div>
      </div>

      {/* 3. Transfers List */}
      <div className="space-y-4">
        {transfers.map((trf) => {
          const isCompleted = trf.status === "completed";
          const pkg = trf.relocationPackage;

          return (
            <div
              key={trf.id}
              className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] hover:border-zinc-300 shadow-xs space-y-5 transition"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[var(--emerald-deep)]">{trf.transferNumber}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      isCompleted ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                    }`}>
                      {isCompleted ? "Completed & Rebound" : "Approved & In Transit"}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[var(--gray-text)]">
                    {trf.employeeName} <span className="font-mono text-xs font-normal text-zinc-400">({trf.employeeCode})</span>
                  </h3>
                  <p className="text-xs text-[var(--gray-muted)]">{trf.transferReason}</p>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    type="button"
                    onClick={() => setSelectedTransfer(trf)}
                    className="px-3.5 py-1.5 rounded-xl bg-white border border-[var(--gray-border)] hover:bg-gray-50 text-xs font-bold text-[var(--gray-text)] transition shadow-2xs"
                  >
                    View Package Breakdown
                  </button>

                  {!isCompleted && (
                    <button
                      type="button"
                      onClick={() => handleExecuteTransfer(trf.id)}
                      className="px-4 py-1.5 rounded-xl bg-[var(--emerald-deep)] text-white text-xs font-bold hover:bg-[var(--emerald-deep-hover)] transition flex items-center gap-1.5 shadow-xs"
                    >
                      <Navigation className="h-3.5 w-3.5" />
                      <span>Execute & Re-bind Geofence</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Station Route Progress Bar */}
              <div className="p-4 rounded-2xl bg-[var(--cool-gray)] border border-[var(--gray-border)] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs">
                  <MapPin className="h-4 w-4 text-rose-500 shrink-0" />
                  <div>
                    <p className="font-bold text-[var(--gray-text)]">{trf.originLocationName}</p>
                    <p className="text-[10px] text-[var(--gray-muted)]">Origin Station (Departed)</p>
                  </div>
                </div>

                <div className="flex-1 flex items-center justify-center gap-2 px-4 w-full sm:w-auto">
                  <div className="h-0.5 flex-1 bg-emerald-300" />
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-emerald-800 border border-emerald-200">
                    4 Days Relocation Leave
                  </span>
                  <div className="h-0.5 flex-1 bg-emerald-300" />
                  <ArrowRight className="h-4 w-4 text-[var(--emerald-deep)] shrink-0" />
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <MapPin className="h-4 w-4 text-[var(--emerald-deep)] shrink-0" />
                  <div>
                    <p className="font-bold text-[var(--gray-text)]">{trf.destinationLocationName}</p>
                    <p className="text-[10px] text-[var(--gray-muted)]">Destination Station (Reporting Oct 06)</p>
                  </div>
                </div>
              </div>

              {/* Relocation Financial Support Package Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] text-[var(--gray-muted)]">Disturbance Allowance</span>
                  <p className="font-mono font-bold text-[var(--gray-text)] text-sm">
                    {pkg.currency} {pkg.disturbanceAllowance.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] text-[var(--gray-muted)]">Haulage Assistance</span>
                  <p className="font-mono font-bold text-[var(--gray-text)] text-sm">
                    {pkg.currency} {pkg.haulageAssistance.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] text-[var(--gray-muted)]">Transit Lodging ({pkg.transitLodgingDays}d)</span>
                  <p className="font-mono font-bold text-[var(--gray-text)] text-sm">
                    {pkg.currency} {pkg.transitLodgingTotal.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] text-emerald-800 font-bold uppercase">Total Support</span>
                  <p className="font-mono font-extrabold text-[var(--emerald-deep)] text-sm">
                    {pkg.currency} {pkg.totalRelocationSupport.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Status Footer */}
              <div className="flex items-center justify-between text-xs pt-1 text-[var(--gray-muted)]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className={`h-4 w-4 ${trf.geofenceRebound ? "text-emerald-600" : "text-amber-600"}`} />
                  <span>
                    Geofence Re-bind Status:{" "}
                    <strong>{trf.geofenceRebound ? "Completed (Active at Destination)" : "Queued on Reporting Date"}</strong>
                  </span>
                </div>
                <span className="text-[11px] font-mono">Effective: {trf.effectiveDate}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Initiate Domestic Transfer Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="w-full max-w-xl rounded-3xl bg-white border border-[var(--gray-border)] shadow-2xl p-6 space-y-4 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-[var(--gray-text)] flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[var(--emerald-deep)]" />
                <span>Initiate Domestic Station Relocation</span>
              </h3>
              <button type="button" onClick={() => setCreateModalOpen(false)} className="p-1 text-gray-400">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTransfer} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--gray-text)]">Employee</label>
                <select
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--gray-border)] bg-gray-50 focus:outline-none focus:border-[var(--emerald-deep)]"
                >
                  <option value="David Omondi (EMP-2190)">David Omondi (Logistics Supervisor)</option>
                  <option value="Grace Muthoni (EMP-5011)">Grace Muthoni (Quality Control)</option>
                  <option value="John Mwangi (EMP-5019)">John Mwangi (Electrical Specialist)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--gray-text)]">Origin Station</label>
                  <select
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--gray-border)] bg-gray-50 focus:outline-none focus:border-[var(--emerald-deep)]"
                  >
                    <option value="Kisumu Lake Basin Depot">Kisumu Lake Basin Depot</option>
                    <option value="Mombasa Port Logistics Terminal">Mombasa Port Terminal</option>
                    <option value="Nairobi Industrial Plant">Nairobi Industrial Plant</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--gray-text)]">Destination Station</label>
                  <select
                    value={dest}
                    onChange={(e) => setDest(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--gray-border)] bg-gray-50 focus:outline-none focus:border-[var(--emerald-deep)]"
                  >
                    <option value="Nairobi Industrial Plant">Nairobi Industrial Plant</option>
                    <option value="Kisumu Lake Basin Depot">Kisumu Lake Basin Depot</option>
                    <option value="Mombasa Port Logistics Terminal">Mombasa Port Terminal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--gray-text)]">Effective Date</label>
                  <input
                    type="date"
                    required
                    value={effDate}
                    onChange={(e) => setEffDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--gray-border)] bg-gray-50 focus:outline-none focus:border-[var(--emerald-deep)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--gray-text)]">Reporting Date</label>
                  <input
                    type="date"
                    required
                    value={repDate}
                    onChange={(e) => setRepDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--gray-border)] bg-gray-50 focus:outline-none focus:border-[var(--emerald-deep)]"
                  />
                </div>
              </div>

              {/* Relocation Package Support Inputs */}
              <div className="p-4 rounded-2xl bg-[var(--cool-gray)] border border-[var(--gray-border)] space-y-3">
                <h4 className="text-xs font-bold text-[var(--gray-text)]">Relocation Support Package Configuration</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[var(--gray-muted)]">Disturbance Allowance (KES)</label>
                    <input
                      type="number"
                      value={disturbance}
                      onChange={(e) => setDisturbance(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-[var(--gray-border)] bg-white focus:outline-none focus:border-[var(--emerald-deep)]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[var(--gray-muted)]">Haulage Assistance (KES)</label>
                    <input
                      type="number"
                      value={haulage}
                      onChange={(e) => setHaulage(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-[var(--gray-border)] bg-white focus:outline-none focus:border-[var(--emerald-deep)]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[var(--gray-muted)]">Transit Lodging Days</label>
                    <input
                      type="number"
                      value={lodgingDays}
                      onChange={(e) => setLodgingDays(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-[var(--gray-border)] bg-white focus:outline-none focus:border-[var(--emerald-deep)]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[var(--gray-muted)]">Daily Lodging Rate (KES)</label>
                    <input
                      type="number"
                      value={lodgingRate}
                      onChange={(e) => setLodgingRate(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-[var(--gray-border)] bg-white focus:outline-none focus:border-[var(--emerald-deep)]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-bold text-[var(--gray-muted)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-bold shadow-xs"
                >
                  Authorize Relocation Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
