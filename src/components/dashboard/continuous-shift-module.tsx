"use client";

import React, { useState } from "react";
import {
  Clock,
  Calendar,
  AlertTriangle,
  ShieldCheck,
  Zap,
  Users,
  HardHat,
  Moon,
  Sun,
  Sunrise,
  RotateCw,
} from "lucide-react";

interface ShiftPattern {
  id: string;
  name: string;
  code: string;
  cycleDays: number;
  patternCategory: string;
  description: string;
  crews: { name: string; currentPhase: string; shiftHours: string; headCount: number }[];
  nightShiftPremium: string;
  hazardAllowance: string;
}

export function ContinuousShiftModule() {
  const patterns: ShiftPattern[] = [
    {
      id: "pat-1",
      name: "Continental 24/7 Continuous 3-Shift Rotation",
      code: "SHIFT-CONT-247",
      cycleDays: 28,
      patternCategory: "Continuous Industrial / Heavy Manufacturing",
      description: "7 Days Morning (00:00–08:00) -> 2 Rest -> 7 Days Afternoon (08:00–16:00) -> 2 Rest -> 7 Days Night (16:00–00:00) -> 3 Rest",
      nightShiftPremium: "+25% Hourly Multiplier",
      hazardAllowance: "Standard Operating Allowance",
      crews: [
        { name: "Alpha Shift Crew", currentPhase: "Morning Shift (00:00 - 08:00)", shiftHours: "8 Hours", headCount: 18 },
        { name: "Bravo Shift Crew", currentPhase: "Afternoon Shift (08:00 - 16:00)", shiftHours: "8 Hours", headCount: 18 },
        { name: "Charlie Shift Crew", currentPhase: "Night Shift (16:00 - 00:00)", shiftHours: "8 Hours", headCount: 18 },
        { name: "Delta Shift Crew", currentPhase: "Mandatory Rest & Recovery Day", shiftHours: "0 Hours", headCount: 18 },
      ],
    },
    {
      id: "pat-2",
      name: "Mining FIFO 14/14 Continuous Roster",
      code: "SHIFT-FIFO-1414",
      cycleDays: 28,
      patternCategory: "Underground Mining & Remote Exploration",
      description: "14 Days Continuous 12h Mining Shift -> 14 Days Offsite Rest & Home Leave",
      nightShiftPremium: "+30% Night Differential",
      hazardAllowance: "KES 3,500 / Day Underground Mining Hazard Stipend",
      crews: [
        { name: "Mining Drill Crew 1 (On-Site)", currentPhase: "Active Shift (Day 8 of 14)", shiftHours: "12 Hours", headCount: 24 },
        { name: "Mining Drill Crew 2 (Off-Site)", currentPhase: "Rest & Recovery Leave (Day 3 of 14)", shiftHours: "0 Hours", headCount: 24 },
      ],
    },
  ];

  const [activePatternId, setActivePatternId] = useState<string>("pat-1");
  const selectedPattern = patterns.find((p) => p.id === activePatternId) || patterns[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <HardHat className="h-5 w-5 text-amber-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              24/7 Continuous Shift Rotations & Mining FIFO Logistics
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
              Fatigue & Labor Law Compliant
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Continental 3-shift rotations, 14/14 Mining FIFO rosters, automated rest-period compliance (12h minimum), and shift differential payroll premiums
          </p>
        </div>

        {/* Pattern Switcher */}
        <div className="flex p-0.5 rounded-xl bg-zinc-950 border border-zinc-800">
          {patterns.map((p) => (
            <button
              key={p.id}
              onClick={() => setActivePatternId(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activePatternId === p.id
                  ? "bg-amber-500 text-zinc-950 shadow-md font-bold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {p.code}
            </button>
          ))}
        </div>
      </div>

      {/* Pattern Details Banner */}
      <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{selectedPattern.name}</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                {selectedPattern.cycleDays}-Day Recurring Master Cycle
              </span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">{selectedPattern.description}</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              12h Rest Guaranteed
            </span>
          </div>
        </div>

        {/* Live Crew Cohorts Active in the Rotation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {selectedPattern.crews.map((crew, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-200">{crew.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                  {crew.headCount} Operators
                </span>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Current Live Status:</p>
                <p className="text-xs font-medium text-amber-300 mt-0.5 flex items-center gap-1.5">
                  <RotateCw className="h-3 w-3 text-amber-400 animate-spin" />
                  {crew.currentPhase}
                </p>
              </div>
              <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400">
                <span>Duration:</span>
                <span className="font-semibold text-zinc-300">{crew.shiftHours}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shift Differential & Payroll Premiums Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4 text-indigo-400" />
            <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
              Shift Differential & Night Premium Calculation
            </h4>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Workers assigned to night cycles (16:00–00:00 or 00:00–08:00) automatically receive the {selectedPattern.nightShiftPremium} computed against their base hourly contract rate, seamlessly bridging to the monthly payroll engine without manual spreadsheet intervention.
          </p>
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs flex items-center justify-between">
            <span className="text-zinc-400">Applied Premium Multiplier:</span>
            <span className="font-bold text-indigo-400 font-mono">{selectedPattern.nightShiftPremium}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-400" />
            <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
              Industrial Hazard & Environmental Allowances
            </h4>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Heavy industrial and mining shifts specify site-specific environmental hardship rates. Timeclock GPS punches inside registered blast/underground zones auto-trigger hazard allowances directly into the employee’s compensation structure.
          </p>
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs flex items-center justify-between">
            <span className="text-zinc-400">Hazard Rate Policy:</span>
            <span className="font-bold text-amber-400 font-mono">{selectedPattern.hazardAllowance}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
