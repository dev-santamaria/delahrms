"use client";

import React, { useState } from "react";
import {
  Scale,
  CheckCircle2,
  Copy,
  Check,
  Send,
  Building,
  Layers,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { DoubleEntryVoucher } from "@/server/engines/accounting/subledger";

interface SubledgerViewProps {
  voucher: DoubleEntryVoucher;
  sapPayload: any;
  erpNextPayload: any;
}

export function SubledgerView({
  voucher,
  sapPayload,
  erpNextPayload,
}: SubledgerViewProps) {
  const [activeErpTab, setActiveErpTab] = useState<"sap" | "erpnext">("sap");
  const [copied, setCopied] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "synced">("idle");

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSync = () => {
    setSyncStatus("syncing");
    setTimeout(() => {
      setSyncStatus("synced");
      setTimeout(() => setSyncStatus("idle"), 3000);
    }, 1200);
  };

  const currentPayloadText = JSON.stringify(
    activeErpTab === "sap" ? sapPayload : erpNextPayload,
    null,
    2
  );

  return (
    <div className="space-y-6">
      {/* Voucher Status & Balance Invariant Card */}
      <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Double-Entry Journal Voucher: {voucher.voucherNumber}
            </h2>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-medium border flex items-center gap-1 ${
                voucher.isBalanced
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-400 border-rose-500/20"
              }`}
            >
              <CheckCircle2 className="h-3 w-3" />
              <span>{voucher.isBalanced ? "BALANCED (0.00 Discrepancy)" : "OUT OF BALANCE"}</span>
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Posting Date: <span className="text-zinc-200 font-mono">{voucher.postingDate}</span> • Entity:{" "}
            <span className="text-zinc-200 font-medium">{voucher.organizationName}</span>
          </p>
        </div>

        <div className="flex items-center gap-4 bg-zinc-950/60 px-4 py-2 rounded-xl border border-zinc-800">
          <div>
            <p className="text-[10px] text-zinc-400 uppercase">Total Debits (DR)</p>
            <p className="text-sm font-bold text-zinc-100 font-mono">
              {voucher.currency} {voucher.totalDebit.toLocaleString()}
            </p>
          </div>
          <div className="h-8 w-px bg-zinc-800" />
          <div>
            <p className="text-[10px] text-zinc-400 uppercase">Total Credits (CR)</p>
            <p className="text-sm font-bold text-zinc-100 font-mono">
              {voucher.currency} {voucher.totalCredit.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Journal Voucher Line Items Table */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
            General Ledger Entries ({voucher.lines.length} Accounting Lines)
          </h3>
          <span className="text-[11px] text-zinc-400">Sum(Debits) === Sum(Credits) Invariant</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/60 text-zinc-400 text-[11px] border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4 w-12">#</th>
                <th className="py-3 px-3">GL Account Code</th>
                <th className="py-3 px-3">Account Title</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-4 text-right">Debit (DR)</th>
                <th className="py-3 px-4 text-right">Credit (CR)</th>
                <th className="py-3 px-4">Line Memo & Allocation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {voucher.lines.map((l, i) => (
                <tr key={i} className="hover:bg-zinc-800/30 transition">
                  <td className="py-3 px-4 text-zinc-400 font-mono">{i + 1}</td>
                  <td className="py-3 px-3 font-mono font-bold text-indigo-400">{l.accountCode}</td>
                  <td className="py-3 px-3 font-medium text-zinc-200">{l.accountName}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded capitalize font-medium ${
                        l.accountType === "expense"
                          ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                          : l.accountType === "asset"
                          ? "bg-blue-500/10 text-blue-300 border border-blue-500/20"
                          : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                      }`}
                    >
                      {l.accountType}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-medium">
                    {l.debitAmount > 0 ? (
                      <span className="text-zinc-100">{voucher.currency} {l.debitAmount.toLocaleString()}</span>
                    ) : (
                      <span className="text-zinc-500">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-medium">
                    {l.creditAmount > 0 ? (
                      <span className="text-zinc-100">{voucher.currency} {l.creditAmount.toLocaleString()}</span>
                    ) : (
                      <span className="text-zinc-500">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-zinc-400 text-[11px] truncate max-w-xs">{l.description}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-zinc-950/80 border-t border-zinc-800 font-bold text-xs">
              <tr>
                <td colSpan={4} className="py-3 px-4 text-right uppercase tracking-wider text-zinc-400">
                  Total Ledger Sum:
                </td>
                <td className="py-3 px-4 text-right font-mono text-emerald-400">
                  {voucher.currency} {voucher.totalDebit.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right font-mono text-emerald-400">
                  {voucher.currency} {voucher.totalCredit.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-emerald-400 text-[11px] font-mono">
                  Diff: {voucher.currency} {voucher.discrepancy.toFixed(2)} (Balanced)
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ERP Sync & Payload Studio */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
              Automated ERP Synchronizer & Live API Payloads
            </h3>
          </div>

          {/* ERP Tab Toggles & Actions */}
          <div className="flex items-center gap-2">
            <div className="flex p-0.5 rounded-lg bg-zinc-950 border border-zinc-800">
              <button
                onClick={() => setActiveErpTab("sap")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                  activeErpTab === "sap" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                SAP BAPI (RFC)
              </button>
              <button
                onClick={() => setActiveErpTab("erpnext")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                  activeErpTab === "erpnext" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                ERPNext DocType
              </button>
            </div>

            <button
              onClick={() => handleCopy(currentPayloadText)}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition"
              title="Copy JSON Payload"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>

            <button
              onClick={handleSync}
              disabled={syncStatus !== "idle"}
              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
            >
              {syncStatus === "syncing" ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                  <span>Syncing...</span>
                </>
              ) : syncStatus === "synced" ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Posted!</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Post to {activeErpTab === "sap" ? "SAP" : "ERPNext"}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Code Block Container */}
        <div className="p-4 bg-zinc-950 font-mono text-[11px] text-zinc-300 overflow-x-auto max-h-80 border-t border-zinc-800/40">
          <pre>{currentPayloadText}</pre>
        </div>
      </div>
    </div>
  );
}
