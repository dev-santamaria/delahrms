"use client";

import React, { useState } from "react";
import {
  Settings,
  Building2,
  Shield,
  Key,
  Webhook,
  FileCheck2,
  CheckCircle2,
  Globe,
  Lock,
  Plus,
  Copy,
  RefreshCw,
  Send,
  Eye,
  Sliders,
} from "lucide-react";
import { usePortal, LEGAL_ENTITIES, ROLE_PERSONAS, LegalEntity } from "@/components/portal/portal-context";

export default function EnterpriseSettingsPortalPage() {
  const { entity, setEntity, persona, setPersona } = usePortal();
  const [activeTab, setActiveTab] = useState<"entities" | "rbac" | "webhooks" | "audit">("entities");
  const [copiedKey, setCopiedKey] = useState(false);
  const [webhookTesting, setWebhookTesting] = useState(false);
  const [webhookResponse, setWebhookResponse] = useState<string | null>(null);

  const permissionsList = [
    { name: "View Multi-Entity Consolidated Payroll", roles: ["admin", "finance"] },
    { name: "Execute Pay Run & Disburse Treasury EFT", roles: ["admin", "finance"] },
    { name: "Manage Expatriate Visas & Relocation Housing", roles: ["admin", "hr"] },
    { name: "Approve 24/7 Shift Swaps & Fatigue Overrides", roles: ["admin", "manager"] },
    { name: "Trigger Corporate Holiday Shutdown Leave Debit", roles: ["admin", "hr"] },
    { name: "Submit Pre-Trip Cash Advances & Per Diem Claims", roles: ["admin", "finance", "hr", "manager", "employee"] },
    { name: "Maker-Checker Bank Account Modification Authorization", roles: ["admin", "finance", "hr"] },
    { name: "Access Balanced Double-Entry Subledger JVs", roles: ["admin", "finance"] },
  ];

  const mockAuditLogs = [
    {
      id: "AUD-89210",
      timestamp: "Sep 16, 2026 14:10:22 UTC",
      actor: "Nelson Mandela CP (Admin)",
      action: "Approve Bank Change Request (NCBA Upper Hill)",
      entity: "KEN-NBO",
      ip: "197.232.14.88",
      sha256: "8f7e3d2a1b9c4f5e6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f",
    },
    {
      id: "AUD-89209",
      timestamp: "Sep 16, 2026 12:45:00 UTC",
      actor: "Sarah Jenkins (Finance Lead)",
      action: "Locked September 2026 Payrun (1,420 staff)",
      entity: "GRP-GLOBAL",
      ip: "197.248.60.12",
      sha256: "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
    },
    {
      id: "AUD-89208",
      timestamp: "Sep 16, 2026 09:30:15 UTC",
      actor: "System Scheduler Daemon",
      action: "Fatigue Rest Check Validated (0 Breaches)",
      entity: "KEN-NBO",
      ip: "127.0.0.1 (Localhost)",
      sha256: "3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c",
    },
  ];

  const handleCopyKey = () => {
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleTestWebhook = () => {
    setWebhookTesting(true);
    setWebhookResponse(null);
    setTimeout(() => {
      setWebhookTesting(false);
      setWebhookResponse("HTTP 200 OK — Delivered in 42ms with HMAC-SHA256 signature.");
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-[var(--emerald-deep)]" />
            <h1 className="text-2xl font-extrabold tracking-tight text-[var(--gray-text)]">
              Enterprise Settings &amp; Governance
            </h1>
          </div>
          <p className="text-xs text-[var(--gray-muted)] mt-0.5">
            Configure multi-country subsidiaries, RBAC authorization matrices, real-time webhooks, and cryptographic audit logs.
          </p>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[var(--gray-border)] pb-2 flex-wrap">
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setActiveTab("entities")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "entities"
                ? "bg-[var(--emerald-deep)] text-white shadow-xs"
                : "text-[var(--gray-muted)] hover:text-[var(--gray-text)]"
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Operating Entities ({LEGAL_ENTITIES.length})</span>
          </button>
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setActiveTab("rbac")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "rbac"
                ? "bg-[var(--emerald-deep)] text-white shadow-xs"
                : "text-[var(--gray-muted)] hover:text-[var(--gray-text)]"
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            <span>RBAC Permission Matrix</span>
          </button>
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setActiveTab("webhooks")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "webhooks"
                ? "bg-[var(--emerald-deep)] text-white shadow-xs"
                : "text-[var(--gray-muted)] hover:text-[var(--gray-text)]"
            }`}
          >
            <Webhook className="h-3.5 w-3.5" />
            <span>Webhooks &amp; API Keys</span>
          </button>
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setActiveTab("audit")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "audit"
                ? "bg-[var(--emerald-deep)] text-white shadow-xs"
                : "text-[var(--gray-muted)] hover:text-[var(--gray-text)]"
            }`}
          >
            <FileCheck2 className="h-3.5 w-3.5" />
            <span>Immutable Audit Logs</span>
          </button>
        </div>

        {/* Tab 1: Legal Entities */}
        {activeTab === "entities" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[var(--gray-text)]">
                  Operating Subsidiary Jurisdictions
                </h3>
                <p className="text-xs text-[var(--gray-muted)]">
                  Switch active subsidiary context or configure statutory tax regimes.
                </p>
              </div>
              <button
                type="button"
                suppressHydrationWarning
                className="px-4 py-2 rounded-xl bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" />
                <span>Add Subsidiary</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {LEGAL_ENTITIES.map((ent) => {
                const isActive = entity === ent.id;
                return (
                  <div
                    key={ent.id}
                    className={`p-5 rounded-2xl border transition space-y-3 flex flex-col justify-between ${
                      isActive
                        ? "bg-white border-[var(--emerald-deep)] ring-2 ring-[var(--emerald-deep)]/10 shadow-sm"
                        : "bg-white border-[var(--gray-border)] hover:border-zinc-300 shadow-2xs"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{ent.flag}</span>
                          <div>
                            <h4 className="text-sm font-bold text-[var(--gray-text)]">
                              {ent.name}
                            </h4>
                            <span className="text-[10px] font-mono text-[var(--gray-muted)]">
                              {ent.code}
                            </span>
                          </div>
                        </div>
                        {isActive && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--emerald-light)] text-[var(--emerald-deep)]">
                            Current Active
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 text-xs pt-1">
                        <div className="flex justify-between text-[var(--gray-muted)]">
                          <span>Base Currency:</span>
                          <span className="font-mono font-bold text-[var(--gray-text)]">
                            {ent.currency} ({ent.symbol})
                          </span>
                        </div>
                        <div className="flex justify-between text-[var(--gray-muted)]">
                          <span>Tax Regime:</span>
                          <span className="font-medium text-[var(--emerald-deep)] truncate max-w-[180px]">
                            {ent.regime}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[var(--gray-border)] flex items-center justify-between">
                      <button
                        type="button"
                        suppressHydrationWarning
                        onClick={() => setEntity(ent.id as LegalEntity)}
                        className={`w-full py-2 rounded-xl text-xs font-bold transition ${
                          isActive
                            ? "bg-emerald-50 text-[var(--emerald-deep)] border border-emerald-200"
                            : "bg-[var(--cool-gray)] text-[var(--gray-text)] hover:bg-[var(--emerald-deep)] hover:text-white"
                        }`}
                      >
                        {isActive ? "Active Portal Context" : "Switch Context to Entity"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: RBAC Matrix */}
        {activeTab === "rbac" && (
          <div className="rounded-2xl border border-[var(--gray-border)] bg-white shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[var(--gray-border)] bg-[var(--cool-gray)] flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-[var(--gray-text)] uppercase tracking-wider">
                  Role-Based Access Control (RBAC) Permission Matrix
                </h3>
                <p className="text-[11px] text-[var(--gray-muted)]">
                  Strict 5-tier persona separation across all 30 operational submodules.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-white border-b border-[var(--gray-border)] text-[11px] font-bold text-[var(--gray-muted)]">
                    <th className="p-3.5 w-1/3">Action / Operational Capability</th>
                    {ROLE_PERSONAS.map((p) => (
                      <th key={p.id} className="p-3.5 text-center">
                        <div className="space-y-0.5">
                          <p className="text-[var(--gray-text)]">{p.badge}</p>
                          <p className="text-[9px] text-[var(--gray-muted)]">{p.id}</p>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--gray-border)]">
                  {permissionsList.map((perm, idx) => (
                    <tr key={idx} className="hover:bg-[var(--cool-gray)]/50 transition">
                      <td className="p-3.5 font-medium text-[var(--gray-text)]">{perm.name}</td>
                      {ROLE_PERSONAS.map((p) => {
                        const hasAccess = perm.roles.includes(p.id);
                        return (
                          <td key={p.id} className="p-3.5 text-center">
                            {hasAccess ? (
                              <span className="inline-flex p-1 rounded-md bg-emerald-100 text-[var(--emerald-deep)]">
                                <CheckCircle2 className="h-4 w-4 text-[var(--emerald-mint)]" />
                              </span>
                            ) : (
                              <span className="text-zinc-300 font-bold">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Webhooks & API Keys */}
        {activeTab === "webhooks" && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[var(--gray-text)]">
                    Enterprise Production API Key
                  </h3>
                  <p className="text-xs text-[var(--gray-muted)]">
                    Use this key to authenticate REST API &amp; Socket.io client connections.
                  </p>
                </div>
                <button
                  type="button"
                  suppressHydrationWarning
                  className="px-3.5 py-1.5 rounded-xl border border-[var(--gray-border)] hover:bg-gray-50 text-xs font-bold text-[var(--gray-text)] transition flex items-center gap-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-[var(--emerald-mint)]" />
                  <span>Rotate Secret</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <code className="flex-1 p-3 rounded-xl bg-[var(--cool-gray)] border border-[var(--gray-border)] text-xs font-mono font-bold text-[var(--emerald-deep)] truncate">
                  dela_live_sec_99a8b7c6d5e4f3a2b1c0987654321fedcba
                </code>
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={handleCopyKey}
                  className="px-4 py-3 rounded-xl bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 shrink-0"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>{copiedKey ? "Copied!" : "Copy Key"}</span>
                </button>
              </div>
            </div>

            {/* Webhook Configuration & Simulator */}
            <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[var(--gray-text)]">
                    Outbound ERP / SAP Webhook Subscriptions
                  </h3>
                  <p className="text-xs text-[var(--gray-muted)]">
                    Real-time JSON payload dispatch for payroll completion, travel advances, and shift fatigue alerts.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--cool-gray)] border border-[var(--gray-border)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[var(--gray-text)]">
                    https://erp.corporate-enterprise.com/api/v1/delahr-events
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                    Active • HMAC-SHA256
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 text-[10px] font-semibold">
                  <span className="px-2 py-0.5 rounded bg-white border border-[var(--gray-border)]">
                    event: payroll.disbursed
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white border border-[var(--gray-border)]">
                    event: advance.requested
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white border border-[var(--gray-border)]">
                    event: fatigue.alert
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-[var(--gray-border)]">
                  <span className="text-[11px] text-[var(--gray-muted)]">
                    Last ping: 2 mins ago (HTTP 200)
                  </span>
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={handleTestWebhook}
                    disabled={webhookTesting}
                    className="px-3.5 py-1.5 rounded-xl bg-white border border-[var(--gray-border)] hover:bg-gray-50 text-xs font-bold text-[var(--gray-text)] transition flex items-center gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5 text-[var(--emerald-mint)]" />
                    <span>{webhookTesting ? "Dispatching Payload..." : "Send Test Ping"}</span>
                  </button>
                </div>

                {webhookResponse && (
                  <div className="p-3 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-semibold flex items-center gap-2 border border-emerald-200">
                    <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
                    <span>{webhookResponse}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Audit Logs */}
        {activeTab === "audit" && (
          <div className="rounded-2xl border border-[var(--gray-border)] bg-white shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[var(--gray-border)] bg-[var(--cool-gray)] flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-[var(--gray-text)] uppercase tracking-wider">
                  Tamper-Proof Audit Trail (SHA-256 Ledger)
                </h3>
                <p className="text-[11px] text-[var(--gray-muted)]">
                  Every bank alteration, pay run execution, and shift swap approval is immutably signed.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-white border-b border-[var(--gray-border)] text-[11px] font-bold text-[var(--gray-muted)]">
                    <th className="p-3.5">Log ID</th>
                    <th className="p-3.5">Timestamp (UTC)</th>
                    <th className="p-3.5">Actor</th>
                    <th className="p-3.5">Action Executed</th>
                    <th className="p-3.5">Entity</th>
                    <th className="p-3.5">SHA-256 Cryptographic Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--gray-border)]">
                  {mockAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[var(--cool-gray)]/50 transition">
                      <td className="p-3.5 font-mono font-bold text-[var(--gray-text)]">{log.id}</td>
                      <td className="p-3.5 text-[var(--gray-muted)]">{log.timestamp}</td>
                      <td className="p-3.5 font-semibold text-[var(--gray-text)]">{log.actor}</td>
                      <td className="p-3.5 font-semibold text-[var(--emerald-deep)]">{log.action}</td>
                      <td className="p-3.5 font-mono">{log.entity}</td>
                      <td className="p-3.5 font-mono text-[10px] text-[var(--gray-muted)] truncate max-w-[150px]">
                        {log.sha256}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
