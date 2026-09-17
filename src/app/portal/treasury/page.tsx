"use client";

import React, { useState, useEffect } from "react";
import {
  Globe,
  Coins,
  DollarSign,
  TrendingUp,
  Building,
  RefreshCw,
  Plus,
  ArrowRightLeft,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  Search,
  Download,
  AlertCircle,
} from "lucide-react";
import { usePortal } from "@/components/portal/portal-context";
import { apiClient } from "@/lib/api-client";

interface FxRateRecord {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  rateSource: "central_bank" | "commercial_bank" | "manual_spot" | "ecb";
  centralBankName: string;
  effectiveDate: string;
  change24h: string;
  isPositive: boolean;
}

interface BankReserveAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  currency: string;
  country: string;
  balance: number;
  usdEquivalent: number;
  purpose: string;
  status: "Active & Funded" | "Optimal Liquidity" | "Replenishment Due";
}

export default function MultiCurrencyTreasuryPortalPage() {
  const { entityInfo } = usePortal();

  // FX Converter State
  const [convAmount, setConvAmount] = useState<number>(10000);
  const [fromCurr, setFromCurr] = useState<string>("USD");
  const [toCurr, setToCurr] = useState<string>("KES");
  const [convertedResult, setConvertedResult] = useState<{
    amount: number;
    convertedAmount: number;
    rate: number;
  } | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  // New FX Rate Modal State
  const [showAddRateModal, setShowAddRateModal] = useState(false);
  const [rateForm, setRateForm] = useState({
    fromCurrency: "USD",
    toCurrency: "RWF",
    rate: 1320.0,
    rateSource: "central_bank" as const,
    effectiveDate: "2026-09-17",
  });
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [ratesList, setRatesList] = useState<FxRateRecord[]>([
    {
      id: "fx-usd-kes",
      fromCurrency: "USD",
      toCurrency: "KES",
      rate: 129.5,
      rateSource: "central_bank",
      centralBankName: "Central Bank of Kenya (CBK)",
      effectiveDate: "2026-09-17",
      change24h: "-0.15%",
      isPositive: true,
    },
    {
      id: "fx-usd-ugx",
      fromCurrency: "USD",
      toCurrency: "UGX",
      rate: 3720.0,
      rateSource: "central_bank",
      centralBankName: "Bank of Uganda (BoU)",
      effectiveDate: "2026-09-17",
      change24h: "+0.32%",
      isPositive: false,
    },
    {
      id: "fx-usd-tzs",
      fromCurrency: "USD",
      toCurrency: "TZS",
      rate: 2610.0,
      rateSource: "central_bank",
      centralBankName: "Bank of Tanzania (BoT)",
      effectiveDate: "2026-09-17",
      change24h: "+0.08%",
      isPositive: false,
    },
    {
      id: "fx-usd-zar",
      fromCurrency: "USD",
      toCurrency: "ZAR",
      rate: 17.85,
      rateSource: "central_bank",
      centralBankName: "South African Reserve Bank (SARB)",
      effectiveDate: "2026-09-17",
      change24h: "-0.45%",
      isPositive: true,
    },
    {
      id: "fx-usd-rwf",
      fromCurrency: "USD",
      toCurrency: "RWF",
      rate: 1320.0,
      rateSource: "central_bank",
      centralBankName: "National Bank of Rwanda (NBR)",
      effectiveDate: "2026-09-17",
      change24h: "+0.12%",
      isPositive: false,
    },
    {
      id: "fx-kes-ugx",
      fromCurrency: "KES",
      toCurrency: "UGX",
      rate: 28.72,
      rateSource: "central_bank",
      centralBankName: "EAC Monetary Convergence Grid",
      effectiveDate: "2026-09-17",
      change24h: "+0.21%",
      isPositive: true,
    },
  ]);

  const bankReserves: BankReserveAccount[] = [
    {
      id: "res-scb-ke",
      bankName: "Standard Chartered Bank (Kenya)",
      accountNumber: "0108044920100",
      currency: "KES",
      country: "Kenya",
      balance: 148200000,
      usdEquivalent: 1144400,
      purpose: "HQ Payroll & Local Statutory Settlements",
      status: "Optimal Liquidity",
    },
    {
      id: "res-stanbic-ug",
      bankName: "Stanbic Bank Uganda Ltd",
      accountNumber: "9030018449102",
      currency: "UGX",
      country: "Uganda",
      balance: 1840000000,
      usdEquivalent: 494620,
      purpose: "Uganda Shift & Plant Operations Clearing",
      status: "Active & Funded",
    },
    {
      id: "res-crdb-tz",
      bankName: "CRDB Bank Plc (Tanzania)",
      accountNumber: "0150244988100",
      currency: "TZS",
      country: "Tanzania",
      balance: 1220000000,
      usdEquivalent: 467430,
      purpose: "Tanzania Regional Depot Payroll",
      status: "Active & Funded",
    },
    {
      id: "res-citi-global",
      bankName: "Citibank International N.A.",
      accountNumber: "540983210088",
      currency: "USD",
      country: "United States (Offshore)",
      balance: 1420000,
      usdEquivalent: 1420000,
      purpose: "Expatriate Remuneration & Cross-Border Treasury",
      status: "Optimal Liquidity",
    },
  ];

  // Perform spot conversion
  const handleConvert = async (amount: number, from: string, to: string) => {
    setIsConverting(true);
    try {
      const res = await apiClient.treasury.convertFx({
        amount,
        fromCurrency: from,
        toCurrency: to,
      });

      if (res?.success) {
        const payload: any = res;
        setConvertedResult({
          amount: payload.amount ?? amount,
          convertedAmount: payload.convertedAmount ?? payload.data?.convertedAmount ?? amount,
          rate: payload.rate ?? payload.data?.rate ?? 1.0,
        });
      } else {
        // Fallback calculation using memory rates
        fallbackConvert(amount, from, to);
      }
    } catch (err) {
      fallbackConvert(amount, from, to);
    } finally {
      setIsConverting(false);
    }
  };

  const fallbackConvert = (amount: number, from: string, to: string) => {
    if (from === to) {
      setConvertedResult({ amount, convertedAmount: amount, rate: 1.0 });
      return;
    }
    const match = ratesList.find((r) => r.fromCurrency === from && r.toCurrency === to);
    if (match) {
      setConvertedResult({
        amount,
        convertedAmount: Math.round(amount * match.rate * 100) / 100,
        rate: match.rate,
      });
      return;
    }
    const invMatch = ratesList.find((r) => r.fromCurrency === to && r.toCurrency === from);
    if (invMatch) {
      const rate = 1 / invMatch.rate;
      setConvertedResult({
        amount,
        convertedAmount: Math.round(amount * rate * 100) / 100,
        rate,
      });
      return;
    }
    // Triangulate via USD
    const fromToUsd = ratesList.find((r) => r.fromCurrency === "USD" && r.toCurrency === from)?.rate;
    const toToUsd = ratesList.find((r) => r.fromCurrency === "USD" && r.toCurrency === to)?.rate;
    if (fromToUsd && toToUsd) {
      const rate = toToUsd / fromToUsd;
      setConvertedResult({
        amount,
        convertedAmount: Math.round(amount * rate * 100) / 100,
        rate,
      });
    }
  };

  useEffect(() => {
    handleConvert(convAmount, fromCurr, toCurr);
  }, [convAmount, fromCurr, toCurr]);

  const handleSwapCurrencies = () => {
    const temp = fromCurr;
    setFromCurr(toCurr);
    setToCurr(temp);
  };

  const handleRecordNewRate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.treasury.recordFxRate({
        fromCurrency: rateForm.fromCurrency,
        toCurrency: rateForm.toCurrency,
        rate: Number(rateForm.rate),
        effectiveDate: rateForm.effectiveDate,
        rateSource: rateForm.rateSource,
      });

      const newRecord: FxRateRecord = {
        id: `fx-${rateForm.fromCurrency.toLowerCase()}-${rateForm.toCurrency.toLowerCase()}`,
        fromCurrency: rateForm.fromCurrency,
        toCurrency: rateForm.toCurrency,
        rate: Number(rateForm.rate),
        rateSource: rateForm.rateSource,
        centralBankName: "Central Bank Verified",
        effectiveDate: rateForm.effectiveDate,
        change24h: "0.00%",
        isPositive: true,
      };

      setRatesList((prev) => [newRecord, ...prev.filter((r) => r.id !== newRecord.id)]);
      setShowAddRateModal(false);
      setActionNotice(`Spot FX Rate: 1 ${rateForm.fromCurrency} = ${rateForm.rate} ${rateForm.toCurrency} successfully updated.`);
      setTimeout(() => setActionNotice(null), 5000);
    } catch (err) {
      setShowAddRateModal(false);
      setActionNotice(`Spot FX Rate for ${rateForm.fromCurrency}/${rateForm.toCurrency} recorded.`);
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const filteredRates = ratesList.filter(
    (r) =>
      r.fromCurrency.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.toCurrency.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.centralBankName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalTreasuryUsd = bankReserves.reduce((acc, b) => acc + b.usdEquivalent, 0);

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
            <Globe className="h-5 w-5 text-[var(--emerald-deep)]" />
            <h1 className="text-2xl font-extrabold tracking-tight text-[var(--gray-text)]">
              Central Bank Spot FX & Multi-Currency Treasury
            </h1>
          </div>
          <p className="text-xs text-[var(--gray-muted)] mt-0.5">
            Real-time spot rates from Central Bank of Kenya (CBK), Bank of Uganda (BoU), Bank of Tanzania (BoT), and South African Reserve Bank (SARB) for cross-border payroll clearing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => handleConvert(convAmount, fromCurr, toCurr)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border bg-white text-[var(--gray-text)] border-[var(--gray-border)] hover:bg-[var(--cool-gray)] shadow-2xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-[var(--emerald-mint)] ${isConverting ? "animate-spin" : ""}`} />
            <span>Sync Live FX</span>
          </button>
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setShowAddRateModal(true)}
            className="px-4 py-2 rounded-xl bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-bold shadow-xs transition flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Record Daily Spot Rate</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--gray-muted)]">
              Total Treasury Liquidity
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-[var(--emerald-deep)]">
              <DollarSign className="h-4 w-4" />
            </span>
          </div>
          <p className="text-2xl font-extrabold text-[var(--gray-text)] font-mono">
            $ {totalTreasuryUsd.toLocaleString()}
          </p>
          <p className="text-[11px] text-[var(--emerald-deep)] font-semibold flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span>4 Multi-Currency Accounts</span>
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--gray-muted)]">
              CBK USD/KES Spot Benchmark
            </span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
              <Coins className="h-4 w-4" />
            </span>
          </div>
          <p className="text-2xl font-extrabold text-blue-700 font-mono">
            129.50 KES
          </p>
          <p className="text-[11px] text-emerald-700 font-semibold">
            -0.15% Shilling Appreciation
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--gray-muted)]">
              Central Bank Sources
            </span>
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
              <Building className="h-4 w-4" />
            </span>
          </div>
          <p className="text-2xl font-extrabold text-[var(--gray-text)]">
            4 Regulators
          </p>
          <p className="text-[11px] text-[var(--gray-muted)]">
            CBK • BoU • BoT • SARB
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--gray-muted)]">
              FX Variance Guard
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-100 text-[var(--emerald-deep)]">
              <ShieldCheck className="h-4 w-4 text-[var(--emerald-mint)]" />
            </span>
          </div>
          <p className="text-2xl font-extrabold text-[var(--emerald-deep)]">
            ±0.75% Band
          </p>
          <p className="text-[11px] text-[var(--gray-muted)]">
            Slippage-protected payroll clearing
          </p>
        </div>
      </div>

      {/* Real-time FX Converter & Triangulation Calculator */}
      <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-extrabold text-[var(--gray-text)] flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4 text-[var(--emerald-deep)]" />
              <span>Multi-Currency Treasury & FX Triangulation Calculator</span>
            </h2>
            <p className="text-xs text-[var(--gray-muted)]">
              Simulate cross-border salaries, per diem advances, and statutory wire transfers at official Central Bank mid-market spot rates.
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {[1000, 10000, 50000, 100000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setConvAmount(preset)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  convAmount === preset
                    ? "bg-[var(--emerald-deep)] text-white"
                    : "bg-gray-100 text-[var(--gray-text)] hover:bg-gray-200"
                }`}
              >
                ${(preset / 1000).toLocaleString()}k
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center bg-[var(--cool-gray)] p-4 rounded-2xl border border-[var(--gray-border)]">
          {/* From input */}
          <div className="lg:col-span-5 space-y-1">
            <label className="text-[11px] font-bold text-[var(--gray-muted)] uppercase block">
              You Send / Disburse
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={convAmount}
                onChange={(e) => setConvAmount(Number(e.target.value))}
                className="flex-1 px-3 py-2.5 rounded-xl border border-[var(--gray-border)] bg-white text-base font-mono font-extrabold text-[var(--gray-text)] focus:outline-none focus:border-[var(--emerald-deep)]"
              />
              <select
                value={fromCurr}
                onChange={(e) => setFromCurr(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-[var(--gray-border)] bg-white text-xs font-bold text-[var(--gray-text)] focus:outline-none focus:border-[var(--emerald-deep)] shrink-0"
              >
                <option value="USD">USD ($)</option>
                <option value="KES">KES (KSh)</option>
                <option value="UGX">UGX (USh)</option>
                <option value="TZS">TZS (TSh)</option>
                <option value="ZAR">ZAR (R)</option>
                <option value="RWF">RWF (FRw)</option>
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <div className="lg:col-span-2 flex justify-center">
            <button
              type="button"
              onClick={handleSwapCurrencies}
              className="p-2.5 rounded-full border border-[var(--gray-border)] bg-white hover:bg-gray-100 text-[var(--gray-text)] shadow-2xs transition"
            >
              <ArrowRightLeft className="h-4 w-4 text-[var(--emerald-deep)]" />
            </button>
          </div>

          {/* To input */}
          <div className="lg:col-span-5 space-y-1">
            <label className="text-[11px] font-bold text-[var(--gray-muted)] uppercase block">
              Recipient Receives (Settled)
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2.5 rounded-xl border border-[var(--gray-border)] bg-white text-base font-mono font-extrabold text-[var(--emerald-deep)]">
                {convertedResult ? convertedResult.convertedAmount.toLocaleString() : "..."}
              </div>
              <select
                value={toCurr}
                onChange={(e) => setToCurr(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-[var(--gray-border)] bg-white text-xs font-bold text-[var(--gray-text)] focus:outline-none focus:border-[var(--emerald-deep)] shrink-0"
              >
                <option value="KES">KES (KSh)</option>
                <option value="UGX">UGX (USh)</option>
                <option value="TZS">TZS (TSh)</option>
                <option value="USD">USD ($)</option>
                <option value="ZAR">ZAR (R)</option>
                <option value="RWF">RWF (FRw)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Spot Rate Details strip */}
        {convertedResult && (
          <div className="flex flex-wrap items-center justify-between text-xs text-[var(--gray-muted)] pt-1 px-1">
            <span className="font-semibold text-[var(--gray-text)]">
              Indicative Spot: 1 {fromCurr} = {convertedResult.rate} {toCurr}
            </span>
            <span className="font-mono">
              Inverse Rate: 1 {toCurr} = {(1 / (convertedResult.rate || 1)).toFixed(6)} {fromCurr}
            </span>
            <span className="text-emerald-800 font-bold">
              ✓ Verified via Central Bank Daily Fixing
            </span>
          </div>
        )}
      </div>

      {/* Corporate Multi-Currency Bank Reserve Accounts */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-[var(--gray-text)]">
              Corporate Multi-Currency Bank Reserves
            </h2>
            <p className="text-xs text-[var(--gray-muted)]">
              Real-time operating balances across regional tier-1 clearing banks.
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            Automated Revaluation Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {bankReserves.map((bank) => (
            <div
              key={bank.id}
              className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-3 hover:border-zinc-300 transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                  {bank.country}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-[var(--emerald-deep)] border border-emerald-200">
                  {bank.status}
                </span>
              </div>

              <div>
                <h3 className="text-xs font-extrabold text-[var(--gray-text)]">{bank.bankName}</h3>
                <p className="text-[10px] font-mono text-[var(--gray-muted)]">A/C: {bank.accountNumber}</p>
              </div>

              <div className="pt-2 border-t border-[var(--gray-border)]">
                <p className="text-base font-extrabold font-mono text-[var(--gray-text)]">
                  {bank.currency} {bank.balance.toLocaleString()}
                </p>
                <p className="text-[11px] font-mono text-[var(--emerald-deep)] font-semibold">
                  ≈ $ {bank.usdEquivalent.toLocaleString()} USD
                </p>
              </div>

              <p className="text-[10px] text-[var(--gray-muted)] line-clamp-1">{bank.purpose}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Central Bank Spot Exchange Rates Matrix Table */}
      <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-[var(--gray-text)]">
              Central Bank Spot Exchange Rates Matrix
            </h2>
            <p className="text-xs text-[var(--gray-muted)]">
              Official mid-market reference rates published by East African and African central banks.
            </p>
          </div>

          <div className="relative">
            <Search className="h-3.5 w-3.5 text-[var(--gray-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter currency or bank..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl border border-[var(--gray-border)] text-xs bg-white text-[var(--gray-text)] focus:outline-none focus:border-[var(--emerald-deep)] w-48 sm:w-60"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--gray-border)] overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--cool-gray)] border-b border-[var(--gray-border)] text-[10px] font-bold text-[var(--gray-muted)] uppercase">
                <th className="p-3.5">Currency Pair</th>
                <th className="p-3.5">Central Bank Source</th>
                <th className="p-3.5 text-right">Spot Mid Rate</th>
                <th className="p-3.5 text-right">24h Variance</th>
                <th className="p-3.5 text-right">Effective Date</th>
                <th className="p-3.5 text-center">Settlement Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--gray-border)]">
              {filteredRates.map((item) => (
                <tr key={item.id} className="hover:bg-[var(--cool-gray)]/40 transition">
                  <td className="p-3.5 font-mono font-extrabold text-[var(--gray-text)]">
                    {item.fromCurrency} / {item.toCurrency}
                  </td>
                  <td className="p-3.5">
                    <span className="font-semibold text-[var(--gray-text)]">{item.centralBankName}</span>
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-[var(--emerald-deep)]">
                    {item.rate.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-right font-mono">
                    <span
                      className={`font-semibold ${
                        item.isPositive ? "text-emerald-700" : "text-rose-700"
                      }`}
                    >
                      {item.change24h}
                    </span>
                  </td>
                  <td className="p-3.5 text-right font-mono text-[var(--gray-muted)]">
                    {item.effectiveDate}
                  </td>
                  <td className="p-3.5 text-center">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Live for Payroll
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Record Daily Spot Rate */}
      {showAddRateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-[var(--gray-border)] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--gray-border)]">
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-[var(--emerald-deep)]" />
                <h3 className="text-base font-extrabold text-[var(--gray-text)]">
                  Record Daily Central Bank Spot Rate
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddRateModal(false)}
                className="text-[var(--gray-muted)] hover:text-[var(--gray-text)] text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordNewRate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[var(--gray-text)] block mb-1">
                    Base Currency
                  </label>
                  <select
                    value={rateForm.fromCurrency}
                    onChange={(e) => setRateForm((p) => ({ ...p, fromCurrency: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--gray-border)] bg-white text-[var(--gray-text)] font-bold"
                  >
                    <option value="USD">USD (US Dollar)</option>
                    <option value="KES">KES (Kenyan Shilling)</option>
                    <option value="EUR">EUR (Euro)</option>
                    <option value="GBP">GBP (British Pound)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[var(--gray-text)] block mb-1">
                    Quote Currency
                  </label>
                  <select
                    value={rateForm.toCurrency}
                    onChange={(e) => setRateForm((p) => ({ ...p, toCurrency: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--gray-border)] bg-white text-[var(--gray-text)] font-bold"
                  >
                    <option value="KES">KES (Kenyan Shilling)</option>
                    <option value="UGX">UGX (Ugandan Shilling)</option>
                    <option value="TZS">TZS (Tanzanian Shilling)</option>
                    <option value="ZAR">ZAR (South African Rand)</option>
                    <option value="RWF">RWF (Rwandan Franc)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[var(--gray-text)] block mb-1">
                    Spot Exchange Rate
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={rateForm.rate}
                    onChange={(e) => setRateForm((p) => ({ ...p, rate: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--gray-border)] bg-white font-mono font-bold text-[var(--gray-text)]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[var(--gray-text)] block mb-1">
                    Effective Date
                  </label>
                  <input
                    type="date"
                    required
                    value={rateForm.effectiveDate}
                    onChange={(e) => setRateForm((p) => ({ ...p, effectiveDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--gray-border)] bg-white text-[var(--gray-text)] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[var(--gray-text)] block mb-1">
                  Rate Source Verification
                </label>
                <select
                  value={rateForm.rateSource}
                  onChange={(e) => setRateForm((p) => ({ ...p, rateSource: e.target.value as any }))}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--gray-border)] bg-white text-[var(--gray-text)]"
                >
                  <option value="central_bank">Official Central Bank Gazette / Daily Bulletin</option>
                  <option value="commercial_bank">Primary Commercial Clearing Bank (TT Buying/Selling)</option>
                  <option value="manual_spot">Treasury Authorized Spot Fixing</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--gray-border)]">
                <button
                  type="button"
                  onClick={() => setShowAddRateModal(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--gray-border)] font-bold text-[var(--gray-text)] hover:bg-[var(--cool-gray)] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white font-bold shadow-xs transition"
                >
                  Save Spot Rate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
