"use client";

import React, { useState } from "react";
import {
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Camera,
  ShieldCheck,
  Calendar,
  UserCheck,
} from "lucide-react";

interface AttendanceRecord {
  id: string;
  employeeName: string;
  shiftName: string;
  clockInTime: string;
  clockOutTime: string | null;
  geofenceStatus: "inside_geofence" | "outside_geofence";
  officeLocation: string;
  status: "present" | "on_time" | "late";
}

export function TimeClockModule() {
  const [isClockedIn, setIsClockedIn] = useState(true);
  const [lastPunchTime, setLastPunchTime] = useState("08:24 AM");
  const [punchMessage, setPunchMessage] = useState<string | null>(null);

  const [records, setRecords] = useState<AttendanceRecord[]>([
    {
      id: "att-001",
      employeeName: "Nelson Mandela CP",
      shiftName: "Standard Executive (08:30 - 17:30)",
      clockInTime: "08:24:12 AM",
      clockOutTime: null,
      geofenceStatus: "inside_geofence",
      officeLocation: "Nairobi HQ (Upper Hill)",
      status: "on_time",
    },
    {
      id: "att-002",
      employeeName: "Amina Odhiambo",
      shiftName: "Tech Operations (09:00 - 18:00)",
      clockInTime: "08:52:45 AM",
      clockOutTime: null,
      geofenceStatus: "inside_geofence",
      officeLocation: "Nairobi HQ (Upper Hill)",
      status: "on_time",
    },
    {
      id: "att-003",
      employeeName: "David Kiprono",
      shiftName: "Field Operations (08:00 - 17:00)",
      clockInTime: "07:48:30 AM",
      clockOutTime: null,
      geofenceStatus: "inside_geofence",
      officeLocation: "Mombasa Hub (Nyali)",
      status: "on_time",
    },
  ]);

  const handleTogglePunch = () => {
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    if (isClockedIn) {
      setIsClockedIn(false);
      setLastPunchTime(timeStr);
      setPunchMessage(`Clocked Out at ${timeStr} • GPS Geofence Verified`);
    } else {
      setIsClockedIn(true);
      setLastPunchTime(timeStr);
      setPunchMessage(`Clocked In at ${timeStr} • GPS Geofence Verified`);
    }
    setTimeout(() => setPunchMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              GPS Geofenced Time & Attendance Terminal
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              Geofence Radius: 200m Active
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Tamper-proof mobile & office biometric attendance with GPS coordinate validation and real-time overtime computation
          </p>
        </div>
      </div>

      {/* Interactive Punch Terminal Card */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Geofence Radar / Satellite Indicator */}
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-center">
              <span className="absolute h-16 w-16 rounded-full bg-emerald-500/20 animate-ping" />
              <MapPin className="h-8 w-8 text-emerald-400 z-10" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <p className="text-sm font-bold text-white">Nairobi Upper Hill HQ Geofence</p>
              </div>
              <p className="text-xs font-mono text-zinc-300 mt-0.5">Lat: -1.2991° S • Lon: 36.8188° E</p>
              <p className="text-[11px] text-emerald-400 font-medium mt-1 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Within 45m of office beacon (Allowed to punch)
              </p>
            </div>
          </div>

          {/* Punch Button & Live Status */}
          <div className="flex flex-col items-center sm:items-end gap-2">
            <button
              onClick={handleTogglePunch}
              className={`px-6 py-3 rounded-xl text-sm font-bold transition flex items-center gap-2 shadow-xl ${
                isClockedIn
                  ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
              }`}
            >
              <Clock className="h-4 w-4" />
              <span>{isClockedIn ? "Punch Clock Out" : "Punch Clock In"}</span>
            </button>

            <p className="text-[11px] text-zinc-400">
              Current State:{" "}
              <span className={isClockedIn ? "text-emerald-400 font-bold" : "text-zinc-400 font-bold"}>
                {isClockedIn ? `CLOCKED IN (${lastPunchTime})` : `CLOCKED OUT (${lastPunchTime})`}
              </span>
            </p>
          </div>
        </div>

        {punchMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4" />
            <span>{punchMessage}</span>
          </div>
        )}
      </div>

      {/* Attendance Logs Table */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
            Today&apos;s Live Attendance Logs ({records.length} Employees)
          </h3>
          <span className="text-[11px] text-zinc-400">Synced to Timesheets & Overtime Engine</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/60 text-zinc-400 text-[11px] border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-3">Assigned Shift</th>
                <th className="py-3 px-3">Clock-In Time</th>
                <th className="py-3 px-3">Location Perimeter</th>
                <th className="py-3 px-3">Geofence Status</th>
                <th className="py-3 px-4 text-right">Attendance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-zinc-800/30 transition">
                  <td className="py-3.5 px-4 font-semibold text-zinc-200">{r.employeeName}</td>
                  <td className="py-3.5 px-3 text-zinc-300">{r.shiftName}</td>
                  <td className="py-3.5 px-3 font-mono text-emerald-400 font-medium">{r.clockInTime}</td>
                  <td className="py-3.5 px-3 text-zinc-400">{r.officeLocation}</td>
                  <td className="py-3.5 px-3">
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                      <CheckCircle2 className="h-3 w-3" />
                      GPS Verified
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="text-[10px] px-2.5 py-1 rounded-full font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 capitalize">
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
