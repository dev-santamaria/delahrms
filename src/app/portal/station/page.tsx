"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Factory,
  MapPin,
  Users,
  Clock,
  Repeat,
  Truck,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Plus,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Navigation,
  Radio,
  Sparkles,
  Layers,
  ArrowUpRight,
  HardDrive,
  RefreshCw,
} from "lucide-react";
import { usePortal } from "@/components/portal/portal-context";

interface StationLocation {
  id: string;
  code: string;
  name: string;
  type: "plant" | "depot" | "terminal" | "office";
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  geofenceRadiusMeters: number;
  activeHeadcount: number;
  totalAssigned: number;
  currentShift: string;
  primaryContact: string;
  contactEmail: string;
  kiosksOnline: number;
  totalKiosks: number;
}

export default function StationCommandPage() {
  const { entityInfo, personaInfo } = usePortal();

  const stations: StationLocation[] = [
    {
      id: "loc-nrb-plant",
      code: "PLT-NRB-02",
      name: "Nairobi Industrial Plant",
      type: "plant",
      city: "Nairobi",
      address: "Commercial Street, Industrial Area",
      latitude: -1.300521,
      longitude: 36.885012,
      geofenceRadiusMeters: 200,
      activeHeadcount: 118,
      totalAssigned: 120,
      currentShift: "Shift B • Afternoon (14:00 - 22:00)",
      primaryContact: "Engineer David Mutua",
      contactEmail: "dmutua@mandela.co.ke",
      kiosksOnline: 3,
      totalKiosks: 3,
    },
    {
      id: "loc-ksm-depot",
      code: "DEP-KSM-01",
      name: "Kisumu Lake Basin Depot",
      type: "depot",
      city: "Kisumu",
      address: "Kondele Industrial Zone, Off Busia Road",
      latitude: -0.091702,
      longitude: 34.767956,
      geofenceRadiusMeters: 250,
      activeHeadcount: 62,
      totalAssigned: 65,
      currentShift: "Continental Roster • Day Crew (07:00 - 19:00)",
      primaryContact: "Kennedy Omondi",
      contactEmail: "komondi@mandela.co.ke",
      kiosksOnline: 2,
      totalKiosks: 2,
    },
    {
      id: "loc-msa-terminal",
      code: "TRM-MSA-01",
      name: "Mombasa Port Logistics Terminal",
      type: "terminal",
      city: "Mombasa",
      address: "Kilindini Harbour Access Road, Shimanzi",
      latitude: -4.053421,
      longitude: 39.658219,
      geofenceRadiusMeters: 300,
      activeHeadcount: 44,
      totalAssigned: 45,
      currentShift: "Maritime 24/7 Loading Shift",
      primaryContact: "Omar Hassan",
      contactEmail: "ohassan@mandela.co.ke",
      kiosksOnline: 2,
      totalKiosks: 2,
    },
    {
      id: "loc-nrb-hq",
      code: "NRB-HQ-01",
      name: "Mandela HQ Tower (Upper Hill)",
      type: "office",
      city: "Nairobi",
      address: "4th Ngong Avenue, Upper Hill",
      latitude: -1.298812,
      longitude: 36.814912,
      geofenceRadiusMeters: 150,
      activeHeadcount: 242,
      totalAssigned: 250,
      currentShift: "Corporate Core Hours (08:00 - 17:00)",
      primaryContact: "Sarah Wanjiku",
      contactEmail: "swanjiku@mandela.co.ke",
      kiosksOnline: 4,
      totalKiosks: 4,
    },
  ];

  const [selectedStationId, setSelectedStationId] = useState<string>("loc-nrb-plant");
  const [stationDropdownOpen, setStationDropdownOpen] = useState(false);
  const [syncingKiosks, setSyncingKiosks] = useState(false);

  const activeStation = stations.find((s) => s.id === selectedStationId) || stations[0];

  const handleSyncKiosks = () => {
    setSyncingKiosks(true);
    setTimeout(() => {
      setSyncingKiosks(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner with Station Switcher */}
      <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Plant & Depot Supervisor Hub
            </span>
            <span className="text-xs font-mono text-[var(--gray-muted)]">
              {activeStation.code} • {activeStation.city}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--gray-text)]">
            Station Command Center
          </h1>
          <p className="text-xs text-[var(--gray-muted)]">
            Continuous 24/7 industrial shift operations, biometric kiosk sync, and geofenced attendance enforcement.
          </p>
        </div>

        {/* Station Selector Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setStationDropdownOpen(!stationDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[var(--gray-border)] hover:bg-[var(--cool-gray)] text-xs font-bold text-[var(--gray-text)] shadow-2xs transition"
          >
            <Factory className="h-4 w-4 text-[var(--emerald-deep)]" />
            <span>{activeStation.name}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-gray-100 text-gray-700">
              {activeStation.code}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
          </button>

          {stationDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xl p-2 z-50 animate-in fade-in-50 zoom-in-95">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-xs font-bold text-[var(--gray-text)]">Select Active Station Enclave</p>
                <p className="text-[10px] text-[var(--gray-muted)]">Switch operational plant or logistics depot</p>
              </div>
              <div className="py-1 space-y-1 max-h-64 overflow-y-auto">
                {stations.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      setSelectedStationId(st.id);
                      setStationDropdownOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-xl text-left text-xs transition flex items-center justify-between ${
                      st.id === activeStation.id
                        ? "bg-[var(--emerald-light)] text-[var(--emerald-deep)] font-bold"
                        : "hover:bg-gray-50 text-[var(--gray-text)]"
                    }`}
                  >
                    <div>
                      <p className="font-semibold">{st.name}</p>
                      <p className="text-[10px] text-[var(--gray-muted)]">{st.city} • {st.geofenceRadiusMeters}m Geofence</p>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white border border-[var(--gray-border)]">
                      {st.activeHeadcount}/{st.totalAssigned}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Station Operational KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Headcount */}
        <div className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--gray-muted)]">On-Site Headcount</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-[var(--emerald-deep)] flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-[var(--gray-text)] font-mono">
              {activeStation.activeHeadcount} / {activeStation.totalAssigned}
            </h3>
            <p className="text-[11px] text-[var(--emerald-deep)] font-semibold mt-0.5">
              98.3% Station Attendance • 2 On Leave
            </p>
          </div>
          <div className="pt-2 border-t border-[var(--gray-border)] flex items-center justify-between text-[11px]">
            <span className="text-[var(--gray-muted)]">Supervisor:</span>
            <span className="font-bold text-[var(--gray-text)] truncate">{activeStation.primaryContact}</span>
          </div>
        </div>

        {/* Current Continuous Shift */}
        <div className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--gray-muted)]">Active Shift Rotation</span>
            <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Repeat className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[var(--gray-text)] truncate">
              {activeStation.currentShift.split("•")[0]}
            </h3>
            <p className="text-[11px] text-[var(--gray-muted)] mt-0.5 truncate">
              {activeStation.currentShift.split("•")[1] || "Continuous Pattern"}
            </p>
          </div>
          <div className="pt-2 border-t border-[var(--gray-border)] flex items-center justify-between text-[11px]">
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>12h Rest Enforced</span>
            </span>
            <Link href="/portal/station/rotations" className="text-[var(--emerald-deep)] font-semibold hover:underline">
              Patterns →
            </Link>
          </div>
        </div>

        {/* GPS Geofence Enclave */}
        <div className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--gray-muted)]">GPS Geofence Radius</span>
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Navigation className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-[var(--gray-text)] font-mono">
              {activeStation.geofenceRadiusMeters} Meters
            </h3>
            <p className="text-[11px] text-[var(--gray-muted)] mt-0.5 font-mono">
              {activeStation.latitude.toFixed(4)}, {activeStation.longitude.toFixed(4)}
            </p>
          </div>
          <div className="pt-2 border-t border-[var(--gray-border)] flex items-center justify-between text-[11px]">
            <span className="text-[var(--gray-muted)]">Haversine Verification:</span>
            <span className="font-bold text-emerald-700">Strict Lock</span>
          </div>
        </div>

        {/* Biometric Kiosk Status */}
        <div className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--gray-muted)]">Biometric Kiosks</span>
            <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Radio className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-[var(--gray-text)] font-mono">
              {activeStation.kiosksOnline} / {activeStation.totalKiosks} Online
            </h3>
            <p className="text-[11px] text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Real-Time Sync (0.0s Lag)</span>
            </p>
          </div>
          <div className="pt-2 border-t border-[var(--gray-border)] flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={handleSyncKiosks}
              disabled={syncingKiosks}
              className="text-[var(--emerald-deep)] hover:underline font-bold flex items-center gap-1"
            >
              <RefreshCw className={`h-3 w-3 ${syncingKiosks ? "animate-spin" : ""}`} />
              <span>{syncingKiosks ? "Syncing..." : "Sync Hardware"}</span>
            </button>
            <span className="text-zinc-400 font-mono text-[10px]">Optical Kiosks</span>
          </div>
        </div>
      </div>

      {/* 3. Operational Hub Shortcuts (Transfers, Rotations, Fleet) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Domestic Station Transfers Card */}
        <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-[var(--emerald-deep)] flex items-center justify-center">
                <MapPin className="h-5 w-5" />
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Active Relocations
              </span>
            </div>
            <h3 className="text-base font-bold text-[var(--gray-text)]">
              Domestic Station Transfers
            </h3>
            <p className="text-xs text-[var(--gray-muted)] leading-relaxed">
              Manage workforce relocation cases between plants & depots (e.g. Kisumu Depot to Nairobi Plant) with disturbance allowances, haulage assistance, and automatic geofence re-binding.
            </p>
          </div>
          <Link
            href="/portal/station/transfers"
            className="w-full py-2.5 px-4 rounded-xl bg-[var(--emerald-deep)] text-white text-xs font-bold hover:bg-[var(--emerald-deep-hover)] transition flex items-center justify-center gap-2 shadow-xs"
          >
            <span>Open Transfers Hub</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* 24/7 Continuous Shift Rotations Card */}
        <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Repeat className="h-5 w-5" />
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                Continuous 24/7
              </span>
            </div>
            <h3 className="text-base font-bold text-[var(--gray-text)]">
              Continuous Shift Rotations
            </h3>
            <p className="text-xs text-[var(--gray-muted)] leading-relaxed">
              Automated 28-day Continental 3-shift and Mining FIFO 14/14 continuous patterns with mandatory 12-hour rest fatigue interlocks preventing scheduling violations.
            </p>
          </div>
          <Link
            href="/portal/station/rotations"
            className="w-full py-2.5 px-4 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition flex items-center justify-center gap-2 shadow-xs"
          >
            <span>Manage Shift Rotations</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Commercial Fleet & Logistics Card */}
        <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Truck className="h-5 w-5" />
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                Logistics Fleet
              </span>
            </div>
            <h3 className="text-base font-bold text-[var(--gray-text)]">
              Station Commercial Fleet
            </h3>
            <p className="text-xs text-[var(--gray-muted)] leading-relaxed">
              Track assigned commercial pickups, trucks, and supervisor vehicles with driver custody handovers, fuel cards, and statutory KRA Section 5(4) car benefit taxation.
            </p>
          </div>
          <Link
            href="/portal/station/fleet"
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-xs"
          >
            <span>Station Fleet Registry</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* 4. Live Geofenced Clock-in Terminal & Attendance Stream */}
      <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[var(--gray-text)] flex items-center gap-2">
              <Radio className="h-4 w-4 text-[var(--emerald-deep)]" />
              <span>Live Attendance & Biometric Stream ({activeStation.name})</span>
            </h2>
            <p className="text-xs text-[var(--gray-muted)]">
              Real-time punch clock transactions verified via GPS Haversine and optical fingerprint kiosks.
            </p>
          </div>
          <span className="text-xs font-bold text-[var(--emerald-deep)] flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Telemetry Active</span>
          </span>
        </div>

        <div className="divide-y divide-gray-100">
          {[
            { name: "Nelson Mandela CP", code: "EMP-4091", time: "13:52 PM", method: "Biometric Optical Kiosk #1", dist: "18m from center", status: "Verified On-Site" },
            { name: "Engineer Alex Kiprop", code: "EMP-4102", time: "13:48 PM", method: "Mobile GPS Punch (DelaHR App)", dist: "42m from center", status: "Verified On-Site" },
            { name: "Grace Muthoni", code: "EMP-5011", time: "06:04 AM", method: "Biometric Optical Kiosk #2", dist: "12m from center", status: "Verified On-Site" },
            { name: "David Mutua", code: "EMP-002", time: "07:50 AM", method: "Biometric Optical Kiosk #1", dist: "25m from center", status: "Verified On-Site" },
          ].map((punch, idx) => (
            <div key={idx} className="py-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-50 text-[var(--emerald-deep)] flex items-center justify-center font-bold text-xs shrink-0">
                  {punch.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <p className="text-xs font-bold text-[var(--gray-text)]">
                    {punch.name} <span className="font-mono text-[10px] text-zinc-400">({punch.code})</span>
                  </p>
                  <p className="text-[11px] text-[var(--gray-muted)]">
                    {punch.method} • <span className="font-mono text-zinc-600">{punch.dist}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <span className="text-xs font-mono font-bold text-[var(--gray-text)]">{punch.time}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>{punch.status}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
