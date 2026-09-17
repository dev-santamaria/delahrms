"use client";

import React, { useState, useEffect } from "react";
import {
  Sliders,
  CheckSquare,
  ShieldCheck,
  Tag,
  MapPin,
  Plus,
  ArrowRight,
  TrendingUp,
  Search,
  Filter,
  X,
  RefreshCw,
  GitBranch,
  Layers,
  Sparkles,
  Building2,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { usePortal } from "@/components/portal/portal-context";
import { apiClient } from "@/lib/api-client";

interface WorkflowRule {
  id: string;
  name: string;
  module: "leave" | "claims" | "travel" | "loans" | "shifts";
  tiers: { step: number; approverRole: string; thresholdAmount?: number }[];
  isActive: boolean;
}

interface NamingSeriesRule {
  id: string;
  prefix: string;
  pattern: string;
  currentCounter: number;
  samplePreview: string;
}

export default function GovernancePortalPage() {
  const { entityInfo } = usePortal();
  const [activeTab, setActiveTab] = useState<"workflows" | "namingseries" | "spatial">("workflows");

  // Workflow Rules State
  const [workflows, setWorkflows] = useState<WorkflowRule[]>([
    {
      id: "wf-01",
      name: "Standard Expense Claims Dual-Key Approval",
      module: "claims",
      tiers: [
        { step: 1, approverRole: "Line Manager", thresholdAmount: 25000 },
        { step: 2, approverRole: "Finance Controller", thresholdAmount: 150000 },
        { step: 3, approverRole: "Group Managing Director", thresholdAmount: 500000 },
      ],
      isActive: true,
    },
    {
      id: "wf-02",
      name: "Annual Leave & Holiday Carryover Chain",
      module: "leave",
      tiers: [
        { step: 1, approverRole: "Line Manager" },
        { step: 2, approverRole: "People & Culture Lead" },
      ],
      isActive: true,
    },
    {
      id: "wf-03",
      name: "Staff Loan & Subsidized FBT Gateway",
      module: "loans",
      tiers: [
        { step: 1, approverRole: "Credit Committee" },
        { step: 2, approverRole: "Finance Controller" },
      ],
      isActive: true,
    },
  ]);

  // Naming Series State
  const [seriesList, setSeriesList] = useState<NamingSeriesRule[]>([
    { id: "ns-01", prefix: "PR", pattern: "PR-{YYYY}-{#####}", currentCounter: 142, samplePreview: "PR-2026-00143" },
    { id: "ns-02", prefix: "EMP", pattern: "EMP-{ORG}-{#####}", currentCounter: 2190, samplePreview: "EMP-KE-02191" },
    { id: "ns-03", prefix: "INV", pattern: "INV-{YYYY}-{#####}", currentCounter: 89, samplePreview: "INV-2026-00090" },
    { id: "ns-04", prefix: "LN", pattern: "LN-{YYYY}-{#####}", currentCounter: 81, samplePreview: "LN-2026-00082" },
    { id: "ns-05", prefix: "CLAIM", pattern: "EXP-{YYYY}-{#####}", currentCounter: 320, samplePreview: "EXP-2026-00321" },
  ]);

  // Modals
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [showSeriesModal, setShowSeriesModal] = useState(false);
  const [feedbackBanner, setFeedbackBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // New Series Form
  const [newPrefix, setNewPrefix] = useState("VOUCHER");
  const [newPattern, setNewPattern] = useState("JV-{YYYY}-{#####}");

  const handleCreateSeries = (e: React.FormEvent) => {
    e.preventDefault();
    const newRule: NamingSeriesRule = {
      id: `ns-${Date.now()}`,
      prefix: newPrefix.toUpperCase(),
      pattern: newPattern,
      currentCounter: 1,
      samplePreview: newPattern.replace("{YYYY}", "2026").replace("{#####}", "00001"),
    };
    setSeriesList([...seriesList, newRule]);
    setFeedbackBanner({
      type: "success",
      message: `Naming series '${newRule.prefix}' registered with preview '${newRule.samplePreview}'!`,
    });
    setShowSeriesModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      {feedbackBanner && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between border ${
            feedbackBanner.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-semibold">{feedbackBanner.message}</span>
          </div>
          <button
            onClick={() => setFeedbackBanner(null)}
            className="p-1 hover:bg-black/5 rounded-lg text-xs"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 uppercase tracking-wider">
              Enterprise Governance & Automation
            </span>
            <span className="text-xs text-[var(--gray-muted)]">• Multi-Tier DoA & Naming Standards</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[var(--gray-text)] mt-1">
            Universal Approval Workflows & ERP Naming Series
          </h1>
          <p className="text-sm text-[var(--gray-muted)]">
            Define multi-tier approval chains with delegation of authority thresholds and uniform document sequence formatting.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowSeriesModal(true)}
            className="px-4 py-2 rounded-xl border border-[var(--gray-border)] bg-white text-xs font-bold text-[var(--gray-text)] hover:bg-gray-50 flex items-center gap-2 shadow-xs transition"
          >
            <Tag className="h-4 w-4 text-[var(--emerald-deep)]" />
            Add Naming Series
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--gray-muted)] uppercase tracking-wider">
              Active Workflow Chains
            </span>
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <GitBranch className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-[var(--gray-text)]">{workflows.length}</span>
            <span className="text-xs text-emerald-600 font-bold ml-2">Enforced</span>
          </div>
          <p className="text-[11px] text-[var(--gray-muted)] mt-1">Multi-tier financial delegation rules</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--gray-muted)] uppercase tracking-wider">
              ERP Naming Series
            </span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-[var(--emerald-deep)] flex items-center justify-center">
              <Tag className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-[var(--gray-text)]">{seriesList.length}</span>
            <span className="text-xs text-emerald-600 font-bold ml-2">Standardized</span>
          </div>
          <p className="text-[11px] text-[var(--gray-muted)] mt-1">ISO 9001 sequential document tracking</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--gray-muted)] uppercase tracking-wider">
              Spatial Hubs
            </span>
            <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <MapPin className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-[var(--gray-text)]">3 Regional Entities</span>
            <span className="text-xs text-purple-600 font-bold ml-2">East Africa</span>
          </div>
          <p className="text-[11px] text-[var(--gray-muted)] mt-1">Kenya, Uganda, and Tanzania plants</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--gray-border)]">
        <button
          onClick={() => setActiveTab("workflows")}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition ${
            activeTab === "workflows"
              ? "border-[var(--emerald-deep)] text-[var(--emerald-deep)]"
              : "border-transparent text-[var(--gray-muted)] hover:text-[var(--gray-text)]"
          }`}
        >
          Approval Workflow Designers ({workflows.length})
        </button>
        <button
          onClick={() => setActiveTab("namingseries")}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition ${
            activeTab === "namingseries"
              ? "border-[var(--emerald-deep)] text-[var(--emerald-deep)]"
              : "border-transparent text-[var(--gray-muted)] hover:text-[var(--gray-text)]"
          }`}
        >
          ERP Naming Series ({seriesList.length})
        </button>
      </div>

      {/* Tab 1: Workflows */}
      {activeTab === "workflows" && (
        <div className="space-y-4">
          {workflows.map((wf) => (
            <div
              key={wf.id}
              className="p-5 bg-white rounded-2xl border border-[var(--gray-border)] shadow-xs"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                    {wf.module.substring(0, 3).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-[var(--gray-text)]">{wf.name}</h3>
                    <span className="text-[10px] text-[var(--gray-muted)] uppercase font-bold">
                      Module: {wf.module}
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Active Rule
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {wf.tiers.map((t) => (
                  <div
                    key={t.step}
                    className="p-3 bg-gray-50 rounded-xl border border-[var(--gray-border)] relative"
                  >
                    <span className="text-[10px] font-bold text-[var(--gray-muted)] uppercase block mb-1">
                      Tier {t.step} Sign-Off
                    </span>
                    <span className="font-extrabold text-xs text-[var(--gray-text)] block">
                      {t.approverRole}
                    </span>
                    {t.thresholdAmount && (
                      <span className="text-[10px] font-mono text-emerald-700 font-bold block mt-1">
                        Up to ${t.thresholdAmount.toLocaleString()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Naming Series */}
      {activeTab === "namingseries" && (
        <div className="bg-white rounded-2xl border border-[var(--gray-border)] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--cool-gray)] text-[var(--gray-muted)] font-bold uppercase tracking-wider border-b border-[var(--gray-border)]">
                <tr>
                  <th className="py-3.5 px-4">Series Prefix</th>
                  <th className="py-3.5 px-4">Format Pattern</th>
                  <th className="py-3.5 px-4">Current Sequence</th>
                  <th className="py-3.5 px-4">Next Generated ID Sample</th>
                  <th className="py-3.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--gray-border)]">
                {seriesList.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-extrabold text-blue-700">
                      {s.prefix}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[var(--gray-text)]">
                      {s.pattern}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[var(--gray-text)]">
                      {s.currentCounter}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                      {s.samplePreview}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Synchronized
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Naming Series Modal */}
      {showSeriesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[var(--gray-border)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--gray-border)]">
              <h3 className="font-extrabold text-[var(--gray-text)] text-sm">
                Register Document Naming Pattern
              </h3>
              <button
                onClick={() => setShowSeriesModal(false)}
                className="p-1 rounded-lg text-[var(--gray-muted)] hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSeries} className="space-y-3 pt-3 text-xs">
              <div>
                <label className="font-bold text-[var(--gray-text)] block mb-1">Prefix Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VOUCHER"
                  value={newPrefix}
                  onChange={(e) => setNewPrefix(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--gray-border)] rounded-xl font-mono text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-[var(--gray-text)] block mb-1">Pattern Structure *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. JV-{YYYY}-{#####}"
                  value={newPattern}
                  onChange={(e) => setNewPattern(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--gray-border)] rounded-xl font-mono text-xs"
                />
                <span className="text-[10px] text-[var(--gray-muted)] mt-1 block">
                  Tokens: &#123;YYYY&#125; for 4-digit year, &#123;ORG&#125; for subsidiary, &#123;#####&#125; for 5-digit sequence.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSeriesModal(false)}
                  className="px-3 py-1.5 border border-[var(--gray-border)] rounded-xl font-bold text-[var(--gray-muted)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[var(--emerald-deep)] hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm"
                >
                  Register Pattern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
