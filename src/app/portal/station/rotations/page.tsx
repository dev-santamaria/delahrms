"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Repeat,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Users,
  CheckCircle2,
  Plus,
  Calendar,
  Layers,
  Sparkles,
  Zap,
  ArrowRight,
  Info,
  X,
} from "lucide-react";
import { usePortal } from "@/components/portal/portal-context";

interface ShiftPattern {
  id: string;
  name: string;
  code: string;
  category: "continuous_24_7" | "mining_fifo";
  cycleDays: number;
  crewsCount: number;
  multiplier: number;
  allowance: number;
  description: string;
}

interface CrewGroup {
  id: string;
  name: string;
  headcount: number;
  currentDuty: "morning" | "afternoon" | "night" | "rest";
  nextRotationDate: string;
  fatigueScore: number;
  restIntervalHours: number;
}

export default function ShiftRotationsPage() {
  const { entityInfo } = usePortal();

  const [patterns] = useState<ShiftPattern[]>([
    {
      id: "pat-1",
      name: "Continental 24/7 Continuous 3-Shift Pattern",
      code: "SHIFT-CONT-247",
      category: "continuous_24_7",
      cycleDays: 28,
      crewsCount: 4,
      multiplier: 1.25,
      allowance: 0,
      description: "4-crew rotation providing uninterrupted 24/7 industrial plant coverage with automated 12h rest interlocks.",
    },
    {
      id: "pat-2",
      name: "Mining FIFO 14/14 Continuous Roster",
      code: "SHIFT-FIFO-1414",
      category: "mining_fifo",
      cycleDays: 28,
      crewsCount: 2,
      multiplier: 1.0,
      allowance: 3500,
      description: "Fly-in Fly-out rotation with 14 consecutive 12-hour work shifts followed by 14 days field rest with daily hazard pay.",
    },
  ]);

  const [crews, setCrews] = useState<CrewGroup[]>([
    {
      id: "cr-1",
      name: "Crew A (Morning Turnaround)",
      headcount: 120,
      currentDuty: "morning",
      nextRotationDate: "Sep 22, 2026",
      fatigueScore: 100,
      restIntervalHours: 16.0,
    },
    {
      id: "cr-2",
      name: "Crew B (Afternoon Industrial)",
      headcount: 118,
      currentDuty: "afternoon",
      nextRotationDate: "Sep 22, 2026",
      fatigueScore: 100,
      restIntervalHours: 16.0,
    },
    {
      id: "cr-3",
      name: "Crew C (Night FIFO Overrun)",
      headcount: 95,
      currentDuty: "night",
      nextRotationDate: "Sep 22, 2026",
      fatigueScore: 98,
      restIntervalHours: 14.5,
    },
    {
      id: "cr-4",
      name: "Crew D (Scheduled Rest Interval)",
      headcount: 110,
      currentDuty: "rest",
      nextRotationDate: "Sep 20, 2026",
      fatigueScore: 100,
      restIntervalHours: 48.0,
    },
  ]);

  const [newRuleModalOpen, setNewRuleModalOpen] = useState(false);
  const [ruleName, setRuleName] = useState("");
  const [rulePattern, setRulePattern] = useState("SHIFT-CONT-247");
  const [minRestInterval, setMinRestInterval] = useState(12);

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    setNewRuleModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
              Plant Shift Operations
            </span>
            <span className="text-xs font-mono text-[var(--gray-muted)]">
              Continental & FIFO Patterns
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--gray-text)] mt-1">
            24/7 Continuous Shift Rotations & Fatigue Guard
          </h1>
          <p className="text-xs text-[var(--gray-muted)] mt-0.5">
            Automated 28-day continuous shift schedules with mandatory 12-hour rest fatigue interlocks preventing scheduling violations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setNewRuleModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[var(--emerald-deep)] text-white text-xs font-bold hover:bg-[var(--emerald-deep-hover)] shadow-xs transition flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Configure Shift Pattern</span>
          </button>
        </div>
      </div>

      {/* 2. 12-Hour Rest Fatigue Guard Spotlight Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-900 to-teal-900 text-white shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-white/10 text-emerald-300 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">12-Hour Rest Fatigue Guard Interlock</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                  Zero Violations Active
                </span>
              </div>
              <p className="text-xs text-emerald-100/80 mt-0.5">
                Statutory industrial safety lock: Any roster assignment with less than 12.0 hours rest interval is blocked before supervisor sign-off.
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-2xl font-mono font-extrabold text-emerald-300">100%</span>
            <p className="text-[10px] text-emerald-200 font-mono">Rest Compliance Score</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/10 text-xs">
          <div>
            <span className="text-emerald-300/80 text-[10px] uppercase font-mono">Min Interval Allowed</span>
            <p className="font-bold text-sm font-mono">12.0 Hours</p>
          </div>
          <div>
            <span className="text-emerald-300/80 text-[10px] uppercase font-mono">Average Crew Rest</span>
            <p className="font-bold text-sm font-mono">15.5 Hours</p>
          </div>
          <div>
            <span className="text-emerald-300/80 text-[10px] uppercase font-mono">Night Multiplier</span>
            <p className="font-bold text-sm font-mono">1.25x Hourly</p>
          </div>
          <div>
            <span className="text-emerald-300/80 text-[10px] uppercase font-mono">Mining FIFO Daily Hazard</span>
            <p className="font-bold text-sm font-mono">KES 3,500 / day</p>
          </div>
        </div>
      </div>

      {/* 3. Shift Patterns Master Catalog */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-[var(--gray-text)]">
          Standard Enterprise Shift Patterns
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {patterns.map((pat) => (
            <div
              key={pat.id}
              className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[var(--emerald-deep)]">{pat.code}</span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 uppercase">
                    {pat.category.replace("_", " ")}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--gray-text)]">{pat.name}</h3>
                  <p className="text-xs text-[var(--gray-muted)] mt-1 leading-relaxed">{pat.description}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 text-xs">
                  <div className="p-2.5 rounded-xl bg-[var(--cool-gray)]">
                    <span className="text-[9px] text-[var(--gray-muted)] uppercase">Cycle Days</span>
                    <p className="font-bold font-mono text-[var(--gray-text)]">{pat.cycleDays} Days</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[var(--cool-gray)]">
                    <span className="text-[9px] text-[var(--gray-muted)] uppercase">Active Crews</span>
                    <p className="font-bold font-mono text-[var(--gray-text)]">{pat.crewsCount} Crews</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[var(--cool-gray)]">
                    <span className="text-[9px] text-[var(--gray-muted)] uppercase">Night Rate</span>
                    <p className="font-bold font-mono text-[var(--emerald-deep)]">{pat.multiplier}x</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-[var(--gray-muted)]">Fatigue Interlock: <strong>Enforced</strong></span>
                <button
                  type="button"
                  className="text-xs font-bold text-[var(--emerald-deep)] hover:underline flex items-center gap-1"
                >
                  <span>View 28-Day Matrix</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Live Crew Rotation Status Matrix */}
      <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[var(--gray-text)]">
              Station Crew Duty & Rest Interval Matrix
            </h2>
            <p className="text-xs text-[var(--gray-muted)]">
              Real-time rest intervals and fatigue compliance tracked across plant crews.
            </p>
          </div>
          <span className="text-xs font-bold text-[var(--emerald-deep)] bg-emerald-100 px-2.5 py-1 rounded-full">
            443 Total Crew Headcount
          </span>
        </div>

        <div className="divide-y divide-gray-100">
          {crews.map((crew) => (
            <div key={crew.id} className="py-4 first:pt-0 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-[var(--cool-gray)] border border-[var(--gray-border)] flex items-center justify-center font-bold text-xs shrink-0">
                  {crew.name.split(" ")[1]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[var(--gray-text)]">{crew.name}</h3>
                    <span className="text-[10px] font-mono text-[var(--gray-muted)] font-semibold">
                      ({crew.headcount} Operators)
                    </span>
                  </div>
                  <p className="text-xs text-[var(--gray-muted)]">Next Rotation Handover: {crew.nextRotationDate}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 self-end md:self-center text-xs">
                <div>
                  <span className="text-[10px] text-[var(--gray-muted)]">Rest Interval:</span>
                  <p className="font-mono font-bold text-[var(--emerald-deep)]">{crew.restIntervalHours.toFixed(1)} Hours</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-[var(--gray-muted)]">Current Assignment:</span>
                  <p className={`font-bold capitalize ${
                    crew.currentDuty === "morning"
                      ? "text-blue-600"
                      : crew.currentDuty === "afternoon"
                      ? "text-[var(--emerald-deep)]"
                      : crew.currentDuty === "night"
                      ? "text-purple-600"
                      : "text-gray-500"
                  }`}>
                    {crew.currentDuty} Shift
                  </p>
                </div>

                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {crew.fatigueScore}% Compliant
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Configure Pattern Modal */}
      {newRuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="w-full max-w-md rounded-3xl bg-white border border-[var(--gray-border)] shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-[var(--gray-text)] flex items-center gap-2">
                <Repeat className="h-5 w-5 text-[var(--emerald-deep)]" />
                <span>Configure Shift Rotation Pattern</span>
              </h3>
              <button type="button" onClick={() => setNewRuleModalOpen(false)} className="p-1 text-gray-400">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--gray-text)]">Pattern Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kisumu Depot 2-Crew 12h Alternating"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--gray-border)] bg-gray-50 focus:outline-none focus:border-[var(--emerald-deep)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--gray-text)]">Base Pattern Type</label>
                <select
                  value={rulePattern}
                  onChange={(e) => setRulePattern(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--gray-border)] bg-gray-50 focus:outline-none focus:border-[var(--emerald-deep)]"
                >
                  <option value="SHIFT-CONT-247">Continental 24/7 Continuous 3-Shift Pattern</option>
                  <option value="SHIFT-FIFO-1414">Mining FIFO 14/14 Continuous Roster</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--gray-text)]">Mandatory Rest Interval (Hours)</label>
                <input
                  type="number"
                  min={12}
                  value={minRestInterval}
                  onChange={(e) => setMinRestInterval(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-[var(--gray-border)] bg-gray-50 focus:outline-none focus:border-[var(--emerald-deep)]"
                />
                <span className="text-[10px] text-emerald-800">
                  Minimum statutory requirement is 12.0 hours. System interlocks prevent lower thresholds.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewRuleModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-bold text-[var(--gray-muted)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-bold shadow-xs"
                >
                  Save Shift Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
