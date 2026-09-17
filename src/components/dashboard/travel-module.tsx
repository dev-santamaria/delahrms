"use client";

import React, { useState } from "react";
import {
  Plane,
  FileCheck2,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  QrCode,
  ShieldCheck,
  Calendar,
  Building2,
  Receipt,
  ArrowRight,
  TrendingUp,
  RefreshCw,
} from "lucide-react";

interface TravelRequest {
  id: string;
  travelNumber: string;
  employeeName: string;
  destinationCountry: string;
  destinationCity: string;
  countryFlag: string;
  tripType: "domestic_local" | "regional_cross_border" | "international";
  departureDate: string;
  returnDate: string;
  totalDays: number;
  totalEstimatedBudget: number;
  currency: string;
  cashAdvanceDisbursed: number;
  payoutRoute: string;
  status: "approved" | "advance_disbursed" | "in_travel" | "reconciliation_pending" | "settled";
  fiscalRegime: string;
  receiptPolicy: "scale_rate_no_receipt" | "actuals_with_fiscal_verification";
}

export function TravelModule() {
  const [requests, setRequests] = useState<TravelRequest[]>([
    {
      id: "trv-001",
      travelNumber: "TRV-2026-0042",
      employeeName: "Nelson Mandela CP",
      destinationCountry: "Rwanda",
      destinationCity: "Kigali (East Africa Hub)",
      countryFlag: "🇷🇼",
      tripType: "regional_cross_border",
      departureDate: "2026-10-05",
      returnDate: "2026-10-10",
      totalDays: 5,
      totalEstimatedBudget: 1450,
      currency: "USD",
      cashAdvanceDisbursed: 1200,
      payoutRoute: "Direct Mobile Money (M-Pesa B2C)",
      status: "advance_disbursed",
      fiscalRegime: "Rwanda RRA Electronic Billing Machine (EBM v2)",
      receiptPolicy: "scale_rate_no_receipt",
    },
    {
      id: "trv-002",
      travelNumber: "TRV-2026-0043",
      employeeName: "David Kiprono",
      destinationCountry: "Tanzania",
      destinationCity: "Arusha (Mining Operations Site)",
      countryFlag: "🇹🇿",
      tripType: "regional_cross_border",
      departureDate: "2026-10-12",
      returnDate: "2026-10-19",
      totalDays: 7,
      totalEstimatedBudget: 950,
      currency: "USD",
      cashAdvanceDisbursed: 800,
      payoutRoute: "Direct Bank Wire (EFT)",
      status: "in_travel",
      fiscalRegime: "Tanzania TRA Virtual Fiscal Device (VFD/EFD)",
      receiptPolicy: "actuals_with_fiscal_verification",
    },
    {
      id: "trv-003",
      travelNumber: "TRV-2026-0044",
      employeeName: "Amina Odhiambo",
      destinationCountry: "United Kingdom",
      destinationCity: "London (Global HQ)",
      countryFlag: "🇬🇧",
      tripType: "international",
      departureDate: "2026-11-01",
      returnDate: "2026-11-08",
      totalDays: 7,
      totalEstimatedBudget: 3200,
      currency: "USD",
      cashAdvanceDisbursed: 2800,
      payoutRoute: "Corporate Bank Transfer",
      status: "approved",
      fiscalRegime: "HMRC Scale Rate (No Receipt Required)",
      receiptPolicy: "scale_rate_no_receipt",
    },
  ]);

  const [selectedRequest, setSelectedRequest] = useState<TravelRequest | null>(null);
  const [actualExpensesInput, setActualExpensesInput] = useState<number>(1350);
  const [fiscalVerificationNotice, setFiscalVerificationNotice] = useState<string | null>(null);

  const handleSimulateFiscalScan = () => {
    setFiscalVerificationNotice(
      "✅ Tax Authority Verification Successful: Control Unit [CU-RW-994812] validated against RRA / ETIMS live registry."
    );
    setTimeout(() => setFiscalVerificationNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Plane className="h-5 w-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Pre-Trip Travel Logistics, Per Diem & Universal Fiscal Verification
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              Global Scale-Rate & e-Invoice Ready
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Pre-trip travel authorizations, instant cash advances outside payroll, statutory scale-rate per diems (US/UK/UN), and global fiscal invoice verification (ETIMS/VFD/EBM/EFRIS)
          </p>
        </div>

        <button
          onClick={() => setSelectedRequest(requests[0])}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition flex items-center gap-1.5"
        >
          <Receipt className="h-4 w-4" />
          <span>Reconcile Travel Advance</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
          <p className="text-xs text-zinc-400">Active Travel Authorizations</p>
          <p className="text-2xl font-bold text-white tracking-tight">3 Trips</p>
          <p className="text-[11px] text-zinc-500">Rwanda, Tanzania, United Kingdom</p>
        </div>
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
          <p className="text-xs text-zinc-400">Cash Advances Disbursed (Non-Payroll)</p>
          <p className="text-2xl font-bold text-emerald-400 tracking-tight">$4,800.00</p>
          <p className="text-[11px] text-zinc-500">Disbursed directly via M-Pesa & Bank wire</p>
        </div>
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
          <p className="text-xs text-zinc-400">Scale-Rate Per Diem Compliance</p>
          <p className="text-2xl font-bold text-indigo-400 tracking-tight">IRS & HMRC</p>
          <p className="text-[11px] text-zinc-500">Zero-receipt allowance policies active</p>
        </div>
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
          <p className="text-xs text-zinc-400">Universal Fiscalization</p>
          <p className="text-2xl font-bold text-amber-400 tracking-tight">ETIMS & EBM</p>
          <p className="text-[11px] text-zinc-500">Live QR / Control Unit validation enabled</p>
        </div>
      </div>

      {/* Notice Banner */}
      {fiscalVerificationNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{fiscalVerificationNotice}</span>
        </div>
      )}

      {/* Travel Authorizations Table */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
              Workforce Travel Requests & Cash Advance Registry
            </h3>
            <p className="text-[11px] text-zinc-400">Pre-approved budgets, advance disbursements, and fiscal compliance</p>
          </div>
          <button
            onClick={handleSimulateFiscalScan}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition flex items-center gap-1.5"
          >
            <QrCode className="h-3.5 w-3.5 text-amber-400" />
            <span>Verify Fiscal QR Code</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/60 text-zinc-400 text-[11px] border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Trip Number & Employee</th>
                <th className="py-3 px-3">Destination</th>
                <th className="py-3 px-3">Travel Window</th>
                <th className="py-3 px-3">Approved Budget</th>
                <th className="py-3 px-3">Cash Advance (Non-Payroll)</th>
                <th className="py-3 px-3">Fiscal & Receipt Policy</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-zinc-800/30 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-zinc-200">{r.employeeName}</div>
                    <div className="text-[10px] font-mono text-zinc-400">{r.travelNumber}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-1.5 font-medium text-zinc-200">
                      <span className="text-base leading-none">{r.countryFlag}</span>
                      <span>{r.destinationCity}</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 capitalize">{r.tripType.replace(/_/g, " ")}</div>
                  </td>
                  <td className="py-3.5 px-3 text-zinc-300">
                    <div>{r.departureDate} to {r.returnDate}</div>
                    <div className="text-[10px] text-zinc-500">{r.totalDays} Days Itinerary</div>
                  </td>
                  <td className="py-3.5 px-3 font-mono font-medium text-zinc-200">
                    {r.currency} {r.totalEstimatedBudget.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="font-mono font-bold text-emerald-400">
                      {r.currency} {r.cashAdvanceDisbursed.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-zinc-500">{r.payoutRoute}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="font-medium text-zinc-300">{r.fiscalRegime}</div>
                    <div className="text-[10px] text-indigo-400">
                      {r.receiptPolicy === "scale_rate_no_receipt" ? "Scale Rate (No Receipt Required)" : "Fiscal Tax Receipts Mandatory"}
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 capitalize">
                      {r.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedRequest(r)}
                      className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-medium border border-zinc-700 transition"
                    >
                      Audit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Post-Trip Settlement & Reconciliation Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-indigo-400" />
                  Post-Trip Travel Reconciliation: {selectedRequest.travelNumber}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {selectedRequest.employeeName} • {selectedRequest.destinationCity} ({selectedRequest.totalDays} Days)
                </p>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-zinc-400 hover:text-zinc-200 text-sm p-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs">
              <div>
                <p className="text-zinc-500 uppercase tracking-wider text-[10px]">Pre-Trip Cash Advance Disbursed:</p>
                <p className="text-base font-bold font-mono text-emerald-400 mt-1">
                  {selectedRequest.currency} {selectedRequest.cashAdvanceDisbursed.toFixed(2)}
                </p>
                <p className="text-[10px] text-zinc-500 mt-0.5">{selectedRequest.payoutRoute}</p>
              </div>
              <div>
                <p className="text-zinc-500 uppercase tracking-wider text-[10px]">Fiscal & Receipt Compliance:</p>
                <p className="text-xs font-semibold text-zinc-200 mt-1">{selectedRequest.fiscalRegime}</p>
                <p className="text-[10px] text-indigo-400 mt-0.5">Scale-Rate Per Diem: No receipts needed for meals</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-300">
                Total Verified Post-Trip Expenses ({selectedRequest.currency}):
              </label>
              <input
                type="number"
                value={actualExpensesInput}
                onChange={(e) => setActualExpensesInput(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Net Settlement Variance Calculation */}
            {(() => {
              const variance = actualExpensesInput - selectedRequest.cashAdvanceDisbursed;
              return (
                <div
                  className={`p-4 rounded-xl border text-xs space-y-1 ${
                    variance > 0
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                      : variance < 0
                      ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300"
                      : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  }`}
                >
                  <p className="font-bold flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4" />
                    Net Settlement Variance: {selectedRequest.currency} {variance.toFixed(2)}
                  </p>
                  <p className="text-[11px] text-zinc-300">
                    {variance > 0
                      ? `Company owes employee reimbursement of ${selectedRequest.currency} ${variance.toFixed(2)} (Direct payout)`
                      : variance < 0
                      ? `Employee must refund ${selectedRequest.currency} ${Math.abs(variance).toFixed(2)} to company treasury (or deducted on next payroll)`
                      : "Perfect zero balance. Cash advance matches verified expenses exactly."}
                  </p>
                </div>
              );
            })()}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setFiscalVerificationNotice("✅ Travel reconciliation approved and posted to Treasury sub-ledger!");
                  setTimeout(() => setFiscalVerificationNotice(null), 4000);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition"
              >
                Approve & Settle Advance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
