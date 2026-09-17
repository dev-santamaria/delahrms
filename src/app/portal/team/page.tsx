"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  MapPin,
  Clock,
  Calendar,
  ShieldCheck,
  Award,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Phone,
  Mail,
  Sliders,
  ChevronRight,
  UserCheck,
  X,
} from "lucide-react";
import { usePortal } from "@/components/portal/portal-context";

interface TeamMember {
  id: string;
  code: string;
  name: string;
  role: string;
  station: string;
  shiftGroup: string;
  status: "on_duty" | "off_duty" | "on_leave" | "rest_interval";
  clockInTime?: string;
  phone: string;
  email: string;
  avatarColor: string;
}

interface DelegationRule {
  id: string;
  proxyName: string;
  proxyCode: string;
  startDate: string;
  endDate: string;
  financialCapUsd: number;
  status: "active" | "scheduled" | "revoked";
  scope: string[];
}

export default function MyTeamPage() {
  const { entityInfo, personaInfo } = usePortal();

  const [searchQuery, setSearchQuery] = useState("");
  const [delegationModalOpen, setDelegationModalOpen] = useState(false);
  const [delegations, setDelegations] = useState<DelegationRule[]>([
    {
      id: "del-01",
      proxyName: "Sarah Jenkins",
      proxyCode: "EMP-3104",
      startDate: "2026-10-10",
      endDate: "2026-10-18",
      financialCapUsd: 5000,
      status: "scheduled",
      scope: ["Leave Approvals", "Shift Swaps", "Expense Claims < $5,000"],
    },
  ]);

  const [teamMembers] = useState<TeamMember[]>([
    {
      id: "tm-1",
      code: "EMP-4091",
      name: "Nelson Mandela CP",
      role: "Principal Operations Engineer",
      station: "Nairobi Industrial Plant",
      shiftGroup: "Shift B (14:00 - 22:00)",
      status: "on_duty",
      clockInTime: "13:52 PM (Biometric Kiosk)",
      phone: "+254 712 345 678",
      email: "nmandela@delahr.africa",
      avatarColor: "bg-[var(--emerald-deep)]",
    },
    {
      id: "tm-2",
      code: "EMP-3104",
      name: "Sarah Jenkins",
      role: "Senior Plant Maintenance Lead",
      station: "Nairobi Industrial Plant",
      shiftGroup: "Shift A (06:00 - 14:00)",
      status: "rest_interval",
      clockInTime: "Shift Completed at 14:02 PM",
      phone: "+254 722 112 233",
      email: "sjenkins@delahr.africa",
      avatarColor: "bg-blue-600",
    },
    {
      id: "tm-3",
      code: "EMP-2190",
      name: "David Omondi",
      role: "Logistics Fleet Supervisor",
      station: "Kisumu Lake Basin Depot",
      shiftGroup: "Continental 3-Shift Pattern",
      status: "on_duty",
      clockInTime: "07:55 AM (GPS Geofence)",
      phone: "+254 733 998 877",
      email: "domondi@delahr.africa",
      avatarColor: "bg-purple-600",
    },
    {
      id: "tm-4",
      code: "EMP-5011",
      name: "Grace Muthoni",
      role: "Process Quality Technician",
      station: "Nairobi Industrial Plant",
      shiftGroup: "Shift C (22:00 - 06:00)",
      status: "off_duty",
      phone: "+254 711 445 566",
      email: "gmuthoni@delahr.africa",
      avatarColor: "bg-amber-600",
    },
    {
      id: "tm-5",
      code: "EMP-5019",
      name: "John Mwangi",
      role: "Electrical Automation Specialist",
      station: "Nairobi Industrial Plant",
      shiftGroup: "Shift B (14:00 - 22:00)",
      status: "on_leave",
      phone: "+254 720 334 455",
      email: "jmwangi@delahr.africa",
      avatarColor: "bg-rose-600",
    },
  ]);

  // Delegation form state
  const [proxyColleague, setProxyColleague] = useState("Sarah Jenkins (EMP-3104)");
  const [delStartDate, setDelStartDate] = useState("2026-11-01");
  const [delEndDate, setDelEndDate] = useState("2026-11-07");
  const [delCap, setDelCap] = useState("5000");

  const handleAddDelegation = (e: React.FormEvent) => {
    e.preventDefault();
    const newDel: DelegationRule = {
      id: `del-${Date.now()}`,
      proxyName: proxyColleague.split(" (")[0],
      proxyCode: proxyColleague.split("(")[1]?.replace(")", "") || "EMP-XXXX",
      startDate: delStartDate,
      endDate: delEndDate,
      financialCapUsd: Number(delCap),
      status: "scheduled",
      scope: ["Leave Approvals", "Shift Swaps", `Expense Claims < $${delCap}`],
    };
    setDelegations((prev) => [newDel, ...prev]);
    setDelegationModalOpen(false);
  };

  const handleRevokeDelegation = (id: string) => {
    setDelegations((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "revoked" } : d))
    );
  };

  const filteredMembers = teamMembers.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.station.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--emerald-light)] text-[var(--emerald-deep)]">
              Operations & Logistics Dept
            </span>
            <span className="text-xs font-mono text-[var(--gray-muted)]">
              • 5 Direct Reports
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--gray-text)] mt-1">
            Department Team & Attendance Roster
          </h1>
          <p className="text-xs text-[var(--gray-muted)] mt-0.5">
            Live shift tracking across stations, 12-hour rest fatigue compliance, and delegation of authority proxies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDelegationModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-white border border-[var(--gray-border)] hover:bg-[var(--cool-gray)] text-xs font-bold text-[var(--gray-text)] shadow-2xs transition flex items-center gap-1.5"
          >
            <Award className="h-4 w-4 text-[var(--emerald-deep)]" />
            <span>Delegate Authority (DoA)</span>
          </button>

          <Link
            href="/portal/approvals"
            className="px-4 py-2 rounded-xl bg-[var(--emerald-deep)] text-white text-xs font-bold hover:bg-[var(--emerald-deep-hover)] shadow-xs transition flex items-center gap-1.5"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Open Approvals Queue</span>
          </Link>
        </div>
      </div>

      {/* 2. Department Quick Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--gray-muted)]">Total Direct Reports</span>
          <p className="text-2xl font-extrabold text-[var(--gray-text)] font-mono">{teamMembers.length}</p>
          <p className="text-[10px] text-zinc-400">Nairobi & Kisumu Enclaves</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Currently On Duty</span>
          <p className="text-2xl font-extrabold text-[var(--emerald-deep)] font-mono">
            {teamMembers.filter((m) => m.status === "on_duty").length}
          </p>
          <p className="text-[10px] text-emerald-700">GPS & Kiosk Verified</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800">Mandatory Rest Period</span>
          <p className="text-2xl font-extrabold text-purple-700 font-mono">
            {teamMembers.filter((m) => m.status === "rest_interval").length}
          </p>
          <p className="text-[10px] text-purple-600">12h Guard Enforced</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Approved Leave</span>
          <p className="text-2xl font-extrabold text-amber-700 font-mono">
            {teamMembers.filter((m) => m.status === "on_leave").length}
          </p>
          <p className="text-[10px] text-amber-600">Returning next Monday</p>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-[var(--gray-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search team members by name, role, station, or employee ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-[var(--gray-border)] text-xs text-[var(--gray-text)] placeholder:text-[var(--gray-muted)] focus:outline-none focus:border-[var(--emerald-deep)] shadow-2xs"
          />
        </div>
      </div>

      {/* 4. Team Members Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((member) => {
          const isOnDuty = member.status === "on_duty";
          const isRest = member.status === "rest_interval";
          const isOnLeave = member.status === "on_leave";

          return (
            <div
              key={member.id}
              className="p-5 rounded-3xl bg-white border border-[var(--gray-border)] hover:border-zinc-300 shadow-xs space-y-4 transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-11 w-11 rounded-2xl ${member.avatarColor} text-white flex items-center justify-center font-extrabold text-xs shadow-xs`}>
                      {member.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[var(--gray-text)]">{member.name}</h3>
                      <p className="text-[11px] text-[var(--gray-muted)]">{member.role}</p>
                      <span className="text-[9px] font-mono font-bold text-zinc-500">{member.code}</span>
                    </div>
                  </div>

                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    isOnDuty
                      ? "bg-emerald-100 text-emerald-800"
                      : isRest
                      ? "bg-purple-100 text-purple-800"
                      : isOnLeave
                      ? "bg-amber-100 text-amber-800"
                      : "bg-gray-100 text-gray-700"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      isOnDuty ? "bg-emerald-600 animate-pulse" : isRest ? "bg-purple-600" : isOnLeave ? "bg-amber-600" : "bg-gray-400"
                    }`} />
                    <span>
                      {isOnDuty ? "On Duty" : isRest ? "12h Rest" : isOnLeave ? "On Leave" : "Off Duty"}
                    </span>
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-[var(--gray-muted)] pt-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-[var(--emerald-deep)] shrink-0" />
                    <span className="truncate">{member.station}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-[var(--emerald-deep)] shrink-0" />
                    <span className="truncate">{member.shiftGroup}</span>
                  </div>
                  {member.clockInTime && (
                    <div className="p-2 rounded-xl bg-gray-50 border border-gray-100 font-mono text-[10px] text-zinc-600">
                      Clock: {member.clockInTime}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <a
                  href={`mailto:${member.email}`}
                  className="p-2 rounded-xl hover:bg-[var(--cool-gray)] text-gray-500 hover:text-[var(--emerald-deep)] transition"
                  title="Send Email"
                >
                  <Mail className="h-4 w-4" />
                </a>
                <a
                  href={`tel:${member.phone}`}
                  className="p-2 rounded-xl hover:bg-[var(--cool-gray)] text-gray-500 hover:text-[var(--emerald-deep)] transition"
                  title="Call Phone"
                >
                  <Phone className="h-4 w-4" />
                </a>
                <Link
                  href={`/portal/workforce`}
                  className="px-3 py-1.5 rounded-xl bg-[var(--cool-gray)] hover:bg-gray-200 text-xs font-bold text-[var(--gray-text)] transition"
                >
                  View File
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. Delegation of Authority (DoA) Section */}
      <div id="delegation" className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[var(--gray-text)] flex items-center gap-2">
              <Award className="h-4 w-4 text-[var(--emerald-deep)]" />
              <span>Delegation of Authority (DoA) & Out-of-Office Proxies</span>
            </h2>
            <p className="text-xs text-[var(--gray-muted)]">
              Formal audit-compliant delegation of financial sign-off caps and workflow approvals to trusted department peers.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDelegationModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[var(--emerald-deep)] text-white text-xs font-bold hover:bg-[var(--emerald-deep-hover)] transition flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Rule</span>
          </button>
        </div>

        <div className="divide-y divide-gray-100">
          {delegations.map((rule) => (
            <div key={rule.id} className="py-3.5 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                  DoA
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-[var(--gray-text)]">
                      Proxy: {rule.proxyName} ({rule.proxyCode})
                    </p>
                    <span className={`text-[9px] font-bold px-2 py-0.2 rounded-full ${
                      rule.status === "active"
                        ? "bg-emerald-100 text-emerald-800"
                        : rule.status === "scheduled"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {rule.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--gray-muted)] mt-0.5">
                    Coverage: {rule.startDate} through {rule.endDate} • Max Cap: ${rule.financialCapUsd.toLocaleString()} USD
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {rule.scope.map((s, idx) => (
                      <span key={idx} className="text-[9px] px-1.5 py-0.2 rounded bg-gray-100 text-gray-700 font-mono">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="shrink-0 self-end sm:self-center">
                {rule.status !== "revoked" && (
                  <button
                    type="button"
                    onClick={() => handleRevokeDelegation(rule.id)}
                    className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition"
                  >
                    Revoke Proxy
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Delegation Setup Modal */}
      {delegationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-[var(--gray-border)] shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-[var(--emerald-deep)]" />
                <h3 className="text-base font-bold text-[var(--gray-text)]">
                  Assign Delegation of Authority (DoA) Proxy
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDelegationModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddDelegation} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--gray-text)]">Designated Colleague (Proxy)</label>
                <select
                  value={proxyColleague}
                  onChange={(e) => setProxyColleague(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--gray-border)] bg-gray-50 focus:outline-none focus:border-[var(--emerald-deep)]"
                >
                  <option value="Sarah Jenkins (EMP-3104)">Sarah Jenkins (Senior Plant Maintenance Lead)</option>
                  <option value="David Omondi (EMP-2190)">David Omondi (Logistics Fleet Supervisor)</option>
                  <option value="Engineer Alex Kiprop (EMP-4102)">Engineer Alex Kiprop (Electrical Lead)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--gray-text)]">Start Date</label>
                  <input
                    type="date"
                    required
                    value={delStartDate}
                    onChange={(e) => setDelStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--gray-border)] bg-gray-50 focus:outline-none focus:border-[var(--emerald-deep)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--gray-text)]">End Date</label>
                  <input
                    type="date"
                    required
                    value={delEndDate}
                    onChange={(e) => setDelEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--gray-border)] bg-gray-50 focus:outline-none focus:border-[var(--emerald-deep)]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--gray-text)]">Maximum Financial Ceiling (USD)</label>
                <input
                  type="number"
                  required
                  value={delCap}
                  onChange={(e) => setDelCap(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-[var(--gray-border)] bg-gray-50 focus:outline-none focus:border-[var(--emerald-deep)]"
                />
                <span className="text-[10px] text-[var(--gray-muted)]">
                  Requests exceeding this limit will automatically escalate to the VP of Engineering.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDelegationModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-bold text-[var(--gray-muted)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-bold shadow-xs"
                >
                  Confirm & Seal Delegation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
