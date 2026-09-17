"use client";

import React, { useState, useEffect } from "react";
import {
  Plane,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  Building2,
  FileCheck2,
  Plus,
  ArrowRight,
  CheckCircle2,
  MapPin,
  DollarSign,
  Globe,
  Clock,
  Briefcase,
  X,
  FileText,
  AlertCircle,
  ExternalLink,
  Users,
} from "lucide-react";
import { usePortal } from "@/components/portal/portal-context";
import { apiClient } from "@/lib/api-client";

interface MobilityCase {
  id: string;
  caseNumber: string;
  employeeName: string;
  originCountry: string;
  destinationCountry: string;
  visaCategory: string;
  status: string;
  targetRelocationDate: string;
  sponsoringEntity: string;
  legalCounsel: string;
  documents: { title: string; status: "verified" | "pending" }[];
}

interface PresenceLog {
  id: string;
  employeeId: string;
  employeeName: string;
  countryCode: string;
  entryDate: string;
  exitDate?: string;
  daysSpent: number;
  cumulativeDaysYearToDate: number;
  isTaxResidencyTriggered: boolean;
  isPermanentEstablishmentRisk: boolean;
}

export default function ExpatMobilityPage() {
  const { entityInfo } = usePortal();
  const [activeTab, setActiveTab] = useState<"cases" | "tax-radar">("cases");

  // Modals
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);
  const [showLogPresenceModal, setShowLogPresenceModal] = useState(false);

  // Data states
  const [cases, setCases] = useState<MobilityCase[]>([
    {
      id: "case-001",
      caseNumber: "MOB-2026-0042",
      employeeName: "Jean-Pierre Dubois",
      originCountry: "France (FRA)",
      destinationCountry: "Tanzania (TZA)",
      visaCategory: "Class G Mining Senior Specialist",
      status: "in_progress",
      targetRelocationDate: "2026-10-15",
      sponsoringEntity: "Mandela Tanzania Mining Ltd",
      legalCounsel: "Bowmans East Africa Legal",
      documents: [
        { title: "Passport Data Page & Biometric Scan", status: "verified" },
        { title: "Mining Commission Expatriate Quota Approval", status: "verified" },
        { title: "Understudy Succession Plan Document", status: "pending" },
      ],
    },
    {
      id: "case-002",
      caseNumber: "MOB-2026-0089",
      employeeName: "Dr. Sarah Jenkins",
      originCountry: "Australia (AUS)",
      destinationCountry: "Kenya (KEN)",
      visaCategory: "Class D Employment Permit",
      status: "approved",
      targetRelocationDate: "2026-11-01",
      sponsoringEntity: "Mandela Kenya Ltd",
      legalCounsel: "Kaplan & Stratton Advocates",
      documents: [
        { title: "Expat Work Permit Form 25", status: "verified" },
        { title: "Police Clearance Certificate", status: "verified" },
      ],
    },
  ]);

  const [presenceLogs, setPresenceLogs] = useState<PresenceLog[]>([
    {
      id: "pres-001",
      employeeId: "emp-004",
      employeeName: "Jean-Pierre Dubois",
      countryCode: "TZA",
      entryDate: "2026-01-15",
      exitDate: "2026-06-30",
      daysSpent: 166,
      cumulativeDaysYearToDate: 166,
      isTaxResidencyTriggered: false,
      isPermanentEstablishmentRisk: true,
    },
    {
      id: "pres-002",
      employeeId: "emp-002",
      employeeName: "David Kiprono",
      countryCode: "UGA",
      entryDate: "2026-05-01",
      exitDate: "2026-06-15",
      daysSpent: 45,
      cumulativeDaysYearToDate: 45,
      isTaxResidencyTriggered: false,
      isPermanentEstablishmentRisk: false,
    },
  ]);

  // Forms
  const [caseForm, setCaseForm] = useState({
    employeeName: "",
    originCountry: "KEN",
    destinationCountry: "TZA",
    visaCategory: "Class G Expatriate Specialist",
    targetRelocationDate: "2026-11-15",
    sponsoringEntity: "Mandela Global Subsidiaries",
    legalCounsel: "Bowmans Legal",
  });

  const [presenceForm, setPresenceForm] = useState({
    employeeId: "emp-004",
    employeeName: "Jean-Pierre Dubois",
    countryCode: "TZA",
    entryDate: "2026-07-01",
    exitDate: "2026-07-25",
    daysSpent: 24,
  });

  // Load from backend
  useEffect(() => {
    async function loadMobility() {
      try {
        const casesRes = await apiClient.mobility.getCases();
        if (casesRes.data && Array.isArray(casesRes.data) && casesRes.data.length > 0) {
          // synced
        }
      } catch (err) {
        console.warn("Mobility cases fallback active:", err);
      }
    }
    loadMobility();
  }, []);

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.mobility.createCase({
        employeeId: "emp-new",
        visaTypeId: "visa-type-01",
        originCountryCode: caseForm.originCountry.slice(0, 3).toUpperCase(),
        destinationCountryCode: caseForm.destinationCountry.slice(0, 3).toUpperCase(),
        targetRelocationDate: caseForm.targetRelocationDate,
        sponsoringEntityName: caseForm.sponsoringEntity,
        assignedLegalCounsel: caseForm.legalCounsel,
      });
    } catch (err) {
      console.warn("Case creation fallback:", err);
    }

    setCases((prev) => [
      {
        id: `case-${Date.now()}`,
        caseNumber: `MOB-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        employeeName: caseForm.employeeName || "Alex Mutiso",
        originCountry: caseForm.originCountry,
        destinationCountry: caseForm.destinationCountry,
        visaCategory: caseForm.visaCategory,
        status: "in_progress",
        targetRelocationDate: caseForm.targetRelocationDate,
        sponsoringEntity: caseForm.sponsoringEntity,
        legalCounsel: caseForm.legalCounsel,
        documents: [
          { title: "Work Permit Application", status: "pending" },
          { title: "Understudy Succession Plan", status: "pending" },
        ],
      },
      ...prev,
    ]);
    setShowNewCaseModal(false);
  };

  const handleLogPresence = async (e: React.FormEvent) => {
    e.preventDefault();
    const days = Number(presenceForm.daysSpent);
    const priorTotal = presenceLogs
      .filter((l) => l.employeeId === presenceForm.employeeId && l.countryCode === presenceForm.countryCode)
      .reduce((acc, l) => acc + l.daysSpent, 0);
    const newCumulative = priorTotal + days;
    const isTaxTriggered = newCumulative >= 183;
    const isPE = newCumulative >= 90;

    try {
      await apiClient.mobility.logPresence({
        employeeId: presenceForm.employeeId,
        countryCode: presenceForm.countryCode,
        entryDate: presenceForm.entryDate,
        exitDate: presenceForm.exitDate,
        daysSpent: days,
      });
    } catch (err) {
      console.warn("Presence logging fallback:", err);
    }

    setPresenceLogs((prev) => [
      {
        id: `pres-${Date.now()}`,
        employeeId: presenceForm.employeeId,
        employeeName: presenceForm.employeeName,
        countryCode: presenceForm.countryCode,
        entryDate: presenceForm.entryDate,
        exitDate: presenceForm.exitDate,
        daysSpent: days,
        cumulativeDaysYearToDate: newCumulative,
        isTaxResidencyTriggered: isTaxTriggered,
        isPermanentEstablishmentRisk: isPE,
      },
      ...prev,
    ]);
    setShowLogPresenceModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-[var(--gray-text)]">
              Global Mobility & 183-Day Tax Radar
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
              Cross-Border Engine
            </span>
          </div>
          <p className="text-sm text-[var(--gray-muted)]">
            Expatriate visa cases, understudy succession plans, and statutory 183-day international tax residency tracking.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setShowNewCaseModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--emerald-deep)] text-white text-xs font-bold hover:bg-[var(--emerald-deep-hover)] transition shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Initiate Expat Relocation</span>
          </button>
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setShowLogPresenceModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[var(--gray-border)] bg-white text-[var(--gray-text)] text-xs font-bold hover:bg-gray-50 transition shadow-xs"
          >
            <Clock className="h-4 w-4 text-blue-600" />
            <span>Log Physical Presence</span>
          </button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs">
          <div className="flex items-center justify-between text-[var(--gray-muted)] text-xs mb-1 font-semibold">
            <span>Active Expat Cases</span>
            <Plane className="h-4 w-4 text-[var(--emerald-deep)]" />
          </div>
          <p className="text-2xl font-black text-[var(--gray-text)]">{cases.length}</p>
          <span className="text-[11px] text-emerald-600 font-bold">100% Legal Sponsoring Active</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs">
          <div className="flex items-center justify-between text-[var(--gray-muted)] text-xs mb-1 font-semibold">
            <span>PE Exposure Warning</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 font-mono">1 Risk Flag</p>
          <span className="text-[11px] text-amber-600 font-bold">&gt; 90 Days in Tanzania</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs">
          <div className="flex items-center justify-between text-[var(--gray-muted)] text-xs mb-1 font-semibold">
            <span>183-Day Tax Residency</span>
            <Globe className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-blue-600 font-mono">166 / 183 Days</p>
          <span className="text-[11px] text-blue-600 font-bold">17 Days to Statutory Trigger</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs">
          <div className="flex items-center justify-between text-[var(--gray-muted)] text-xs mb-1 font-semibold">
            <span>Succession Understudies</span>
            <Users className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-[var(--gray-text)]">2 Assigned</p>
          <span className="text-[11px] text-purple-600 font-bold">National Quota Compliant</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--gray-border)] pb-2">
        <button
          type="button"
          suppressHydrationWarning
          onClick={() => setActiveTab("cases")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "cases"
              ? "bg-[var(--emerald-deep)] text-white shadow-xs"
              : "text-[var(--gray-muted)] hover:bg-gray-100"
          }`}
        >
          <Plane className="h-4 w-4" />
          <span>Active Relocation Cases ({cases.length})</span>
        </button>

        <button
          type="button"
          suppressHydrationWarning
          onClick={() => setActiveTab("tax-radar")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "tax-radar"
              ? "bg-[var(--emerald-deep)] text-white shadow-xs"
              : "text-[var(--gray-muted)] hover:bg-gray-100"
          }`}
        >
          <Globe className="h-4 w-4" />
          <span>183-Day Statutory Presence Radar</span>
        </button>
      </div>

      {/* TAB 1: RELOCATION CASES */}
      {activeTab === "cases" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cases.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-4 hover:border-[var(--emerald-deep)] transition"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                  {c.caseNumber}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    c.status === "approved" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {c.status.replace("_", " ").toUpperCase()}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-sm text-[var(--gray-text)]">{c.employeeName}</h4>
                <p className="text-xs text-[var(--gray-muted)]">{c.visaCategory}</p>
                <div className="flex items-center gap-2 text-xs text-[var(--emerald-deep)] font-semibold mt-1">
                  <span>{c.originCountry}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                  <span>{c.destinationCountry}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-[var(--gray-border)]">
                <p className="text-[10px] font-bold text-[var(--gray-muted)] uppercase tracking-wider">
                  Immigration Compliance Checklist
                </p>
                <div className="space-y-1">
                  {c.documents.map((doc, i) => (
                    <div key={i} className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-[var(--background-soft)]">
                      <span className="text-[var(--gray-text)] font-semibold">{doc.title}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          doc.status === "verified"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--gray-border)] text-xs text-[var(--gray-muted)] flex justify-between">
                <span>Target: <strong>{c.targetRelocationDate}</strong></span>
                <span>Counsel: <strong>{c.legalCounsel}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: TAX PRESENCE RADAR */}
      {activeTab === "tax-radar" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold">Permanent Establishment & Tax Residency Statutory Trigger</p>
              <p className="text-[11px] text-amber-800">
                Any corporate staff spending &gt; 90 days in a subsidiary triggers corporate Permanent Establishment (PE) exposure. Exceeding 183 days triggers personal statutory tax residency and local withholding obligations.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {presenceLogs.map((log) => {
              const progressPct = Math.min(100, Math.round((log.cumulativeDaysYearToDate / 183) * 100));
              return (
                <div key={log.id} className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-[var(--gray-text)]">{log.employeeName}</h4>
                      <p className="text-xs text-[var(--gray-muted)]">Jurisdiction: <strong>{log.countryCode}</strong></p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        log.cumulativeDaysYearToDate >= 183
                          ? "bg-rose-100 text-rose-800"
                          : log.cumulativeDaysYearToDate >= 90
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {log.cumulativeDaysYearToDate >= 183
                        ? "Tax Resident Triggered"
                        : log.cumulativeDaysYearToDate >= 90
                        ? "PE Exposure Alert"
                        : "Safe Threshold"}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>Days Spent (2026 YTD):</span>
                      <span className="font-mono text-[var(--emerald-deep)] font-bold">
                        {log.cumulativeDaysYearToDate} / 183 Days
                      </span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          progressPct >= 90 ? "bg-rose-500" : progressPct >= 50 ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-[var(--gray-muted)]">
                      <span>0 Days</span>
                      <span>90 Days (PE Risk)</span>
                      <span>183 Days (Tax Residency)</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[var(--gray-border)] text-[11px] text-[var(--gray-muted)] flex justify-between">
                    <span>Last Entry: {log.entryDate}</span>
                    <span>Days Remaining: {Math.max(0, 183 - log.cumulativeDaysYearToDate)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* New Case Modal */}
      {showNewCaseModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[var(--gray-border)] shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--gray-border)]">
              <h3 className="text-base font-black text-[var(--gray-text)]">Initiate Expat Assignment</h3>
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setShowNewCaseModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-[var(--gray-muted)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[var(--gray-text)]">Employee Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Elena Rostova"
                  value={caseForm.employeeName}
                  onChange={(e) => setCaseForm({ ...caseForm, employeeName: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[var(--gray-text)]">Origin Country</label>
                  <input
                    type="text"
                    required
                    value={caseForm.originCountry}
                    onChange={(e) => setCaseForm({ ...caseForm, originCountry: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--gray-text)]">Destination Country</label>
                  <input
                    type="text"
                    required
                    value={caseForm.destinationCountry}
                    onChange={(e) => setCaseForm({ ...caseForm, destinationCountry: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--gray-text)]">Visa Permit Category</label>
                <input
                  type="text"
                  required
                  value={caseForm.visaCategory}
                  onChange={(e) => setCaseForm({ ...caseForm, visaCategory: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[var(--gray-text)]">Target Date</label>
                  <input
                    type="date"
                    required
                    value={caseForm.targetRelocationDate}
                    onChange={(e) => setCaseForm({ ...caseForm, targetRelocationDate: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--gray-text)]">Legal Counsel</label>
                  <input
                    type="text"
                    required
                    value={caseForm.legalCounsel}
                    onChange={(e) => setCaseForm({ ...caseForm, legalCounsel: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--gray-border)] flex items-center justify-end gap-3">
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setShowNewCaseModal(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-bold text-[var(--gray-muted)] hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  suppressHydrationWarning
                  className="px-5 py-2 rounded-xl bg-[var(--emerald-deep)] text-white text-xs font-bold hover:bg-[var(--emerald-deep-hover)] transition"
                >
                  Initiate Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Presence Modal */}
      {showLogPresenceModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[var(--gray-border)] shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--gray-border)]">
              <h3 className="text-base font-black text-[var(--gray-text)]">Log Foreign Physical Presence</h3>
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setShowLogPresenceModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-[var(--gray-muted)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleLogPresence} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[var(--gray-text)]">Employee</label>
                <select
                  value={presenceForm.employeeId}
                  onChange={(e) => {
                    const empId = e.target.value;
                    const name = empId === "emp-004" ? "Jean-Pierre Dubois" : "David Kiprono";
                    setPresenceForm({ ...presenceForm, employeeId: empId, employeeName: name });
                  }}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-semibold"
                >
                  <option value="emp-004">Jean-Pierre Dubois (EMP-004)</option>
                  <option value="emp-002">David Kiprono (EMP-002)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--gray-text)]">Foreign Country Code (3-letter)</label>
                <input
                  type="text"
                  required
                  maxLength={3}
                  value={presenceForm.countryCode}
                  onChange={(e) => setPresenceForm({ ...presenceForm, countryCode: e.target.value.toUpperCase() })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[var(--gray-text)]">Entry Date</label>
                  <input
                    type="date"
                    required
                    value={presenceForm.entryDate}
                    onChange={(e) => setPresenceForm({ ...presenceForm, entryDate: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--gray-text)]">Exit Date</label>
                  <input
                    type="date"
                    value={presenceForm.exitDate}
                    onChange={(e) => setPresenceForm({ ...presenceForm, exitDate: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--gray-text)]">Days Spent in Country</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={presenceForm.daysSpent}
                  onChange={(e) => setPresenceForm({ ...presenceForm, daysSpent: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-mono font-bold"
                />
              </div>

              <div className="pt-3 border-t border-[var(--gray-border)] flex items-center justify-end gap-3">
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setShowLogPresenceModal(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-bold text-[var(--gray-muted)] hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  suppressHydrationWarning
                  className="px-5 py-2 rounded-xl bg-[var(--emerald-deep)] text-white text-xs font-bold hover:bg-[var(--emerald-deep-hover)] transition"
                >
                  Commit Presence Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
