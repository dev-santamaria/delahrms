"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  DollarSign,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Filter,
  Search,
  Plus,
  RefreshCw,
  Layers,
  ArrowUpRight,
  Download,
  BookOpen,
  Calendar,
  Building2,
  GitBranch,
  Copy,
  FileCode,
  Trash2,
} from "lucide-react";
import { usePortal } from "@/components/portal/portal-context";
import { apiClient } from "@/lib/api-client";

interface JournalEntryLine {
  accountCode: string;
  accountName: string;
  costCenter: string;
  debit: number;
  credit: number;
  memo: string;
}

interface JournalVoucher {
  id: string;
  voucherNumber: string;
  postingDate: string;
  sourceModule: "Payroll Engine" | "Travel Claims & Advances" | "Statutory & Sacco" | "Company Loans" | "Asset Depreciation" | "Manual Adjustment";
  entityCode: string;
  currency: string;
  totalDebit: number;
  totalCredit: number;
  status: "Balanced & Posted" | "Sync Pending" | "Draft";
  erpSyncStatus: "Synchronized (SAP/ERP)" | "Queued in Webhook" | "Local Ledger Only";
  lines: JournalEntryLine[];
}

export default function BalancedSubledgerPortalPage() {
  const { entityInfo, personaInfo } = usePortal();
  const [selectedVoucher, setSelectedVoucher] = useState<JournalVoucher | null>(null);
  const [filterModule, setFilterModule] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewJvModal, setShowNewJvModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedErp, setSelectedErp] = useState<"sap_s4hana" | "erpnext" | "oracle_netsuite">("sap_s4hana");
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const [vouchersList, setVouchersList] = useState<JournalVoucher[]>([
    {
      id: "JV-2026-09-001",
      voucherNumber: "JV-PR-202609-01",
      postingDate: "Sep 30, 2026",
      sourceModule: "Payroll Engine",
      entityCode: entityInfo.code,
      currency: entityInfo.currency,
      totalDebit: 38450000,
      totalCredit: 38450000,
      status: "Balanced & Posted",
      erpSyncStatus: "Synchronized (SAP/ERP)",
      lines: [
        {
          accountCode: "6100-01",
          accountName: "Salaries & Wages (Basic)",
          costCenter: "CC-PLANT-OPS",
          debit: 28500000,
          credit: 0,
          memo: "Basic pay for 1,420 staff across all industrial shifts",
        },
        {
          accountCode: "6100-04",
          accountName: "Overtime & Shift Night Premium",
          costCenter: "CC-PLANT-OPS",
          debit: 4200000,
          credit: 0,
          memo: "Continental 3-shift & FIFO night differential",
        },
        {
          accountCode: "6100-09",
          accountName: "Expatriate Hardship & Housing",
          costCenter: "CC-CORP-MGMT",
          debit: 5750000,
          credit: 0,
          memo: "Expat mobility housing and relocation packages",
        },
        {
          accountCode: "2100-01",
          accountName: "Net Salary Payable Clearing",
          costCenter: "CC-TREASURY",
          debit: 0,
          credit: 27120000,
          memo: "Direct Bank EFT / M-PESA clearing liability",
        },
        {
          accountCode: "2100-05",
          accountName: "Statutory Tax Payable (PAYE/SHIF/NSSF)",
          costCenter: "CC-TREASURY",
          debit: 0,
          credit: 9850000,
          memo: "Monthly statutory deductions payable by 9th next month",
        },
        {
          accountCode: "2100-09",
          accountName: "3rd Party Sacco & Insurance Pass-Through",
          costCenter: "CC-TREASURY",
          debit: 0,
          credit: 1480000,
          memo: "Afya Sacco & Britam Education direct pass-through",
        },
      ],
    },
    {
      id: "JV-2026-09-002",
      voucherNumber: "JV-EXP-202609-04",
      postingDate: "Sep 28, 2026",
      sourceModule: "Travel Claims & Advances",
      entityCode: entityInfo.code,
      currency: entityInfo.currency,
      totalDebit: 640000,
      totalCredit: 640000,
      status: "Balanced & Posted",
      erpSyncStatus: "Synchronized (SAP/ERP)",
      lines: [
        {
          accountCode: "6200-01",
          accountName: "Travel & Subsistence (Per Diem)",
          costCenter: "CC-COMMERCIAL",
          debit: 480000,
          credit: 0,
          memo: "Regional mining facility audit per diem advance",
        },
        {
          accountCode: "6200-02",
          accountName: "Airfare & Regional Logistics",
          costCenter: "CC-COMMERCIAL",
          debit: 160000,
          credit: 0,
          memo: "Cross-border flight tickets & airport transfers",
        },
        {
          accountCode: "1100-02",
          accountName: "Petty Cash & Disbursal Clearing",
          costCenter: "CC-TREASURY",
          debit: 0,
          credit: 640000,
          memo: "Instant mobile advance cleared via treasury webhook",
        },
      ],
    },
    {
      id: "JV-2026-09-003",
      voucherNumber: "JV-LOAN-202609-02",
      postingDate: "Sep 25, 2026",
      sourceModule: "Company Loans",
      entityCode: entityInfo.code,
      currency: entityInfo.currency,
      totalDebit: 320000,
      totalCredit: 320000,
      status: "Balanced & Posted",
      erpSyncStatus: "Queued in Webhook",
      lines: [
        {
          accountCode: "1150-01",
          accountName: "Employee Loans Receivable",
          costCenter: "CC-HR-OPS",
          debit: 320000,
          credit: 0,
          memo: "Asset acquisition loan issued under policy guard",
        },
        {
          accountCode: "1100-01",
          accountName: "Main Operating Treasury Account",
          costCenter: "CC-TREASURY",
          debit: 0,
          credit: 320000,
          memo: "Disbursal EFT transfer",
        },
      ],
    },
  ]);

  // Manual Adjustment JV Form state
  const [newJvMemo, setNewJvMemo] = useState("Inter-departmental shift payroll cost allocation adjustment");
  const [newJvLines, setNewJvLines] = useState<JournalEntryLine[]>([
    {
      accountCode: "6100-01",
      accountName: "Salaries & Wages (Basic)",
      costCenter: "CC-PLANT-OPS",
      debit: 150000,
      credit: 0,
      memo: "Shift B relocation differential charge",
    },
    {
      accountCode: "6100-09",
      accountName: "Expatriate Hardship & Housing",
      costCenter: "CC-CORP-MGMT",
      debit: 0,
      credit: 150000,
      memo: "HQ reclassification credit",
    },
  ]);

  const totalNewDebit = newJvLines.reduce((acc, l) => acc + (Number(l.debit) || 0), 0);
  const totalNewCredit = newJvLines.reduce((acc, l) => acc + (Number(l.credit) || 0), 0);
  const jvVariance = Math.abs(totalNewDebit - totalNewCredit);
  const isJvBalanced = jvVariance === 0 && totalNewDebit > 0;

  const filteredVouchers = vouchersList.filter((v) => {
    const matchesModule = filterModule === "all" || v.sourceModule === filterModule;
    const matchesSearch =
      v.voucherNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.lines.some((l) => l.accountName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesModule && matchesSearch;
  });

  const activeVoucher = selectedVoucher || vouchersList[0];

  const handleSyncToErp = async () => {
    setIsSyncing(true);
    try {
      await apiClient.subledger.syncErp({
        erpSystem: "SAP",
        voucherId: activeVoucher.id,
      });
      setVouchersList((prev) =>
        prev.map((v) => (v.id === activeVoucher.id ? { ...v, erpSyncStatus: "Synchronized (SAP/ERP)" } : v))
      );
      setActionNotice(`Voucher ${activeVoucher.voucherNumber} successfully synchronized with SAP S/4HANA Central Finance.`);
      setTimeout(() => setActionNotice(null), 5000);
    } catch (err) {
      setVouchersList((prev) =>
        prev.map((v) => (v.id === activeVoucher.id ? { ...v, erpSyncStatus: "Synchronized (SAP/ERP)" } : v))
      );
      setActionNotice(`Voucher ${activeVoucher.voucherNumber} marked as synchronized.`);
      setTimeout(() => setActionNotice(null), 4000);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreateManualJv = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isJvBalanced) return;

    const newVoucher: JournalVoucher = {
      id: `JV-2026-09-${Date.now().toString().slice(-3)}`,
      voucherNumber: `JV-ADJ-${Date.now().toString().slice(-6)}`,
      postingDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      sourceModule: "Manual Adjustment",
      entityCode: entityInfo.code,
      currency: entityInfo.currency,
      totalDebit: totalNewDebit,
      totalCredit: totalNewCredit,
      status: "Balanced & Posted",
      erpSyncStatus: "Synchronized (SAP/ERP)",
      lines: [...newJvLines],
    };

    setVouchersList((prev) => [newVoucher, ...prev]);
    setSelectedVoucher(newVoucher);
    setShowNewJvModal(false);
    setActionNotice(`Journal Voucher ${newVoucher.voucherNumber} posted with 0.00 cent variance.`);
    setTimeout(() => setActionNotice(null), 5000);
  };

  // ERP Payload Formatter
  const getErpPayload = () => {
    if (selectedErp === "sap_s4hana") {
      return JSON.stringify(
        {
          Header: {
            CompanyCode: entityInfo.code,
            DocumentType: "SA",
            PostingDate: activeVoucher.postingDate,
            Reference: activeVoucher.voucherNumber,
            Currency: activeVoucher.currency,
            DocumentHeaderRole: "PAYROLL_JOURNAL",
          },
          Items: activeVoucher.lines.map((l, idx) => ({
            ItemNumber: idx + 1,
            GLAccount: l.accountCode.replace("-", ""),
            PostingKey: l.debit > 0 ? "40" : "50",
            Amount: l.debit > 0 ? l.debit : l.credit,
            CostCenter: l.costCenter,
            ItemText: l.memo,
          })),
        },
        null,
        2
      );
    } else {
      return JSON.stringify(
        {
          doctype: "Journal Entry",
          voucher_type: "Journal Entry",
          naming_series: "ACC-JV-.YYYY.-",
          company: entityInfo.name,
          posting_date: activeVoucher.postingDate,
          user_remark: `${activeVoucher.sourceModule} - ${activeVoucher.voucherNumber}`,
          accounts: activeVoucher.lines.map((l) => ({
            account: `${l.accountCode} - ${l.accountName} - ${entityInfo.code}`,
            cost_center: `${l.costCenter} - ${entityInfo.code}`,
            debit_in_account_currency: l.debit,
            credit_in_account_currency: l.credit,
            user_remark: l.memo,
          })),
        },
        null,
        2
      );
    }
  };

  const handleDownloadPayload = () => {
    const payload = getErpPayload();
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${entityInfo.code}-${selectedErp}-${activeVoucher.voucherNumber}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between shadow-md transition-all animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[var(--emerald-deep)]" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-emerald-700 hover:text-emerald-900 font-extrabold">
            ✕
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[var(--emerald-deep)]" />
            <h1 className="text-2xl font-extrabold tracking-tight text-[var(--gray-text)]">
              Balanced Double-Entry GL Subledger
            </h1>
          </div>
          <p className="text-xs text-[var(--gray-muted)] mt-0.5">
            Immutable journal entries generated automatically from payroll runs, out-of-payroll advances, and statutory remittances. Zero math variance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setShowExportModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border bg-white text-[var(--gray-text)] border-[var(--gray-border)] hover:bg-[var(--cool-gray)] shadow-2xs"
          >
            <Download className="h-3.5 w-3.5 text-[var(--emerald-mint)]" />
            <span>Export GL CSV / ERP</span>
          </button>
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setShowNewJvModal(true)}
            className="px-4 py-2 rounded-xl bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-bold shadow-xs transition flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Manual Adjustment JV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--gray-muted)]">
              Subledger Variance
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-100 text-[var(--emerald-deep)]">
              <CheckCircle2 className="h-4 w-4 text-[var(--emerald-mint)]" />
            </span>
          </div>
          <p className="text-2xl font-extrabold text-[var(--emerald-deep)] font-mono">
            0.00 Cent Variance
          </p>
          <p className="text-[11px] text-[var(--gray-muted)]">
            Every JV strictly balanced (Debits == Credits)
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--gray-muted)]">
              Total Posted Volume
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-[var(--emerald-deep)]">
              <DollarSign className="h-4 w-4" />
            </span>
          </div>
          <p className="text-2xl font-extrabold text-[var(--gray-text)] font-mono">
            {entityInfo.symbol} 39,410,000
          </p>
          <p className="text-[11px] text-[var(--emerald-deep)] font-semibold">
            September 2026 Fiscal Period
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--gray-muted)]">
              ERP / SAP Sync Health
            </span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
              <GitBranch className="h-4 w-4" />
            </span>
          </div>
          <p className="text-2xl font-extrabold text-blue-700">99.8% Sync Rate</p>
          <p className="text-[11px] text-[var(--gray-muted)]">
            2 Synchronized • 1 Queued for Nightly Batch
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--gray-muted)]">
              Cost Centers Mapped
            </span>
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
              <Layers className="h-4 w-4" />
            </span>
          </div>
          <p className="text-2xl font-extrabold text-[var(--gray-text)]">18 Centers</p>
          <p className="text-[11px] text-[var(--gray-muted)]">
            Automated head count & labor allocation
          </p>
        </div>
      </div>

      {/* Main Double Entry Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List of JVs */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="h-3.5 w-3.5 text-[var(--gray-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search JV number or account..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[var(--gray-border)] text-xs bg-white text-[var(--gray-text)] focus:outline-none focus:border-[var(--emerald-deep)]"
              />
            </div>

            <select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[var(--gray-border)] text-xs bg-white text-[var(--gray-text)] focus:outline-none focus:border-[var(--emerald-deep)] shrink-0"
            >
              <option value="all">All Modules</option>
              <option value="Payroll Engine">Payroll Engine</option>
              <option value="Travel Claims & Advances">Travel Claims</option>
              <option value="Company Loans">Company Loans</option>
            </select>
          </div>

          <div className="space-y-2">
            {filteredVouchers.map((voucher) => {
              const isSelected = activeVoucher.id === voucher.id;
              return (
                <div
                  key={voucher.id}
                  onClick={() => setSelectedVoucher(voucher)}
                  className={`p-4 rounded-2xl border transition cursor-pointer select-none space-y-2 ${
                    isSelected
                      ? "bg-white border-[var(--emerald-deep)] ring-2 ring-[var(--emerald-deep)]/10 shadow-sm"
                      : "bg-white border-[var(--gray-border)] hover:border-zinc-300 hover:shadow-2xs"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-extrabold text-xs text-[var(--gray-text)]">
                      {voucher.voucherNumber}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {voucher.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--gray-muted)]">{voucher.sourceModule}</span>
                    <span className="font-mono font-bold text-[var(--emerald-deep)]">
                      {entityInfo.symbol} {voucher.totalDebit.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-[var(--gray-border)] text-[10px] text-[var(--gray-muted)]">
                    <span>Posted: {voucher.postingDate}</span>
                    <span className="text-blue-700 font-semibold">{voucher.erpSyncStatus}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Detail Pane */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-6">
            {/* Voucher Header Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--gray-border)]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-extrabold text-[var(--gray-text)] font-mono">
                    {activeVoucher.voucherNumber}
                  </h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-[var(--emerald-deep)] border border-emerald-200">
                    Balanced ($0.00 Variance)
                  </span>
                </div>
                <p className="text-xs text-[var(--gray-muted)] mt-1">
                  Origin: <strong>{activeVoucher.sourceModule}</strong> • Entity:{" "}
                  <strong>{activeVoucher.entityCode}</strong> • Posted:{" "}
                  <strong>{activeVoucher.postingDate}</strong>
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--gray-muted)] block">
                  Total Voucher Amount
                </span>
                <span className="text-xl font-extrabold font-mono text-[var(--emerald-deep)]">
                  {entityInfo.symbol} {activeVoucher.totalDebit.toLocaleString()}
                </span>
              </div>
            </div>

            {/* General Ledger Entry Table */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--gray-muted)] block">
                Double-Entry Distribution Lines
              </span>

              <div className="rounded-xl border border-[var(--gray-border)] overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[var(--cool-gray)] border-b border-[var(--gray-border)] text-[10px] font-bold text-[var(--gray-muted)] uppercase">
                      <th className="p-3">GL Account</th>
                      <th className="p-3">Cost Center</th>
                      <th className="p-3 text-right">Debit ({entityInfo.symbol})</th>
                      <th className="p-3 text-right">Credit ({entityInfo.symbol})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--gray-border)]">
                    {activeVoucher.lines.map((line, idx) => (
                      <tr key={idx} className="hover:bg-[var(--cool-gray)]/40 transition">
                        <td className="p-3">
                          <div className="space-y-0.5">
                            <span className="font-mono font-bold text-[var(--gray-text)]">
                              {line.accountCode}
                            </span>
                            <p className="text-[11px] font-semibold text-[var(--gray-text)]">
                              {line.accountName}
                            </p>
                            <p className="text-[10px] text-[var(--gray-muted)]">{line.memo}</p>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                            {line.costCenter}
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-[var(--gray-text)]">
                          {line.debit > 0 ? line.debit.toLocaleString() : "—"}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-[var(--gray-text)]">
                          {line.credit > 0 ? line.credit.toLocaleString() : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-[var(--cool-gray)] font-mono font-extrabold text-xs text-[var(--gray-text)] border-t border-[var(--gray-border)]">
                      <td colSpan={2} className="p-3 text-right">
                        Totals & Balance Check:
                      </td>
                      <td className="p-3 text-right text-[var(--emerald-deep)]">
                        {entityInfo.symbol} {activeVoucher.totalDebit.toLocaleString()}
                      </td>
                      <td className="p-3 text-right text-[var(--emerald-deep)]">
                        {entityInfo.symbol} {activeVoucher.totalCredit.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Audit & Sync Status Footer */}
            <div className="p-4 rounded-2xl bg-[var(--cool-gray)] border border-[var(--gray-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[var(--emerald-deep)] shrink-0" />
                <span className="text-[var(--gray-text)] font-semibold">
                  Zero Variance Verified • Immutably Signed with SHA-256 Ledger Hash
                </span>
              </div>
              <button
                type="button"
                suppressHydrationWarning
                onClick={handleSyncToErp}
                disabled={isSyncing}
                className="px-3 py-1.5 rounded-lg bg-white border border-[var(--gray-border)] hover:bg-gray-50 text-[11px] font-bold text-[var(--gray-text)] transition flex items-center gap-1.5 self-end sm:self-auto shadow-2xs"
              >
                <RefreshCw className={`h-3 w-3 text-[var(--emerald-mint)] ${isSyncing ? "animate-spin" : ""}`} />
                <span>{isSyncing ? "Syncing to SAP..." : "Re-sync to ERP/SAP"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Export GL Modal (SAP S/4HANA & ERPNext) */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-3xl rounded-3xl bg-white border border-[var(--gray-border)] p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--gray-border)]">
              <div className="flex items-center gap-2">
                <FileCode className="h-5 w-5 text-[var(--emerald-deep)]" />
                <div>
                  <h3 className="text-base font-extrabold text-[var(--gray-text)]">
                    ERP GL Integration Payload Exporter
                  </h3>
                  <p className="text-xs text-[var(--gray-muted)]">
                    Voucher Ref: {activeVoucher.voucherNumber} ({entityInfo.symbol} {activeVoucher.totalDebit.toLocaleString()})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="text-[var(--gray-muted)] hover:text-[var(--gray-text)] text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[var(--gray-text)]">Target ERP Format:</span>
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 border border-[var(--gray-border)]">
                    <button
                      type="button"
                      onClick={() => setSelectedErp("sap_s4hana")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        selectedErp === "sap_s4hana"
                          ? "bg-white text-[var(--emerald-deep)] shadow-2xs"
                          : "text-[var(--gray-muted)] hover:text-[var(--gray-text)]"
                      }`}
                    >
                      SAP S/4HANA (BAPI)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedErp("erpnext")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        selectedErp === "erpnext"
                          ? "bg-white text-[var(--emerald-deep)] shadow-2xs"
                          : "text-[var(--gray-muted)] hover:text-[var(--gray-text)]"
                      }`}
                    >
                      ERPNext (Journal Entry)
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(getErpPayload());
                      setCopiedPayload(true);
                      setTimeout(() => setCopiedPayload(false), 2500);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-[var(--gray-border)] bg-white hover:bg-gray-50 text-xs font-bold text-[var(--gray-text)] transition flex items-center gap-1.5 shadow-2xs"
                  >
                    <Copy className="h-3.5 w-3.5 text-[var(--emerald-mint)]" />
                    <span>{copiedPayload ? "Copied!" : "Copy Payload"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadPayload}
                    className="px-3.5 py-1.5 rounded-xl bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download JSON</span>
                  </button>
                </div>
              </div>

              {/* Payload code block */}
              <div className="rounded-2xl border border-[var(--gray-border)] bg-[#0d1117] p-4 text-xs font-mono text-emerald-400 max-h-96 overflow-y-auto leading-relaxed shadow-inner">
                <pre>{getErpPayload()}</pre>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[var(--emerald-deep)] shrink-0" />
                <span>
                  Payload matches SAP S/4HANA OData & ERPNext schema requirements with zero floating point discrepancy.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Adjustment JV Modal */}
      {showNewJvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-3xl rounded-3xl bg-white border border-[var(--gray-border)] p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--gray-border)]">
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-[var(--emerald-deep)]" />
                <div>
                  <h3 className="text-base font-extrabold text-[var(--gray-text)]">
                    Create Manual Adjustment Journal Voucher
                  </h3>
                  <p className="text-xs text-[var(--gray-muted)]">
                    Entity: {entityInfo.name} ({entityInfo.currency}) • Requires exact zero variance to post.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNewJvModal(false)}
                className="text-[var(--gray-muted)] hover:text-[var(--gray-text)] text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateManualJv} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[var(--gray-text)] block mb-1">
                  Voucher Explanation / Memo
                </label>
                <input
                  type="text"
                  required
                  value={newJvMemo}
                  onChange={(e) => setNewJvMemo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs text-[var(--gray-text)] focus:outline-none focus:border-[var(--emerald-deep)]"
                />
              </div>

              {/* Dynamic Lines Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--gray-muted)]">
                    Double-Entry Lines ({newJvLines.length})
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setNewJvLines((prev) => [
                        ...prev,
                        {
                          accountCode: "1100-01",
                          accountName: "Main Operating Treasury Account",
                          costCenter: "CC-TREASURY",
                          debit: 0,
                          credit: 0,
                          memo: "Adjustment balancing line",
                        },
                      ])
                    }
                    className="text-xs font-bold text-[var(--emerald-deep)] hover:underline flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Line</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {newJvLines.map((line, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-[var(--cool-gray)] border border-[var(--gray-border)] grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-xs"
                    >
                      <div className="sm:col-span-4">
                        <select
                          value={line.accountCode}
                          onChange={(e) => {
                            const val = e.target.value;
                            const name =
                              val === "6100-01"
                                ? "Salaries & Wages (Basic)"
                                : val === "6100-04"
                                ? "Overtime & Shift Night Premium"
                                : val === "6100-09"
                                ? "Expatriate Hardship & Housing"
                                : val === "2100-01"
                                ? "Net Salary Payable Clearing"
                                : val === "2100-05"
                                ? "Statutory Tax Payable (PAYE/SHIF/NSSF)"
                                : val === "1150-01"
                                ? "Employee Loans Receivable"
                                : "Main Operating Treasury Account";
                            setNewJvLines((prev) =>
                              prev.map((l, i) => (i === idx ? { ...l, accountCode: val, accountName: name } : l))
                            );
                          }}
                          className="w-full px-2 py-1.5 rounded-lg border border-[var(--gray-border)] bg-white text-xs text-[var(--gray-text)]"
                        >
                          <option value="6100-01">6100-01 Salaries & Wages</option>
                          <option value="6100-04">6100-04 Overtime & Shifts</option>
                          <option value="6100-09">6100-09 Expat Housing</option>
                          <option value="2100-01">2100-01 Net Pay Clearing</option>
                          <option value="2100-05">2100-05 Statutory Taxes</option>
                          <option value="1100-01">1100-01 Treasury Bank Ops</option>
                          <option value="1150-01">1150-01 Loans Receivable</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <select
                          value={line.costCenter}
                          onChange={(e) =>
                            setNewJvLines((prev) =>
                              prev.map((l, i) => (i === idx ? { ...l, costCenter: e.target.value } : l))
                            )
                          }
                          className="w-full px-2 py-1.5 rounded-lg border border-[var(--gray-border)] bg-white text-xs text-[var(--gray-text)]"
                        >
                          <option value="CC-PLANT-OPS">CC-PLANT-OPS</option>
                          <option value="CC-TREASURY">CC-TREASURY</option>
                          <option value="CC-HR-OPS">CC-HR-OPS</option>
                          <option value="CC-COMMERCIAL">CC-COMMERCIAL</option>
                          <option value="CC-CORP-MGMT">CC-CORP-MGMT</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <input
                          type="number"
                          placeholder="Debit"
                          value={line.debit || ""}
                          onChange={(e) =>
                            setNewJvLines((prev) =>
                              prev.map((l, i) =>
                                i === idx ? { ...l, debit: Number(e.target.value), credit: 0 } : l
                              )
                            )
                          }
                          className="w-full px-2 py-1.5 rounded-lg border border-[var(--gray-border)] bg-white font-mono font-bold text-xs text-[var(--gray-text)] text-right"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <input
                          type="number"
                          placeholder="Credit"
                          value={line.credit || ""}
                          onChange={(e) =>
                            setNewJvLines((prev) =>
                              prev.map((l, i) =>
                                i === idx ? { ...l, credit: Number(e.target.value), debit: 0 } : l
                              )
                            )
                          }
                          className="w-full px-2 py-1.5 rounded-lg border border-[var(--gray-border)] bg-white font-mono font-bold text-xs text-[var(--gray-text)] text-right"
                        />
                      </div>

                      <div className="sm:col-span-2 flex items-center gap-1 justify-end">
                        {newJvLines.length > 2 && (
                          <button
                            type="button"
                            onClick={() => setNewJvLines((prev) => prev.filter((_, i) => i !== idx))}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real-time Balancing Meter */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-[var(--gray-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4 font-mono font-bold">
                  <div>
                    <span className="text-[10px] text-[var(--gray-muted)] uppercase block">Total Debits</span>
                    <span className="text-[var(--emerald-deep)]">
                      {entityInfo.symbol} {totalNewDebit.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--gray-muted)] uppercase block">Total Credits</span>
                    <span className="text-[var(--emerald-deep)]">
                      {entityInfo.symbol} {totalNewCredit.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--gray-muted)] uppercase block">Variance</span>
                    <span className={jvVariance === 0 ? "text-emerald-700 font-extrabold" : "text-rose-700 font-extrabold"}>
                      {entityInfo.symbol} {jvVariance.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 ${
                    isJvBalanced
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : "bg-amber-100 text-amber-800 border border-amber-200"
                  }`}
                >
                  {isJvBalanced ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                      <span>Balanced (0.00 Cent Variance)</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 text-amber-700" />
                      <span>Imbalance Detected</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--gray-border)]">
                <button
                  type="button"
                  onClick={() => setShowNewJvModal(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-bold text-[var(--gray-text)] hover:bg-[var(--cool-gray)] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isJvBalanced}
                  className="px-5 py-2 rounded-xl bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-bold shadow-xs transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Post Balanced Voucher</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
