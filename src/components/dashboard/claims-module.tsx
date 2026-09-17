"use client";

import React, { useState } from "react";
import {
  Receipt,
  UploadCloud,
  CheckCircle2,
  Clock,
  Check,
  AlertCircle,
  Plus,
  DollarSign,
  FileText,
  Smartphone,
  CreditCard,
} from "lucide-react";

interface ExpenseClaim {
  id: string;
  claimNumber: string;
  employeeName: string;
  category: string;
  merchant: string;
  date: string;
  amount: number;
  currency: string;
  payoutRoute: "via_payroll" | "direct_payout";
  status: "approved" | "under_review" | "paid" | "rejected";
  receiptName: string;
  ocrVerified: boolean;
}

export function ClaimsModule() {
  const [claims, setClaims] = useState<ExpenseClaim[]>([
    {
      id: "clm-001",
      claimNumber: "EXP-2026-088",
      employeeName: "Nelson Mandela CP",
      category: "Client Entertainment & Travel",
      merchant: "Uber & Serena Hotel",
      date: "2026-09-14",
      amount: 4500,
      currency: "KES",
      payoutRoute: "via_payroll",
      status: "approved",
      receiptName: "uber_serena_dinner_receipt_4500.pdf",
      ocrVerified: true,
    },
    {
      id: "clm-002",
      claimNumber: "EXP-2026-091",
      employeeName: "Amina Odhiambo",
      category: "Flights & Lodging",
      merchant: "Kenya Airways",
      date: "2026-09-18",
      amount: 28500,
      currency: "KES",
      payoutRoute: "via_payroll",
      status: "under_review",
      receiptName: "kq_flight_mombasa_28500.pdf",
      ocrVerified: true,
    },
    {
      id: "clm-003",
      claimNumber: "EXP-2026-094",
      employeeName: "David Kiprono",
      category: "Field Operations & Telecom",
      merchant: "Safaricom Airtime & Shell",
      date: "2026-09-20",
      amount: 3200,
      currency: "KES",
      payoutRoute: "direct_payout",
      status: "paid",
      receiptName: "safaricom_fuel_receipt_3200.jpg",
      ocrVerified: true,
    },
  ]);

  // Form State
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [employeeName, setEmployeeName] = useState("Nelson Mandela CP");
  const [category, setCategory] = useState("Travel, Flights & Lodging");
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [payoutRoute, setPayoutRoute] = useState<"via_payroll" | "direct_payout">("via_payroll");
  const [fileName, setFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleSimulateFile = () => {
    setFileName("official_expense_vat_receipt.pdf");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchant || !amount) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newClaim: ExpenseClaim = {
        id: `clm-${Date.now()}`,
        claimNumber: `EXP-2026-${Math.floor(100 + Math.random() * 900)}`,
        employeeName,
        category,
        merchant,
        date: new Date().toISOString().split("T")[0],
        amount: parseFloat(amount),
        currency: "KES",
        payoutRoute,
        status: "approved",
        receiptName: fileName || "tax_invoice_receipt.pdf",
        ocrVerified: true,
      };

      setClaims([newClaim, ...claims]);
      setIsSubmitting(false);
      setShowSubmitModal(false);
      setMerchant("");
      setAmount("");
      setFileName("");
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header & Submit Button */}
      <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-amber-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Employee Claims & Receipt Expense Hub
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
              OCR Receipt Extraction Active
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            End-to-end receipt verification, policy limit checks, and dual reimbursement paths (Payroll vs M-Pesa Disbursal)
          </p>
        </div>

        <button
          onClick={() => setShowSubmitModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition shadow-lg shadow-amber-500/20"
        >
          <Plus className="h-4 w-4" />
          <span>Submit New Expense Claim</span>
        </button>
      </div>

      {/* Claims List Table */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
            Active Employee Expenditure Claims ({claims.length})
          </h3>
          <span className="text-[11px] text-zinc-400">Tax invoices confirmed with OCR verification</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/60 text-zinc-400 text-[11px] border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Claim Ref</th>
                <th className="py-3 px-3">Employee</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Merchant</th>
                <th className="py-3 px-3">Receipt Document</th>
                <th className="py-3 px-3">Reimbursement Route</th>
                <th className="py-3 px-3 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {claims.map((claim) => (
                <tr key={claim.id} className="hover:bg-zinc-800/30 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">{claim.claimNumber}</td>
                  <td className="py-3.5 px-3 font-semibold text-zinc-200">{claim.employeeName}</td>
                  <td className="py-3.5 px-3 text-zinc-300">{claim.category}</td>
                  <td className="py-3.5 px-3 text-zinc-400 font-medium">{claim.merchant}</td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-1.5 text-zinc-300">
                      <FileText className="h-3.5 w-3.5 text-amber-400" />
                      <span className="truncate max-w-[140px] text-[11px]">{claim.receiptName}</span>
                      {claim.ocrVerified && (
                        <span title="OCR ETR Matched">
                          <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    {claim.payoutRoute === "via_payroll" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        <CreditCard className="h-3 w-3" />
                        Via Payroll
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        <Smartphone className="h-3 w-3" />
                        Instant M-Pesa
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-zinc-100">
                    {claim.currency} {claim.amount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span
                      className={`text-[10px] px-2.5 py-1 rounded-full font-semibold capitalize ${
                        claim.status === "approved"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : claim.status === "paid"
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {claim.status === "approved" ? "Approved for Pay" : claim.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Receipt className="h-5 w-5 text-amber-400" />
              New Expense Claim & Receipt Verification
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 font-medium mb-1">Employee</label>
                <input
                  type="text"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200"
                  >
                    <option>Travel, Flights & Lodging</option>
                    <option>Client Entertainment & Team Meals</option>
                    <option>Office Stationery & Equipment</option>
                    <option>Telecom & Mobile Airtime</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Merchant / Vendor</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Uber / Serena Hotel"
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1">Amount (KES)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 4500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 font-mono"
                />
              </div>

              {/* Receipt Drag & Drop Zone */}
              <div>
                <label className="block text-zinc-400 font-medium mb-1">Receipt Document Upload (OCR Validation)</label>
                <div className="border-2 border-dashed border-zinc-800 hover:border-amber-500/50 rounded-xl p-4 text-center transition bg-zinc-900/40">
                  <UploadCloud className="h-6 w-6 text-zinc-400 mx-auto mb-1" />
                  <p className="text-zinc-300 font-medium">{fileName || "Drag receipt image / PDF here"}</p>
                  <p className="text-[10px] text-zinc-400 mt-1">Supports PNG, JPG, PDF up to 10MB</p>
                  <button
                    type="button"
                    onClick={handleSimulateFile}
                    className="mt-2 text-[10px] text-amber-400 underline hover:text-amber-300"
                  >
                    Attach Sample Verified ETR Tax Receipt
                  </button>
                </div>
              </div>

              {/* Reimbursement Route */}
              <div>
                <label className="block text-zinc-400 font-medium mb-1">Reimbursement Route</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPayoutRoute("via_payroll")}
                    className={`p-2.5 rounded-lg border text-left transition ${
                      payoutRoute === "via_payroll"
                        ? "bg-indigo-500/15 border-indigo-500 text-indigo-200"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400"
                    }`}
                  >
                    <p className="font-semibold text-xs">Next Payroll Payslip</p>
                    <p className="text-[10px] text-zinc-400">Added tax-free to net pay</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayoutRoute("direct_payout")}
                    className={`p-2.5 rounded-lg border text-left transition ${
                      payoutRoute === "direct_payout"
                        ? "bg-emerald-500/15 border-emerald-500 text-emerald-200"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400"
                    }`}
                  >
                    <p className="font-semibold text-xs">Direct M-Pesa Disbursal</p>
                    <p className="text-[10px] text-zinc-400">Instant B2C mobile transfer</p>
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold shadow-lg shadow-amber-500/20"
                >
                  {isSubmitting ? "Verifying..." : "Submit Claim"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
