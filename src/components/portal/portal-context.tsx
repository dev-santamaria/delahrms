"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";

export type LegalEntity = "all" | "kenya" | "uganda" | "tanzania" | "rwanda" | "uk" | "us";

export interface LegalEntityInfo {
  id: LegalEntity;
  name: string;
  code: string;
  flag: string;
  currency: string;
  symbol: string;
  regime: string;
}

export const LEGAL_ENTITIES: LegalEntityInfo[] = [
  {
    id: "all",
    name: "Global Group (All Entities)",
    code: "GRP-GLOBAL",
    flag: "🌐",
    currency: "USD",
    symbol: "$",
    regime: "Unified Multi-Jurisdiction",
  },
  {
    id: "kenya",
    name: "Kenya Operations Ltd",
    code: "KEN-NBO",
    flag: "🇰🇪",
    currency: "KES",
    symbol: "KSh",
    regime: "KRA PAYE / SHIF / NSSF / Housing",
  },
  {
    id: "uganda",
    name: "Uganda Branch Co",
    code: "UGA-KLA",
    flag: "🇺🇬",
    currency: "UGX",
    symbol: "USh",
    regime: "URA PAYE / NSSF Uganda / LST",
  },
  {
    id: "tanzania",
    name: "Tanzania Mining & Ops",
    code: "TZA-DAR",
    flag: "🇹🇿",
    currency: "TZS",
    symbol: "TSh",
    regime: "TRA PAYE / NSSF / WCF / SDL",
  },
  {
    id: "rwanda",
    name: "Rwanda Regional Hub",
    code: "RWA-KGL",
    flag: "🇷🇼",
    currency: "RWF",
    symbol: "FRw",
    regime: "RRA PAYE / RSSB Maternity / CBHI",
  },
  {
    id: "uk",
    name: "United Kingdom Tech Hub",
    code: "GBR-LON",
    flag: "🇬🇧",
    currency: "GBP",
    symbol: "£",
    regime: "HMRC Real-Time PAYE / NIC Tier 1",
  },
  {
    id: "us",
    name: "US Headquarters Inc",
    code: "USA-NYC",
    flag: "🇺🇸",
    currency: "USD",
    symbol: "$",
    regime: "IRS Federal / FICA / Multi-State",
  },
];

export type RolePersona =
  | "super_admin"
  | "station_supervisor"
  | "hr_ops"
  | "payroll_admin"
  | "finance_controller"
  | "manager"
  | "it_admin"
  | "employee";

export interface PersonaInfo {
  id: RolePersona;
  title: string;
  badge: string;
  desc: string;
  department: string;
  defaultRoute: string;
  scope: string;
}

export const ROLE_PERSONAS: PersonaInfo[] = [
  {
    id: "super_admin",
    title: "Group Executive & Platform Owner",
    badge: "C-Suite",
    desc: "SaaS tenant governance, multi-country subsidiaries, audit trail & platform controls",
    department: "Executive Board",
    defaultRoute: "/portal/dashboard",
    scope: "Global Multi-Tenant (All Entities)",
  },
  {
    id: "station_supervisor",
    title: "Plant & Depot Lead",
    badge: "Operations",
    desc: "Kisumu Depot, Nairobi Plant, domestic relocations, 24/7 continuous rotations & fleet",
    department: "Plant Operations & Logistics",
    defaultRoute: "/portal/station",
    scope: "Station & Depot Enclave",
  },
  {
    id: "hr_ops",
    title: "People & Culture Operations Lead",
    badge: "People Ops",
    desc: "Workforce master directory, ATS recruitment, expat visas & document governance",
    department: "Human Capital",
    defaultRoute: "/portal/workforce",
    scope: "Workforce & Talent Lifecycle",
  },
  {
    id: "payroll_admin",
    title: "Payroll & Benefits Admin",
    badge: "Compensation",
    desc: "Multi-country pay runs, KRA iTax/SHIF/NSSF CSVs, company loans FBT & EWA cashout",
    department: "Compensation & Benefits",
    defaultRoute: "/portal/payroll",
    scope: "Payroll & Remittances",
  },
  {
    id: "finance_controller",
    title: "Finance & Subledger Controller",
    badge: "Treasury",
    desc: "Double-entry subledger vouchers, SAP S/4HANA & ERPNext sync, claims & FX treasury",
    department: "Finance & Accounting",
    defaultRoute: "/portal/subledger",
    scope: "Subledger & GL Subsystems",
  },
  {
    id: "manager",
    title: "Line Manager / Dept Head",
    badge: "Management",
    desc: "Universal approvals hub, department attendance roster, shift swaps & delegation",
    department: "Department Leadership",
    defaultRoute: "/portal/approvals",
    scope: "Direct Reports & Team Rosters",
  },
  {
    id: "it_admin",
    title: "IT Hardware & Security Admin",
    badge: "IT & SecOps",
    desc: "Hardware registry, Jamf/Intune MDM, document threat radar, compression & SOC 2 logs",
    department: "Information Technology",
    defaultRoute: "/portal/it-fleet",
    scope: "Hardware Fleet & Security Radar",
  },
  {
    id: "employee",
    title: "Standard Staff (Self-Service ESS)",
    badge: "Workplace",
    desc: "Profile 360, geofenced GPS punch clock, leave balances, payslips & learning courses",
    department: "General Staff",
    defaultRoute: "/portal/dashboard",
    scope: "Personal Self-Service Vault",
  },
];

interface PortalContextType {
  entity: LegalEntity;
  setEntity: (e: LegalEntity) => void;
  entityInfo: LegalEntityInfo;
  persona: RolePersona;
  setPersona: (p: RolePersona) => void;
  personaInfo: PersonaInfo;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  searchOpen: boolean;
  setSearchOpen: (s: boolean) => void;
  unreadNotificationsCount: number;
  setUnreadNotificationsCount: React.Dispatch<React.SetStateAction<number>>;
}

const PortalContext = createContext<PortalContextType | undefined>(undefined);

export function PortalProvider({ children }: { children: React.ReactNode }) {
  const [entity, setEntityState] = useState<LegalEntity>("kenya");
  const [persona, setPersonaState] = useState<RolePersona>("super_admin");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(4);

  // Initialize from localStorage if client-side
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPersona = localStorage.getItem("delahr_portal_persona") as RolePersona;
      if (savedPersona && ROLE_PERSONAS.some((p) => p.id === savedPersona)) {
        setPersonaState(savedPersona);
      }
      const savedEntity = localStorage.getItem("delahr_portal_entity") as LegalEntity;
      if (savedEntity && LEGAL_ENTITIES.some((e) => e.id === savedEntity)) {
        setEntityState(savedEntity);
      }
    }
  }, []);

  const setEntity = (newEntity: LegalEntity) => {
    setEntityState(newEntity);
    if (typeof window !== "undefined") {
      localStorage.setItem("delahr_portal_entity", newEntity);
    }
    const ent = LEGAL_ENTITIES.find((e) => e.id === newEntity);
    if (ent) {
      apiClient.setContext({ organizationId: ent.code });
    }
  };

  const setPersona = (newPersona: RolePersona) => {
    setPersonaState(newPersona);
    if (typeof window !== "undefined") {
      localStorage.setItem("delahr_portal_persona", newPersona);
    }
    apiClient.setContext({ userRole: newPersona });
  };

  // Keyboard shortcut Cmd+K or Ctrl+K for command bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const entityInfo = LEGAL_ENTITIES.find((item) => item.id === entity) || LEGAL_ENTITIES[1];
  const personaInfo = ROLE_PERSONAS.find((item) => item.id === persona) || ROLE_PERSONAS[0];

  return (
    <PortalContext.Provider
      value={{
        entity,
        setEntity,
        entityInfo,
        persona,
        setPersona,
        personaInfo,
        sidebarCollapsed,
        setSidebarCollapsed,
        searchOpen,
        setSearchOpen,
        unreadNotificationsCount,
        setUnreadNotificationsCount,
      }}
    >
      {children}
    </PortalContext.Provider>
  );
}

export function usePortal() {
  const context = useContext(PortalContext);
  if (!context) {
    throw new Error("usePortal must be used within a PortalProvider");
  }
  return context;
}
