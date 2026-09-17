"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarDays,
  Plane,
  Laptop,
  DollarSign,
  Building2,
  Receipt,
  Coins,
  FileCheck2,
  TrendingUp,
  GraduationCap,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  LogOut,
  ExternalLink,
  Factory,
  Truck,
  Repeat,
  MapPin,
  Briefcase,
  Layers,
  CheckSquare,
  Key,
  Webhook,
  HardDrive,
  FileText,
  MessageSquare,
  Award,
  Wallet,
  Globe,
  Sliders,
  Sparkles,
} from "lucide-react";
import { usePortal, RolePersona } from "./portal-context";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function PortalSidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, setSidebarCollapsed, entityInfo, persona, personaInfo } = usePortal();

  // Dynamically compute the navigation dictionary according to the active persona
  const sections: NavSection[] = useMemo(() => {
    switch (persona) {
      case "super_admin":
        return [
          {
            title: "Platform Control Center",
            items: [
              { title: "Executive SaaS Cockpit", href: "/portal/saas", icon: LayoutDashboard },
            ],
          },
          {
            title: "Tenant Governance & Approvals",
            items: [
              { title: "Tenant Directory & Queue", href: "/portal/saas", icon: Globe, badge: "Approvals", badgeColor: "bg-amber-100 text-amber-800" },
              { title: "Subscriptions & Billing", href: "/portal/saas", icon: Layers, badge: "Tiers" },
              { title: "Platform Team & RBAC", href: "/portal/team-access", icon: Key, badge: "Auth" },
            ],
          },
          {
            title: "System Architecture",
            items: [
              { title: "Universal Workflows & Series", href: "/portal/governance", icon: Sliders },
            ],
          },
          {
            title: "Security & Infrastructure",
            items: [
              { title: "SOC 2 Audit & Threat Radar", href: "/portal/security-audit", icon: HardDrive, badge: "Threats" },
              { title: "Webhooks & Outbox", href: "/portal/developer", icon: Webhook, badge: "Events" },
              { title: "Enterprise Settings", href: "/portal/settings", icon: Settings },
            ],
          },
        ];

      case "station_supervisor":
        return [
          {
            title: "Depot Command",
            items: [
              { title: "Station Command Center", href: "/portal/station", icon: Factory, badge: "Live GPS", badgeColor: "bg-emerald-100 text-emerald-800" },
            ],
          },
          {
            title: "Operations & Shifts",
            items: [
              { title: "24/7 Continuous Rotations", href: "/portal/station/rotations", icon: Repeat, badge: "Mining/Plant" },
              { title: "Biometric Kiosk & GPS", href: "/portal/time-shifts", icon: Clock, badge: "Haversine" },
              { title: "Domestic Relocations", href: "/portal/station/transfers", icon: MapPin, badge: "Packages" },
            ],
          },
          {
            title: "Commercial Fleet",
            items: [
              { title: "Station Vehicle Registry", href: "/portal/station/fleet", icon: Truck },
              { title: "Haulage & Station Claims", href: "/portal/claims-advances", icon: Receipt },
            ],
          },
          {
            title: "Station Approvals",
            items: [
              { title: "Shift & Overtime Approvals", href: "/portal/approvals", icon: CheckSquare, badge: "Queue" },
              { title: "Station Roster", href: "/portal/team", icon: Users },
            ],
          },
        ];

      case "hr_ops":
        return [
          {
            title: "HR Overview",
            items: [
              { title: "People Ops Dashboard", href: "/portal/dashboard", icon: LayoutDashboard },
            ],
          },
          {
            title: "Workforce Lifecycle",
            items: [
              { title: "Workforce Master Directory", href: "/portal/workforce", icon: Users, badge: "Full Master" },
              { title: "Org Hierarchy & Positions", href: "/portal/organization", icon: Layers },
              { title: "Leave & Shutdowns", href: "/portal/leave-shutdowns", icon: CalendarDays },
            ],
          },
          {
            title: "Talent & Mobility",
            items: [
              { title: "ATS Recruitment Kanban", href: "/portal/recruitment", icon: Briefcase, badge: "7-Stage" },
              { title: "Expat Visas & 183-Day", href: "/portal/mobility", icon: Plane, badge: "Permits" },
              { title: "Domestic Station Moves", href: "/portal/station/transfers", icon: MapPin },
              { title: "Training & LMS Catalog", href: "/portal/training-learning", icon: GraduationCap },
            ],
          },
          {
            title: "Governance & Policies",
            items: [
              { title: "Document Vault & Presign", href: "/portal/my-documents", icon: FileText, badge: "Secure" },
              { title: "Forms & E-Signatures", href: "/portal/forms-signatures", icon: FileCheck2, badge: "SHA-256" },
              { title: "Ethics & Whistleblower", href: "/portal/ethics-vault", icon: ShieldCheck, badge: "Encrypted" },
            ],
          },
        ];

      case "payroll_admin":
        return [
          {
            title: "Payroll Cockpit",
            items: [
              { title: "Multi-Currency Cockpit", href: "/portal/payroll", icon: DollarSign, badge: entityInfo.currency, badgeColor: "bg-emerald-100 text-emerald-800" },
            ],
          },
          {
            title: "Statutory & Taxes",
            items: [
              { title: "KRA iTax, SHIF & NSSF", href: "/portal/statutory-remittances", icon: Building2, badge: "CSV Exporter" },
              { title: "Housing Levy & SACCO", href: "/portal/statutory-remittances#sacco", icon: Coins },
            ],
          },
          {
            title: "Loans & Benefits",
            items: [
              { title: "Staff Loans & Sec 12B FBT", href: "/portal/loans-advances", icon: Receipt, badge: "FBT 30%" },
              { title: "Earned Wage Access (EWA)", href: "/portal/benefits", icon: Wallet, badge: "Instant" },
              { title: "Non-Payroll Claims", href: "/portal/claims-advances", icon: Receipt },
            ],
          },
        ];

      case "finance_controller":
        return [
          {
            title: "Finance Overview",
            items: [
              { title: "Executive Treasury Cockpit", href: "/portal/dashboard", icon: LayoutDashboard },
            ],
          },
          {
            title: "Subledger Accounting",
            items: [
              { title: "Balanced GL Subledger", href: "/portal/subledger", icon: ShieldCheck, badge: "Double-Entry", badgeColor: "bg-emerald-100 text-emerald-800" },
              { title: "SAP & ERPNext Sync", href: "/portal/subledger#erp-sync", icon: Repeat, badge: "OData" },
              { title: "Chart of Accounts", href: "/portal/subledger#chart", icon: Layers },
            ],
          },
          {
            title: "Treasury & Audit",
            items: [
              { title: "Central Bank Spot FX", href: "/portal/treasury", icon: Globe },
              { title: "Expense Claims Audit", href: "/portal/claims-advances", icon: Receipt, badge: "Fiscal" },
              { title: "Company Loans Ledger", href: "/portal/loans-advances", icon: Coins },
            ],
          },
        ];

      case "manager":
        return [
          {
            title: "Leadership",
            items: [
              { title: "Department Cockpit", href: "/portal/dashboard", icon: LayoutDashboard },
            ],
          },
          {
            title: "Approvals Hub",
            items: [
              { title: "Universal Approvals Queue", href: "/portal/approvals", icon: CheckSquare, badge: "Action Req.", badgeColor: "bg-amber-100 text-amber-800" },
              { title: "Delegation of Authority", href: "/portal/team#delegation", icon: Award },
            ],
          },
          {
            title: "Team Rosters",
            items: [
              { title: "My Team Directory", href: "/portal/team", icon: Users },
              { title: "24/7 Shift Rostering", href: "/portal/time-shifts", icon: Clock, badge: "12h Guard" },
              { title: "Live Shift Attendance", href: "/portal/time-shifts#live", icon: MapPin },
            ],
          },
          {
            title: "Performance & Culture",
            items: [
              { title: "Team OKRs & Appraisals", href: "/portal/performance", icon: TrendingUp },
            ],
          },
        ];

      case "it_admin":
        return [
          {
            title: "IT Command",
            items: [
              { title: "IT SecOps Cockpit", href: "/portal/dashboard", icon: LayoutDashboard },
            ],
          },
          {
            title: "Hardware Fleet",
            items: [
              { title: "Device Registry (MDM)", href: "/portal/it-fleet", icon: Laptop, badge: "Jamf/Intune" },
              { title: "Digital Custody Receipts", href: "/portal/it-fleet#custody", icon: FileCheck2 },
            ],
          },
          {
            title: "Document Security",
            items: [
              { title: "Threat Screening Radar", href: "/portal/security-audit", icon: ShieldCheck, badge: "Magic Bytes", badgeColor: "bg-rose-100 text-rose-800" },
              { title: "Storage Optimization", href: "/portal/security-audit#storage", icon: HardDrive, badge: "-90% WebP" },
              { title: "SOC 2 Audit Trail", href: "/portal/security-audit#logs", icon: FileText, badge: "ISO 27001" },
            ],
          },
          {
            title: "Developer Platform",
            items: [
              { title: "Webhooks & Subscriptions", href: "/portal/developer", icon: Webhook, badge: "HMAC" },
              { title: "API Keys & Integrations", href: "/portal/developer#apikeys", icon: Key },
            ],
          },
        ];

      case "employee":
      default:
        return [
          {
            title: "My Workspace",
            items: [
              { title: "Self-Service Home", href: "/portal/dashboard", icon: LayoutDashboard },
              { title: "My Profile 360", href: "/portal/my-profile", icon: Users },
              { title: "Geofenced GPS Punch Clock", href: "/portal/time-shifts", icon: Clock, badge: "GPS Clock" },
              { title: "Leave & Holiday Balances", href: "/portal/leave-shutdowns", icon: CalendarDays },
              { title: "Expense Claims & Travel", href: "/portal/claims-advances", icon: Receipt },
            ],
          },
          {
            title: "Financial Wellbeing",
            items: [
              { title: "Digital Payslips & P9", href: "/portal/payroll", icon: DollarSign },
              { title: "Earned Wage Access (EWA)", href: "/portal/benefits", icon: Wallet, badge: "Instant Cash" },
              { title: "Staff Loan Request", href: "/portal/loans-advances", icon: Coins },
            ],
          },
          {
            title: "Growth & Community",
            items: [
              { title: "My Document Vault", href: "/portal/my-documents", icon: FileText },
              { title: "Learning & Certifications", href: "/portal/training-learning", icon: GraduationCap },
              { title: "Team Channels & Kudos", href: "/portal/social", icon: MessageSquare, badge: "Cheer" },
              { title: "Anonymous Ethics Vault", href: "/portal/ethics-vault", icon: ShieldCheck, badge: "Confidential" },
            ],
          },
        ];
    }
  }, [persona, entityInfo.currency]);

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen bg-white border-r border-[var(--gray-border)] flex flex-col transition-all duration-300 select-none ${
        sidebarCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 border-b border-[var(--gray-border)] flex items-center justify-between px-4">
        {!sidebarCollapsed ? (
          <Link href="/portal/dashboard" className="flex items-center gap-2">
            <span className="text-xl tracking-tight leading-none">
              <strong className="font-extrabold text-[var(--emerald-deep)]">Dela</strong>
              <span className="font-light text-[var(--gray-muted)]">HR</span>
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-[var(--emerald-light)] text-[var(--emerald-deep)] uppercase tracking-wider">
              Portal
            </span>
          </Link>
        ) : (
          <Link href="/portal/dashboard" className="mx-auto">
            <div className="h-8 w-8 rounded-lg bg-[var(--emerald-deep)] text-white flex items-center justify-center font-extrabold text-sm shadow-xs">
              D
            </div>
          </Link>
        )}

        <button
          type="button"
          suppressHydrationWarning
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-1.5 rounded-lg border border-[var(--gray-border)] hover:bg-gray-100 text-[var(--gray-muted)] hover:text-[var(--gray-text)] transition shrink-0"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Active Entity & Persona Context Pill (when expanded) */}
      {!sidebarCollapsed && (
        <div className="px-3 py-2.5 bg-[var(--cool-gray)] border-b border-[var(--gray-border)] flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base shrink-0">{entityInfo.flag}</span>
            <div className="truncate">
              <p className="text-[11px] font-bold text-[var(--gray-text)] truncate">
                {entityInfo.name}
              </p>
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-emerald-100 text-emerald-800">
                  {personaInfo.badge}
                </span>
                <span className="text-[10px] text-[var(--gray-muted)] truncate">
                  • {entityInfo.currency} ({entityInfo.symbol})
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Links Scrollable Body */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {sections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {!sidebarCollapsed && (
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[var(--gray-muted)]">
                {section.title}
              </p>
            )}

            <div className="space-y-0.5">
              {section.items.map((item, iIdx) => {
                const IconComp = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/portal/dashboard" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={iIdx}
                    href={item.href}
                    title={sidebarCollapsed ? item.title : undefined}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition group relative ${
                      isActive
                        ? "bg-[var(--emerald-deep)] text-white shadow-xs"
                        : "text-[var(--gray-text)] hover:bg-[var(--cool-gray)] hover:text-[var(--emerald-deep)]"
                    }`}
                  >
                    <IconComp
                      className={`h-4 w-4 shrink-0 transition ${
                        isActive
                          ? "text-white"
                          : "text-[var(--gray-muted)] group-hover:text-[var(--emerald-deep)]"
                      }`}
                    />

                    {!sidebarCollapsed && (
                      <div className="flex-1 flex items-center justify-between min-w-0">
                        <span className="truncate">{item.title}</span>
                        {item.badge && (
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                              item.badgeColor || (isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-700")
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom User Profile Section */}
      <div className="p-3 border-t border-[var(--gray-border)] bg-white space-y-2">
        <div
          className={`flex items-center gap-3 p-2 rounded-xl bg-[var(--cool-gray)] ${
            sidebarCollapsed ? "justify-center" : ""
          }`}
        >
          <div className="h-8 w-8 rounded-full bg-[var(--emerald-deep)] text-white flex items-center justify-center font-bold text-xs shrink-0">
            NM
          </div>

          {!sidebarCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[var(--gray-text)] truncate">
                Nelson Mandela CP
              </p>
              <p className="text-[10px] text-[var(--gray-muted)] truncate">
                {personaInfo.title}
              </p>
            </div>
          )}
        </div>

        {!sidebarCollapsed && (
          <div className="flex items-center justify-between text-[11px] px-1 text-[var(--gray-muted)]">
            <Link href="/" className="hover:text-[var(--emerald-deep)] flex items-center gap-1">
              <span>Public Landing</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
            <Link href="/auth/login" className="hover:text-rose-600 flex items-center gap-1">
              <LogOut className="h-3 w-3" />
              <span>Exit</span>
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
