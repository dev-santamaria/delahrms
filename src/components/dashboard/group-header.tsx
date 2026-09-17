"use client";

import React from "react";
import {
  Building2,
  Globe2,
  ShieldCheck,
  Scale,
  Bell,
  ChevronDown,
  Sparkles,
} from "lucide-react";

interface GroupHeaderProps {
  currentOrg: string;
  onOrgChange: (org: string) => void;
  isLedgerBalanced: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function GroupHeader({
  currentOrg,
  onOrgChange,
  isLedgerBalanced,
  activeTab,
  onTabChange,
}: GroupHeaderProps) {
  const organizations = [
    { id: "MAND-KE", name: "Mandela Kenya Limited", flagClass: "fi fi-ke", currency: "KES", jurisdiction: "Kenya (KRA, SHIF, NSSF, AHL)" },
    { id: "MAND-NG", name: "Mandela Nigeria Limited", flagClass: "fi fi-ng", currency: "NGN", jurisdiction: "Nigeria (FIRS, PAYE, NHF, Pension)" },
    { id: "MAND-ZA", name: "Mandela South Africa", flagClass: "fi fi-za", currency: "ZAR", jurisdiction: "South Africa (SARS, UIF, SDL)" },
    { id: "MAND-UK", name: "Mandela Global UK Ltd", flagClass: "fi fi-gb", currency: "GBP", jurisdiction: "UK (HMRC PAYE, NIC, Pension)" },
    { id: "MAND-US", name: "Mandela Technologies Inc", flagClass: "fi fi-us", currency: "USD", jurisdiction: "USA (Federal, State, FICA, 401k)" },
  ];

  const currentOrgData = organizations.find((o) => o.id === currentOrg) || organizations[0];

  const tabs = [
    { id: "payroll", label: "Payroll Cockpit", icon: "💰" },
    { id: "subledger", label: "Accounting Sub-Ledger", icon: "⚖️" },
    { id: "travel", label: "Travel & Fiscalization", icon: "✈️" },
    { id: "shifts", label: "24/7 Shifts & Mining", icon: "⚡" },
    { id: "shutdown", label: "Shutdown & Leave Ledger", icon: "📅" },
    { id: "geo_fx", label: "Geo & FX Treasury", icon: "🌐" },
    { id: "claims", label: "Claims & Receipts", icon: "🧾" },
    { id: "loans", label: "Loans & Amortization", icon: "🏦" },
    { id: "remittances", label: "Check-offs (Britam/SACCO)", icon: "🏛️" },
    { id: "training", label: "Learning & Retraining", icon: "🎓" },
    { id: "surveys", label: "Surveys & eNPS", icon: "📊" },
    { id: "forms", label: "Digital Forms & E-Sign", icon: "✍️" },
    { id: "it_fleet", label: "IT Fleet & SaaS", icon: "💻" },
    { id: "mobility", label: "Mobility & 183-Day Tax", icon: "🌍" },
    { id: "time", label: "Geofence Clock-In", icon: "📍" },
  ];

  return (
    <header className="border-b border-[var(--gray-border)] bg-white sticky top-14 z-40 shadow-xs">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Multi-Subsidiary Switcher */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[var(--emerald-deep)] flex items-center justify-center shadow-xs">
              <span className="font-bold text-white text-sm">d</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base tracking-tight">
                  <strong className="font-extrabold text-[var(--gray-text)]">Del</strong>
                  <span className="font-light text-[var(--gray-muted)]">HR</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider px-1.5 py-0.2 rounded bg-[var(--emerald-light)] text-[var(--emerald-deep)] border border-[var(--emerald-border)] uppercase">
                  Enterprise
                </span>
              </div>
              <p className="text-[11px] text-[var(--gray-muted)]">Global Workforce & Payroll OS</p>
            </div>
          </div>

          <div className="h-5 w-px bg-[var(--gray-border)] hidden sm:block" />

          {/* Subsidiary Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--cool-gray)] border border-[var(--gray-border)] hover:border-[var(--emerald-mint)] transition text-left text-xs">
              <span className={`${currentOrgData.flagClass} text-sm rounded-xs`} />
              <div>
                <p className="font-medium text-[var(--gray-text)] leading-tight flex items-center gap-1">
                  {currentOrgData.name}
                  <ChevronDown className="h-3 w-3 text-[var(--gray-muted)]" />
                </p>
                <p className="text-[10px] text-[var(--gray-muted)]">{currentOrgData.currency} • Multi-Tenant Entity</p>
              </div>
            </button>

            <div className="absolute left-0 mt-1 w-72 rounded-xl bg-white border border-[var(--gray-border)] shadow-lg p-1.5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-150 z-50">
              <div className="px-2.5 py-1 text-[10px] uppercase font-semibold text-[var(--gray-muted)] tracking-wider">
                Select Legal Subsidiary
              </div>
              {organizations.map((org) => (
                <button
                  key={org.id}
                  onClick={() => onOrgChange(org.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition text-left ${
                    currentOrg === org.id
                      ? "bg-[var(--emerald-light)] text-[var(--emerald-deep)] font-semibold border border-[var(--emerald-border)]"
                      : "text-[var(--gray-text)] hover:bg-[var(--cool-gray)]"
                  }`}
                >
                  <span className={`${org.flagClass} text-sm rounded-xs`} />
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{org.name}</p>
                    <p className="text-[10px] text-[var(--gray-muted)]">{org.jurisdiction}</p>
                  </div>
                  <span className="text-[11px] font-mono text-[var(--gray-muted)]">{org.currency}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Global Badges & Health Indicators */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Subledger Invariant Status Pill */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
              isLedgerBalanced
                ? "bg-[var(--emerald-light)] text-[var(--emerald-deep)] border-[var(--emerald-border)]"
                : "bg-rose-50 text-rose-700 border-rose-200"
            }`}
          >
            <Scale className="h-3.5 w-3.5 text-[var(--emerald-deep)]" />
            <span>Sub-Ledger: {isLedgerBalanced ? "Balanced (0.00 Discrepancy)" : "Unbalanced"}</span>
          </div>

          {/* Statutory Engine Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[var(--emerald-light)] text-[var(--emerald-deep)] border border-[var(--emerald-border)]">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Statutory Engine Active</span>
          </div>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-[var(--gray-border)]">
            <div className="h-7 w-7 rounded-full bg-[var(--emerald-light)] text-[var(--emerald-deep)] flex items-center justify-center text-xs font-bold border border-[var(--emerald-border)]">
              NM
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-[var(--gray-text)] leading-tight">Nelson Mandela</p>
              <p className="text-[10px] text-[var(--gray-muted)]">Group Administrator</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 overflow-x-auto scrollbar-none py-1 border-t border-[var(--gray-border)]">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                isActive
                  ? "bg-[var(--emerald-deep)] text-white shadow-xs font-semibold"
                  : "text-[var(--gray-muted)] hover:text-[var(--gray-text)] hover:bg-[var(--cool-gray)]"
              }`}
            >
              <span className="text-sm leading-none">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
