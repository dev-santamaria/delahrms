"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  Users,
  Clock,
  CalendarDays,
  FileCheck2,
  DollarSign,
  Receipt,
  Plane,
  Building2,
  Settings,
  HelpCircle,
  X,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Factory,
  Truck,
  Repeat,
  MapPin,
  Briefcase,
  Key,
  Globe,
  HardDrive,
  Webhook,
  CheckSquare,
  Wallet,
  MessageSquare,
} from "lucide-react";
import { usePortal } from "./portal-context";

interface QuickLink {
  title: string;
  category: string;
  href: string;
  icon: React.ElementType;
  shortcut?: string;
  personaTarget?: string;
}

export function CommandSearchDialog() {
  const { searchOpen, setSearchOpen, entityInfo, persona } = usePortal();
  const [query, setQuery] = useState("");
  const router = useRouter();

  const links: QuickLink[] = [
    // Executive & SaaS
    { title: "Executive & Operational Dashboard", category: "Core Navigation", href: "/portal/dashboard", icon: LayoutDashboard, shortcut: "G D" },
    { title: "SaaS Tenant Onboarding & Plans", category: "SaaS Platform", href: "/portal/saas", icon: Globe, shortcut: "G S" },
    { title: "Team & Supabase Auth User Access", category: "User Security", href: "/portal/team-access", icon: Key },
    { title: "Enterprise Governance & Naming Series", category: "Governance", href: "/portal/governance", icon: Settings },

    // Station & Industrial Operations
    { title: "Plant & Depot Command Center", category: "Station Operations", href: "/portal/station", icon: Factory, shortcut: "G C" },
    { title: "Domestic Station Relocations & Packages", category: "Station Operations", href: "/portal/station/transfers", icon: MapPin },
    { title: "24/7 Continuous Shift Rotations", category: "Operations", href: "/portal/station/rotations", icon: Repeat },
    { title: "Commercial Fleet & Logged Trips", category: "Fleet Logistics", href: "/portal/station/fleet", icon: Truck },

    // People & Talent
    { title: "Workforce Master Directory", category: "People Operations", href: "/portal/workforce", icon: Users, shortcut: "G W" },
    { title: "Organizational Hierarchy & Positions", category: "People Operations", href: "/portal/organization", icon: Users },
    { title: "ATS Recruitment Kanban Pipeline", category: "Talent Acquisition", href: "/portal/recruitment", icon: Briefcase },
    { title: "Training LMS & Retraining Matrix", category: "Learning", href: "/portal/training-learning", icon: HelpCircle },
    { title: "Expat Visas & 183-Day Residency", category: "Mobility", href: "/portal/mobility", icon: Plane },

    // Time, Leave, Approvals
    { title: "24/7 Shift Rosters & Fatigue Guard", category: "Time & Attendance", href: "/portal/time-shifts", icon: Clock },
    { title: "Leave Management & Holiday Balances", category: "Time Off", href: "/portal/leave-shutdowns", icon: CalendarDays, shortcut: "G L" },
    { title: "Universal Approvals Hub", category: "Approvals", href: "/portal/approvals", icon: CheckSquare, shortcut: "G A" },
    { title: "My Team Roster & Delegation", category: "Management", href: "/portal/team", icon: Users },

    // Payroll, Finance & Subledger
    { title: "Multi-Currency Payroll Cockpit", category: "Payroll", href: "/portal/payroll", icon: DollarSign, shortcut: "G P" },
    { title: "Statutory Filings (KRA iTax / SHIF / NSSF)", category: "Compliance", href: "/portal/statutory-remittances", icon: Building2 },
    { title: "Company Loans & Sec 12B FBT", category: "Payroll", href: "/portal/loans-advances", icon: Receipt },
    { title: "Earned Wage Access (EWA) Cashout", category: "Benefits", href: "/portal/benefits", icon: Wallet },
    { title: "Travel Advances & Fiscal Expense Claims", category: "Expenses", href: "/portal/claims-advances", icon: Receipt },
    { title: "Double-Entry Subledger & ERP Sync", category: "Accounting", href: "/portal/subledger", icon: ShieldCheck },
    { title: "Central Bank Spot FX Rates", category: "Treasury", href: "/portal/treasury", icon: Globe },

    // IT, Security & Compliance
    { title: "IT Hardware Registry & Jamf MDM", category: "IT Operations", href: "/portal/it-fleet", icon: Settings },
    { title: "SOC 2 Audit Trail & Threat Radar", category: "Security & Threat", href: "/portal/security-audit", icon: HardDrive },
    { title: "Webhooks Subscriptions & Event Outbox", category: "Developer", href: "/portal/developer", icon: Webhook },
    { title: "Document Vault & Presigned Uploads", category: "Documents", href: "/portal/my-documents", icon: FileCheck2 },
    { title: "Paperless Forms & Cryptographic E-Signatures", category: "Governance", href: "/portal/forms-signatures", icon: FileCheck2 },
    { title: "Anonymous Ethics & Whistleblower Vault", category: "Ethics", href: "/portal/ethics-vault", icon: ShieldCheck },
    { title: "Pulse Surveys & eNPS Analytics", category: "Culture", href: "/portal/surveys-pulse", icon: TrendingUp },
    { title: "Team Channels & Kudos Cheer Wall", category: "Community", href: "/portal/social", icon: MessageSquare },
  ];

  const filtered =
    query.trim() === ""
      ? links
      : links.filter(
          (item) =>
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.category.toLowerCase().includes(query.toLowerCase())
        );

  const handleSelect = (href: string) => {
    setSearchOpen(false);
    setQuery("");
    router.push(href);
  };

  if (!searchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50 duration-200">
      <div
        className="w-full max-w-2xl rounded-2xl bg-white border border-[var(--gray-border)] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--gray-border)] bg-[var(--cool-gray)]">
          <Search className="h-5 w-5 text-[var(--emerald-deep)] shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder={`Jump to any module, station, or document in ${entityInfo.name}...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[var(--gray-text)] placeholder:text-[var(--gray-muted)] focus:outline-none"
          />
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setSearchOpen(false)}
            className="p-1 rounded-md text-[var(--gray-muted)] hover:text-[var(--gray-text)] hover:bg-gray-200 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 divide-y divide-gray-100">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--gray-muted)]">
              No matching modules or records found for &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  suppressHydrationWarning
                  onClick={() => handleSelect(item.href)}
                  className="w-full px-3 py-2.5 rounded-xl hover:bg-[var(--emerald-light)] group transition flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-[var(--cool-gray)] text-[var(--emerald-deep)] group-hover:bg-white group-hover:text-[var(--emerald-deep)] flex items-center justify-center transition shrink-0 border border-[var(--gray-border)]">
                      <IconComp className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--gray-text)] group-hover:text-[var(--emerald-deep)] transition">
                        {item.title}
                      </p>
                      <p className="text-[10px] text-[var(--gray-muted)]">
                        {item.category} • {entityInfo.code}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.shortcut && (
                      <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-[var(--gray-muted)] bg-white border border-[var(--gray-border)] rounded shadow-xs">
                        {item.shortcut}
                      </kbd>
                    )}
                    <ArrowRight className="h-3.5 w-3.5 text-gray-400 group-hover:text-[var(--emerald-deep)] group-hover:translate-x-0.5 transition" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-[var(--gray-border)] bg-gray-50 flex items-center justify-between text-[11px] text-[var(--gray-muted)]">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--emerald-mint)]" />
            <span>
              Subsidiary: <strong>{entityInfo.name}</strong> • Persona:{" "}
              <strong className="capitalize">{persona.replace("_", " ")}</strong>
            </span>
          </div>
          <span className="font-mono text-[10px]">ESC to close</span>
        </div>
      </div>
    </div>
  );
}
