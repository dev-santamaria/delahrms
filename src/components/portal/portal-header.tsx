"use client";

import React, { useState } from "react";
import {
  Search,
  Bell,
  Globe2,
  UserCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  Sparkles,
  Plane,
  Receipt,
  FileCheck2,
  Factory,
  ShieldAlert,
  Check,
  Building,
} from "lucide-react";
import {
  usePortal,
  LEGAL_ENTITIES,
  ROLE_PERSONAS,
  LegalEntity,
  RolePersona,
} from "./portal-context";

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  type: "approval" | "fatigue" | "advance" | "mobility" | "security" | "saas";
  icon: React.ElementType;
  color: string;
  read: boolean;
}

export function PortalHeader() {
  const {
    entity,
    setEntity,
    entityInfo,
    persona,
    setPersona,
    personaInfo,
    sidebarCollapsed,
    setSearchOpen,
    unreadNotificationsCount,
    setUnreadNotificationsCount,
  } = usePortal();

  const [entityDropdownOpen, setEntityDropdownOpen] = useState(false);
  const [personaDropdownOpen, setPersonaDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "notif-1",
      title: "Bank Payout Change Request (#HR-BNK-2026)",
      desc: "Nelson Mandela CP changed salary payout bank to Citibank. Pending dual-key Finance sign-off.",
      time: "10 mins ago",
      type: "approval",
      icon: FileCheck2,
      color: "text-amber-600 bg-amber-50",
      read: false,
    },
    {
      id: "notif-2",
      title: "12-Hour Rest Fatigue Warning (Roster 3B)",
      desc: "Kisumu Lake Basin Depot operator scheduled for night shift without mandatory 12h rest interval.",
      time: "25 mins ago",
      type: "fatigue",
      icon: AlertTriangle,
      color: "text-rose-600 bg-rose-50",
      read: false,
    },
    {
      id: "notif-3",
      title: "Domestic Station Relocation Package Issued",
      desc: "Disturbance allowance & haulage advance authorized for transfer from Kisumu to Nairobi Plant.",
      time: "45 mins ago",
      type: "advance",
      icon: Factory,
      color: "text-[var(--emerald-deep)] bg-[var(--emerald-light)]",
      read: false,
    },
    {
      id: "notif-4",
      title: "Expat Work Permit Expiry (30 Days)",
      desc: "Principal Geologist work permit renewal required for Tanzania mining operations site.",
      time: "2 hours ago",
      type: "mobility",
      icon: Plane,
      color: "text-blue-600 bg-blue-50",
      read: false,
    },
    {
      id: "notif-5",
      title: "Document Threat Screening Cleared",
      desc: "14 vendor contracts verified clean via magic-byte inspection and downsampled 88% to WebP.",
      time: "3 hours ago",
      type: "security",
      icon: ShieldAlert,
      color: "text-purple-600 bg-purple-50",
      read: true,
    },
  ]);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadNotificationsCount(0);
  };

  const handleMarkItemRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadNotificationsCount((prev) => Math.max(0, prev - 1));
  };

  return (
    <header
      className={`sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-[var(--gray-border)] transition-all duration-300 flex items-center justify-between px-4 sm:px-6 ${
        sidebarCollapsed ? "ml-20" : "ml-64"
      }`}
    >
      {/* Left: Quick Search Bar trigger */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          suppressHydrationWarning
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--cool-gray)] border border-[var(--gray-border)] hover:border-zinc-300 text-xs text-[var(--gray-muted)] hover:text-[var(--gray-text)] transition w-48 sm:w-72 justify-between group"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="h-3.5 w-3.5 text-[var(--emerald-deep)] group-hover:scale-110 transition" />
            <span className="truncate">Quick jump across modules...</span>
          </div>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-zinc-500 bg-white border border-[var(--gray-border)] rounded shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Entity Switcher, Role Persona Switcher, Notifications */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* 1. Legal Entity / Operating Subsidiary Switcher */}
        <div className="relative">
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => {
              setEntityDropdownOpen(!entityDropdownOpen);
              setPersonaDropdownOpen(false);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--gray-border)] hover:bg-[var(--cool-gray)] text-xs font-semibold text-[var(--gray-text)] transition bg-white shadow-2xs"
          >
            <span className="text-sm">{entityInfo.flag}</span>
            <span className="hidden md:inline truncate max-w-[130px] font-bold">
              {entityInfo.code}
            </span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-gray-100 text-gray-700">
              {entityInfo.currency}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-[var(--gray-muted)]" />
          </button>

          {entityDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xl p-2 z-50 animate-in fade-in-50 zoom-in-95">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-xs font-bold text-[var(--gray-text)]">
                  Operating Subsidiary
                </p>
                <p className="text-[10px] text-[var(--gray-muted)]">
                  Applies localized tax, currency & statutory rules
                </p>
              </div>

              <div className="py-1 space-y-0.5 max-h-64 overflow-y-auto">
                {LEGAL_ENTITIES.map((ent) => (
                  <button
                    key={ent.id}
                    type="button"
                    suppressHydrationWarning
                    onClick={() => {
                      setEntity(ent.id);
                      setEntityDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 rounded-xl text-left text-xs transition flex items-center justify-between ${
                      entity === ent.id
                        ? "bg-[var(--emerald-light)] text-[var(--emerald-deep)] font-bold"
                        : "hover:bg-[var(--cool-gray)] text-[var(--gray-text)]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-base">{ent.flag}</span>
                      <div className="truncate">
                        <p className="truncate font-semibold">{ent.name}</p>
                        <p className="text-[10px] text-[var(--gray-muted)]">
                          {ent.regime}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border border-[var(--gray-border)]">
                      {ent.currency}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 2. Role Persona Switcher (8 Personas RBAC Preview) */}
        <div className="relative">
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => {
              setPersonaDropdownOpen(!personaDropdownOpen);
              setEntityDropdownOpen(false);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--emerald-light)] border border-[var(--emerald-border)] text-xs font-bold text-[var(--emerald-deep)] hover:bg-emerald-100 transition shadow-2xs"
          >
            <UserCheck className="h-3.5 w-3.5 text-[var(--emerald-mint)]" />
            <span className="hidden sm:inline font-extrabold">{personaInfo.badge}</span>
            <span className="text-[10px] font-normal text-emerald-800 hidden xl:inline">
              ({personaInfo.title.split(" ")[0]})
            </span>
            <ChevronDown className="h-3 w-3" />
          </button>

          {personaDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xl p-2 z-50 animate-in fade-in-50 zoom-in-95">
              <div className="px-3 py-2 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-[var(--gray-text)]">
                    Enterprise Role Personas (8 Roles)
                  </p>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Live RBAC
                  </span>
                </div>
                <p className="text-[10px] text-[var(--gray-muted)]">
                  Instantly switches dynamic sidebar, permissions, and entity data scopes
                </p>
              </div>

              <div className="py-1 space-y-1 max-h-96 overflow-y-auto">
                {ROLE_PERSONAS.map((p) => {
                  const isSelected = persona === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      suppressHydrationWarning
                      onClick={() => {
                        setPersona(p.id);
                        setPersonaDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 rounded-xl text-left text-xs transition flex flex-col gap-0.5 ${
                        isSelected
                          ? "bg-[var(--emerald-light)] text-[var(--emerald-deep)] font-bold border border-[var(--emerald-border)]"
                          : "hover:bg-[var(--cool-gray)] text-[var(--gray-text)]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {isSelected && <Check className="h-3 w-3 text-[var(--emerald-deep)]" />}
                          <span className="font-bold">{p.title}</span>
                        </div>
                        <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-full bg-white border border-[var(--gray-border)]">
                          {p.badge}
                        </span>
                      </div>
                      <span className="text-[10px] text-[var(--gray-muted)] font-normal leading-snug">
                        {p.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 3. Notification Center Popover */}
        <div className="relative">
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setEntityDropdownOpen(false);
              setPersonaDropdownOpen(false);
            }}
            className="relative p-2 rounded-xl border border-[var(--gray-border)] hover:bg-[var(--cool-gray)] text-[var(--gray-text)] transition bg-white shadow-2xs"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4 text-[var(--gray-text)]" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center shadow-xs">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xl p-3 z-50 animate-in fade-in-50 zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 px-1">
                <div>
                  <p className="text-xs font-bold text-[var(--gray-text)]">
                    Action Center & Alerts
                  </p>
                  <p className="text-[10px] text-[var(--gray-muted)]">
                    {unreadNotificationsCount} unread items requiring attention
                  </p>
                </div>
                {unreadNotificationsCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="text-[10px] font-bold text-[var(--emerald-deep)] hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="py-2 space-y-2 max-h-80 overflow-y-auto divide-y divide-gray-50">
                {notifications.map((n) => {
                  const IconComp = n.icon;
                  return (
                    <div
                      key={n.id}
                      onClick={() => handleMarkItemRead(n.id)}
                      className={`pt-2 first:pt-0 flex items-start gap-3 p-1.5 rounded-xl transition cursor-pointer ${
                        n.read ? "opacity-60 hover:opacity-100 hover:bg-gray-50" : "bg-[var(--cool-gray)] hover:bg-gray-100"
                      }`}
                    >
                      <div
                        className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${n.color}`}
                      >
                        <IconComp className="h-4 w-4" />
                      </div>
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-bold text-[var(--gray-text)] truncate">
                            {n.title}
                          </p>
                          {!n.read && (
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-[var(--gray-muted)] line-clamp-2 leading-relaxed">
                          {n.desc}
                        </p>
                        <p className="text-[9px] text-zinc-400 font-mono">
                          {n.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
