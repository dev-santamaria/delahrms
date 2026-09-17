"use client";

import React from "react";
import Link from "next/link";
import { Activity, ShieldCheck, Clock, ArrowLeft, CheckCircle2, Server, HelpCircle } from "lucide-react";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";

export default function SlaPage() {
  return (
    <div className="min-h-screen bg-[var(--cool-gray)] text-[var(--gray-text)] font-sans antialiased flex flex-col">
      <SiteHeader />

      <main className="flex-1 py-12">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-[var(--gray-muted)]">
            <Link href="/" className="hover:text-[var(--emerald-deep)] flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Home</span>
            </Link>
            <span>/</span>
            <span className="font-semibold text-[var(--gray-text)]">Service Level Agreement</span>
          </div>

          {/* Header */}
          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--emerald-light)] border border-[var(--emerald-border)] text-xs font-semibold text-[var(--emerald-deep)]">
              <Activity className="h-3.5 w-3.5 text-[var(--emerald-mint)]" />
              <span>Enterprise 99.99% Availability & RPO/RTO Commitments</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--gray-text)] tracking-tight">
              Service Level Agreement (SLA)
            </h1>
            <p className="text-xs sm:text-sm text-[var(--gray-muted)] max-w-3xl leading-relaxed">
              Last updated: September 16, 2026. This Service Level Agreement outlines the service availability, system uptime commitments, response times, and financial credit remedies provided to enterprise subscribers of DelaHR.
            </p>
          </div>

          {/* Uptime Commitment Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-6 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--gray-muted)]">Target Monthly Uptime</span>
              <p className="text-3xl font-extrabold font-mono text-[var(--emerald-deep)]">99.99%</p>
              <p className="text-xs text-[var(--gray-muted)]">Continuous global shift rosters & payroll clearance uptime.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--gray-muted)]">Recovery Point Objective (RPO)</span>
              <p className="text-3xl font-extrabold font-mono text-[var(--gray-text)]">&lt; 1 min</p>
              <p className="text-xs text-[var(--gray-muted)]">Real-time cross-region database streaming replication.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--gray-muted)]">Critical Incident Response</span>
              <p className="text-3xl font-extrabold font-mono text-[var(--emerald-deep)]">&lt; 15 mins</p>
              <p className="text-xs text-[var(--gray-muted)]">24/7/365 dedicated engineering command response.</p>
            </div>
          </div>

          {/* Detailed SLA Table */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-6">
            <h2 className="text-lg font-bold text-[var(--gray-text)] flex items-center gap-2">
              <Server className="h-4 w-4 text-[var(--emerald-deep)]" />
              <span>Incident Severity Levels & Response Times</span>
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--gray-border)] text-[10px] uppercase text-[var(--gray-muted)]">
                    <th className="pb-3 font-bold">Severity</th>
                    <th className="pb-3 font-bold">Definition</th>
                    <th className="pb-3 font-bold font-mono">Response Time</th>
                    <th className="pb-3 font-bold font-mono">Status Updates</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--gray-border)]">
                  <tr>
                    <td className="py-3 font-bold text-rose-600">P1 - Critical</td>
                    <td className="py-3 text-[var(--gray-text)]">Payroll calculation failure, bank disbursement blockage, or whole-system outage.</td>
                    <td className="py-3 font-mono font-bold">&lt; 15 mins</td>
                    <td className="py-3 font-mono text-[var(--gray-muted)]">Every 30 mins</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-bold text-amber-600">P2 - Major</td>
                    <td className="py-3 text-[var(--gray-text)]">Shift rota scheduling impacted, degraded reporting, or single integration timeout.</td>
                    <td className="py-3 font-mono font-bold">&lt; 1 hour</td>
                    <td className="py-3 font-mono text-[var(--gray-muted)]">Every 2 hours</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-bold text-blue-600">P3 - Moderate</td>
                    <td className="py-3 text-[var(--gray-text)]">Non-critical workflow issue with operational workaround available.</td>
                    <td className="py-3 font-mono font-bold">&lt; 4 hours</td>
                    <td className="py-3 font-mono text-[var(--gray-muted)]">Daily</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-bold text-[var(--gray-text)]">P4 - Low</td>
                    <td className="py-3 text-[var(--gray-text)]">Cosmetic, minor feedback, or feature assistance inquiry.</td>
                    <td className="py-3 font-mono font-bold">&lt; 1 business day</td>
                    <td className="py-3 font-mono text-[var(--gray-muted)]">As resolved</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
