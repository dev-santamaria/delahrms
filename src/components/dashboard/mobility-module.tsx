"use client";

import React, { useState } from "react";
import {
  Globe2,
  Plane,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  FileCheck2,
  Clock,
  MapPin,
} from "lucide-react";

interface VisaCase {
  id: string;
  employeeName: string;
  destinationCountry: string;
  countryFlag: string;
  visaType: string;
  status: "approved_issued" | "in_consulate_review" | "document_collection";
  validUntil: string;
  dependentsCount: number;
}

interface TaxPresence {
  jurisdiction: string;
  flag: string;
  daysPresent: number;
  maxDaysLimit: number;
  taxResidencyRisk: "low" | "moderate" | "high";
}

export function MobilityModule() {
  const [cases] = useState<VisaCase[]>([
    {
      id: "visa-001",
      employeeName: "Nelson Mandela CP",
      destinationCountry: "Kenya",
      countryFlag: "🇰🇪",
      visaType: "Class D Employment Permit",
      status: "approved_issued",
      validUntil: "2027-08-31",
      dependentsCount: 2,
    },
    {
      id: "visa-002",
      employeeName: "Amina Odhiambo",
      destinationCountry: "United Kingdom",
      countryFlag: "🇬🇧",
      visaType: "Skilled Worker Visa (Global Tech Talent)",
      status: "in_consulate_review",
      validUntil: "2028-03-15",
      dependentsCount: 0,
    },
    {
      id: "visa-003",
      employeeName: "David Kiprono",
      destinationCountry: "United Arab Emirates",
      countryFlag: "🇦🇪",
      visaType: "Remote Worker Green Residence",
      status: "document_collection",
      validUntil: "2026-12-31",
      dependentsCount: 1,
    },
  ]);

  const [taxPresence] = useState<TaxPresence[]>([
    { jurisdiction: "Kenya", flag: "🇰🇪", daysPresent: 142, maxDaysLimit: 183, taxResidencyRisk: "moderate" },
    { jurisdiction: "United Kingdom", flag: "🇬🇧", daysPresent: 38, maxDaysLimit: 183, taxResidencyRisk: "low" },
    { jurisdiction: "Schengen Zone", flag: "🇪🇺", daysPresent: 26, maxDaysLimit: 90, taxResidencyRisk: "low" },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Globe2 className="h-5 w-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Global Mobility & 183-Day Tax Presence Monitor
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
              100+ Jurisdictions Supported
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Immigration case management, legal document collection, and international physical presence alerts to prevent unintended tax establishment
          </p>
        </div>
      </div>

      {/* 183-Day International Physical Tax Presence Tracker */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
              183-Day International Tax Presence Monitor (Calendar Year 2026)
            </h3>
          </div>
          <span className="text-[11px] text-zinc-400">Prevents Permanent Corporate Tax Establishment</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {taxPresence.map((tp, i) => {
            const percentage = Math.round((tp.daysPresent / tp.maxDaysLimit) * 100);
            return (
              <div key={i} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                    <span className="text-lg leading-none">{tp.flag}</span>
                    <span>{tp.jurisdiction}</span>
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      tp.taxResidencyRisk === "high"
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        : tp.taxResidencyRisk === "moderate"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    }`}
                  >
                    {tp.taxResidencyRisk} Risk
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-zinc-400">Physical Days Spent:</span>
                    <span className="text-zinc-200 font-bold">
                      {tp.daysPresent} / {tp.maxDaysLimit} Days
                    </span>
                  </div>
                  <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        percentage > 80
                          ? "bg-rose-500"
                          : percentage > 60
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                <p className="text-[10px] text-zinc-400">
                  {tp.maxDaysLimit - tp.daysPresent} days remaining before triggering local individual tax residency
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Immigration Cases Table */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
            Active Immigration & Relocation Cases ({cases.length})
          </h3>
          <span className="text-[11px] text-zinc-400">Monitored by Global Mobility Legal Counsel</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/60 text-zinc-400 text-[11px] border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-3">Destination Country</th>
                <th className="py-3 px-3">Visa Classification</th>
                <th className="py-3 px-3 text-center">Family Dependents</th>
                <th className="py-3 px-3">Validity Expiry</th>
                <th className="py-3 px-4 text-right">Case Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {cases.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-800/30 transition">
                  <td className="py-3.5 px-4 font-semibold text-zinc-200">{c.employeeName}</td>
                  <td className="py-3.5 px-3">
                    <span className="inline-flex items-center gap-1.5 text-zinc-200 font-medium">
                      <span className="text-base leading-none">{c.countryFlag}</span>
                      <span>{c.destinationCountry}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-zinc-300">{c.visaType}</td>
                  <td className="py-3.5 px-3 text-center font-mono text-zinc-300">
                    {c.dependentsCount > 0 ? `${c.dependentsCount} Dependents` : "None (Individual)"}
                  </td>
                  <td className="py-3.5 px-3 font-mono text-zinc-300">{c.validUntil}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span
                      className={`text-[10px] px-2.5 py-1 rounded-full font-semibold capitalize ${
                        c.status === "approved_issued"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : c.status === "in_consulate_review"
                          ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {c.status === "approved_issued"
                        ? "Permit Issued"
                        : c.status === "in_consulate_review"
                        ? "Consulate Review"
                        : "Document Collection"}
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
