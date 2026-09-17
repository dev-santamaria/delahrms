"use client";

import React, { useState } from "react";
import {
  Smartphone,
  MapPin,
  Clock,
  Receipt,
  FileText,
  Calendar,
  CheckCircle2,
  Camera,
  Download,
  Sparkles,
  Wifi,
  Battery,
  ShieldCheck,
  ChevronRight,
  User,
  Bell,
} from "lucide-react";

export function MobileAppPreview() {
  const [mobileTab, setMobileTab] = useState<"clock" | "payslip" | "claim" | "leave">("clock");
  const [clockedIn, setClockedIn] = useState(false);
  const [claimCaptured, setClaimCaptured] = useState(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
      {/* Left Text Explainer */}
      <div className="lg:col-span-6 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--emerald-light)] border border-[var(--emerald-border)] text-xs font-semibold text-[var(--emerald-deep)]">
          <Smartphone className="h-3.5 w-3.5 text-[var(--emerald-mint)]" />
          <span>DelaHR Employee Self-Service Mobile Experience</span>
        </div>

        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--gray-text)] leading-tight">
          Put people operations right in your employees&apos; pockets.
        </h3>

        <p className="text-xs sm:text-sm text-[var(--gray-muted)] leading-relaxed">
          From field technicians and mining crews to remote knowledge workers, your team can clock in with GPS geofence boundaries, view itemized payslips, submit instant travel receipts, and request leave in seconds.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
          <div className="p-3.5 rounded-xl bg-[var(--cool-gray)] border border-[var(--gray-border)] space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-[var(--emerald-light)] text-[var(--emerald-deep)]">
                <MapPin className="h-4 w-4" />
              </div>
              <p className="font-bold text-[var(--gray-text)]">GPS Geofenced Clock-In</p>
            </div>
            <p className="text-[11px] text-[var(--gray-muted)] pl-8">
              Verifies physical presence inside designated plant or office perimeters before shift start.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--cool-gray)] border border-[var(--gray-border)] space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-[var(--emerald-light)] text-[var(--emerald-deep)]">
                <Receipt className="h-4 w-4" />
              </div>
              <p className="font-bold text-[var(--gray-text)]">Instant Receipt Capture</p>
            </div>
            <p className="text-[11px] text-[var(--gray-muted)] pl-8">
              On-device camera OCR extracts invoice tax numbers, date, and items for instant auto-approval.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--cool-gray)] border border-[var(--gray-border)] space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-[var(--emerald-light)] text-[var(--emerald-deep)]">
                <FileText className="h-4 w-4" />
              </div>
              <p className="font-bold text-[var(--gray-text)]">Itemized Payslip Ledger</p>
            </div>
            <p className="text-[11px] text-[var(--gray-muted)] pl-8">
              Crystal-clear breakdown of earnings, tax withholdings, social security, and 1-click PDF export.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--cool-gray)] border border-[var(--gray-border)] space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-[var(--emerald-light)] text-[var(--emerald-deep)]">
                <Calendar className="h-4 w-4" />
              </div>
              <p className="font-bold text-[var(--gray-text)]">Live Leave Balances</p>
            </div>
            <p className="text-[11px] text-[var(--gray-muted)] pl-8">
              Real-time accruals, shutdown bulk deduction notices, and rapid 3-day time-off booking.
            </p>
          </div>
        </div>
      </div>

      {/* Right: Realistic iPhone 16 Pro 6.1" Chassis */}
      <div className="lg:col-span-6 flex justify-center py-4">
        <div className="relative">
          {/* Side Buttons (Volume Rocker on Left, Power on Right) */}
          <div className="absolute -left-2 top-24 w-1 h-8 bg-zinc-700 rounded-l-sm" />
          <div className="absolute -left-2 top-36 w-1 h-12 bg-zinc-700 rounded-l-sm" />
          <div className="absolute -left-2 top-52 w-1 h-12 bg-zinc-700 rounded-l-sm" />
          <div className="absolute -right-2 top-32 w-1 h-16 bg-zinc-700 rounded-r-sm" />

          {/* iPhone Body */}
          <div className="w-[310px] sm:w-[330px] rounded-[50px] bg-zinc-950 p-2.5 shadow-2xl ring-1 ring-zinc-800 border-[6px] border-zinc-800">
            {/* Screen Bezel */}
            <div className="rounded-[40px] bg-white text-[var(--gray-text)] overflow-hidden flex flex-col justify-between h-[600px] border border-zinc-200 relative">
              
              {/* iOS Status Bar & Dynamic Island */}
              <div className="pt-2.5 px-6 pb-2 bg-white flex items-center justify-between relative z-20">
                <span className="text-[11px] font-bold text-zinc-900 tracking-tight font-mono">9:41</span>
                
                {/* Dynamic Island Pill */}
                <div className="h-5 w-24 bg-black rounded-full mx-auto flex items-center justify-between px-2 shadow-xs">
                  <div className="h-2 w-2 rounded-full bg-zinc-800" />
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                <div className="flex items-center gap-1.5 text-zinc-800 text-[10px]">
                  <Wifi className="h-3 w-3" />
                  <span className="font-bold text-[9px]">5G</span>
                  <Battery className="h-3.5 w-3.5 fill-zinc-800" />
                </div>
              </div>

              {/* App In-Header */}
              <div className="px-4 py-2 border-b border-[var(--gray-border)] flex items-center justify-between bg-white">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-[var(--emerald-light)] text-[var(--emerald-deep)] border border-[var(--emerald-border)] flex items-center justify-center font-bold text-xs">
                    NM
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--gray-text)] leading-tight">Nelson Mandela</p>
                    <p className="text-[10px] text-[var(--emerald-deep)] font-semibold">DelaHR Mobile</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[var(--emerald-mint)]" />
                  <Bell className="h-3.5 w-3.5 text-[var(--gray-muted)]" />
                </div>
              </div>

              {/* Dynamic Screen Viewport */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[var(--cool-gray)] text-xs">
                {/* 1. CLOCK-IN TAB */}
                {mobileTab === "clock" && (
                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs text-center space-y-3">
                      <div className="flex items-center justify-between text-[10px] text-[var(--gray-muted)]">
                        <span className="font-semibold uppercase tracking-wider">Site Roster Shift</span>
                        <span className="px-2 py-0.5 rounded-full bg-[var(--emerald-light)] text-[var(--emerald-deep)] font-bold">
                          Day Shift A
                        </span>
                      </div>

                      <div className="py-2">
                        <p className="text-3xl font-extrabold font-mono text-[var(--gray-text)]">
                          {clockedIn ? "08:14:22" : "07:58 AM"}
                        </p>
                        <p className="text-[11px] font-semibold text-[var(--emerald-deep)] mt-1 flex items-center justify-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-[var(--emerald-mint)]" />
                          <span>{clockedIn ? "Active Shift Verified" : "Inside GPS Geofence (32m)"}</span>
                        </p>
                      </div>

                      {/* Interactive Punch Clock Circle Button */}
                      <button
                        type="button"
                        suppressHydrationWarning
                        onClick={() => setClockedIn(!clockedIn)}
                        className={`w-full py-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
                          clockedIn
                            ? "bg-rose-600 hover:bg-rose-700 text-white"
                            : "bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white"
                        }`}
                      >
                        <Clock className="h-4 w-4" />
                        <span>{clockedIn ? "Clock Out for Duty Rest" : "Punch In for Shift"}</span>
                      </button>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-[var(--gray-border)] flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2 text-[var(--gray-text)]">
                        <MapPin className="h-3.5 w-3.5 text-[var(--emerald-deep)]" />
                        <span className="font-medium">HQ Industrial Plant B</span>
                      </div>
                      <span className="text-[10px] font-bold text-[var(--emerald-deep)]">Verified</span>
                    </div>
                  </div>
                )}

                {/* 2. PAYSLIP TAB */}
                {mobileTab === "payslip" && (
                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-[var(--gray-muted)]">
                          September 2026 Payout
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--emerald-light)] text-[var(--emerald-deep)] font-bold">
                          Direct Cleared
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] text-[var(--gray-muted)]">Net Disbursed</span>
                        <p className="text-2xl font-extrabold font-mono text-[var(--emerald-deep)]">
                          $4,280.00
                        </p>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-[var(--gray-border)] text-[11px] font-mono">
                        <div className="flex justify-between text-[var(--gray-text)]">
                          <span className="text-[var(--gray-muted)]">Gross Base Pay:</span>
                          <span>$5,100.00</span>
                        </div>
                        <div className="flex justify-between text-[var(--gray-text)]">
                          <span className="text-[var(--gray-muted)]">Night Shift Premium:</span>
                          <span className="text-[var(--emerald-deep)]">+$350.00</span>
                        </div>
                        <div className="flex justify-between text-rose-600">
                          <span>Statutory Withholding:</span>
                          <span>-$1,170.00</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="w-full py-2 rounded-lg border border-[var(--gray-border)] bg-[var(--cool-gray)] text-[11px] font-bold flex items-center justify-center gap-1.5 text-[var(--gray-text)] hover:bg-gray-200 transition"
                      >
                        <Download className="h-3.5 w-3.5 text-[var(--emerald-deep)]" />
                        <span>Download Signed PDF</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. EXPENSE / RECEIPT TAB */}
                {mobileTab === "claim" && (
                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-[var(--gray-muted)]">
                          AI Mobile Receipt Scan
                        </span>
                        <span className="text-[10px] text-[var(--emerald-deep)] font-bold">OCR Ready</span>
                      </div>

                      {claimCaptured ? (
                        <div className="p-3 rounded-xl bg-[var(--emerald-light)] border border-[var(--emerald-border)] space-y-2 text-[11px]">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-[var(--emerald-deep)]" />
                            <p className="font-bold text-[var(--emerald-deep)]">Invoice #REC-9821 Verified</p>
                          </div>
                          <p className="text-[var(--emerald-deep)] font-mono">$85.40 • Business Dinner</p>
                          <button
                            type="button"
                            suppressHydrationWarning
                            onClick={() => setClaimCaptured(false)}
                            className="text-[10px] text-[var(--emerald-deep)] underline font-bold"
                          >
                            Scan Another Document
                          </button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-[var(--gray-border)] p-5 rounded-xl text-center space-y-2 bg-[var(--cool-gray)]">
                          <Camera className="h-7 w-7 text-[var(--emerald-deep)] mx-auto" />
                          <p className="text-[11px] text-[var(--gray-muted)]">Align fiscal receipt within frame</p>
                          <button
                            type="button"
                            suppressHydrationWarning
                            onClick={() => setClaimCaptured(true)}
                            className="px-4 py-1.5 rounded-lg bg-[var(--emerald-deep)] text-white text-[11px] font-bold shadow-xs hover:bg-[var(--emerald-deep-hover)] transition"
                          >
                            Capture & Match
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. LEAVE TAB */}
                {mobileTab === "leave" && (
                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-3">
                      <span className="text-[10px] font-bold uppercase text-[var(--gray-muted)]">
                        Time-Off Accrual Ledger
                      </span>

                      <div className="flex items-baseline justify-between">
                        <div>
                          <p className="text-2xl font-extrabold font-mono text-[var(--gray-text)]">18.0</p>
                          <span className="text-[10px] text-[var(--gray-muted)]">Days Annual Leave</span>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-extrabold font-mono text-zinc-600">10.0</p>
                          <span className="text-[10px] text-[var(--gray-muted)]">Days Sick Leave</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[10px] text-amber-900 leading-snug">
                        Corporate Holiday Shutdown Dec 24 – Jan 2 (6 days auto-reserved).
                      </div>

                      <button
                        type="button"
                        className="w-full py-2 rounded-xl bg-[var(--emerald-deep)] text-white text-[11px] font-bold shadow-xs hover:bg-[var(--emerald-deep-hover)] transition"
                      >
                        Request Time Off
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* iOS Bottom Navigation Tab Bar */}
              <div className="bg-white border-t border-[var(--gray-border)] px-4 py-2 flex items-center justify-between text-[10px] font-bold text-[var(--gray-muted)] relative z-20">
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setMobileTab("clock")}
                  className={`flex flex-col items-center gap-1 transition ${
                    mobileTab === "clock" ? "text-[var(--emerald-deep)]" : "hover:text-[var(--gray-text)]"
                  }`}
                >
                  <Clock className="h-4 w-4" />
                  <span>Clock</span>
                </button>

                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setMobileTab("payslip")}
                  className={`flex flex-col items-center gap-1 transition ${
                    mobileTab === "payslip" ? "text-[var(--emerald-deep)]" : "hover:text-[var(--gray-text)]"
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  <span>Payslip</span>
                </button>

                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setMobileTab("claim")}
                  className={`flex flex-col items-center gap-1 transition ${
                    mobileTab === "claim" ? "text-[var(--emerald-deep)]" : "hover:text-[var(--gray-text)]"
                  }`}
                >
                  <Receipt className="h-4 w-4" />
                  <span>Claim</span>
                </button>

                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setMobileTab("leave")}
                  className={`flex flex-col items-center gap-1 transition ${
                    mobileTab === "leave" ? "text-[var(--emerald-deep)]" : "hover:text-[var(--gray-text)]"
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                  <span>Leave</span>
                </button>
              </div>

              {/* Bottom Home Indicator */}
              <div className="pb-1 bg-white flex justify-center">
                <div className="h-1 w-28 bg-zinc-400 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
