"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  QrCode,
  Key,
  Copy,
  CheckCircle2,
  Lock,
  ArrowRight,
  AlertCircle,
  Clock,
  Download,
  Smartphone,
  ChevronRight,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";

export default function MfaSetupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@delahr.com");
  const [loading, setLoading] = useState(false);
  const [setupData, setSetupData] = useState<{
    secret: string;
    qrCodeDataUrl: string;
    backupCodes: string[];
    manualEntryKey: string;
  } | null>(null);

  const [verifyCode, setVerifyCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);

  // Auto-generate or load MFA setup on mount
  useEffect(() => {
    generateMfa();
  }, []);

  const generateMfa = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await apiClient.auth.setupMfa(email);
      if (res.success && res.data) {
        setSetupData(res.data);
      } else {
        setErrorMessage(res.error || "Failed to initialize MFA setup.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Network error loading MFA configuration.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setVerifying(true);

    try {
      const res = await apiClient.auth.verifyMfa({
        email,
        code: verifyCode,
      });

      if (res.success && res.verified) {
        setVerifySuccess(true);
        setTimeout(() => {
          router.push("/auth/login");
        }, 1500);
      } else {
        setErrorMessage(res.error || "Invalid 6-digit code. Please try again.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to verify MFA code.");
    } finally {
      setVerifying(false);
    }
  };

  const copySecret = () => {
    if (setupData?.secret) {
      navigator.clipboard.writeText(setupData.secret);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const copyAllBackupCodes = () => {
    if (setupData?.backupCodes) {
      navigator.clipboard.writeText(setupData.backupCodes.join("\n"));
      setCopiedCodes(true);
      setTimeout(() => setCopiedCodes(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--cool-gray)] text-[var(--gray-text)] font-sans flex flex-col justify-between">
      {/* Top Header */}
      <header className="py-4 px-6 border-b border-[var(--gray-border)] bg-white">
        <div className="w-full max-w-[1400px] mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl tracking-tight leading-none">
              <strong className="font-extrabold text-[var(--emerald-deep)]">Dela</strong>
              <span className="font-light text-[var(--gray-muted)]">HR</span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-[var(--emerald-deep)] border border-emerald-200">
              Security Center
            </span>
          </Link>

          <Link
            href="/auth/login"
            className="text-xs font-semibold text-[var(--gray-text)] hover:underline"
          >
            Back to Sign In
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-xl p-6 md:p-8 rounded-2xl bg-white border border-[var(--gray-border)] shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-[var(--emerald-deep)] mx-auto flex items-center justify-center shadow-xs">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Two-Factor Authentication Setup (TOTP)
            </h1>
            <p className="text-xs text-[var(--gray-muted)]">
              Protect your DelaHR account with an authenticator app (Google Authenticator, Authy, or 1Password)
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {verifySuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center animate-bounce">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">MFA Configured Successfully!</h3>
                <p className="text-xs text-slate-500">
                  Two-factor authentication is now active on your account. Redirecting to sign in...
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 text-xs">
              {/* Step 1: Scan QR Code */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-slate-800 font-bold">
                  <span className="h-5 w-5 rounded-full bg-[var(--emerald-deep)] text-white text-[11px] flex items-center justify-center">
                    1
                  </span>
                  <span>Scan QR Code with your Authenticator</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
                  {setupData?.qrCodeDataUrl ? (
                    <div className="p-3 bg-white rounded-xl border border-slate-300 shadow-xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={setupData.qrCodeDataUrl}
                        alt="TOTP QR Code"
                        className="w-44 h-44 rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="w-44 h-44 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                      <Clock className="h-6 w-6 animate-spin" />
                    </div>
                  )}

                  <div className="space-y-2 text-left max-w-xs">
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      Open Google Authenticator, 1Password, or Authy on your mobile device, choose <strong>Scan a QR code</strong>, and point your camera here.
                    </p>

                    <div className="pt-1">
                      <span className="text-[10px] text-slate-500 block mb-1">Cannot scan? Enter manual secret:</span>
                      <div className="flex items-center gap-1.5">
                        <code className="px-2 py-1 rounded bg-white border border-slate-300 font-mono text-[10px] text-slate-800 font-bold select-all">
                          {setupData?.manualEntryKey || "GENERATING..."}
                        </code>
                        <button
                          type="button"
                          onClick={copySecret}
                          className="p-1 rounded bg-white border border-slate-300 hover:bg-slate-100 text-slate-600 transition"
                          title="Copy secret key"
                        >
                          {copiedKey ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Emergency Recovery Backup Codes */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-800 font-bold">
                    <span className="h-5 w-5 rounded-full bg-[var(--emerald-deep)] text-white text-[11px] flex items-center justify-center">
                      2
                    </span>
                    <span>Save Emergency Backup Codes</span>
                  </div>
                  <button
                    type="button"
                    onClick={copyAllBackupCodes}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--emerald-deep)] hover:underline"
                  >
                    {copiedCodes ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedCodes ? "Copied All" : "Copy Codes"}</span>
                  </button>
                </div>

                <p className="text-slate-600 text-[11px]">
                  Store these one-time recovery codes in a secure password vault. If you ever lose your phone, you can use one of these to sign in.
                </p>

                <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-lg border border-slate-200">
                  {setupData?.backupCodes?.map((code, idx) => (
                    <div key={idx} className="font-mono text-center text-xs font-bold text-slate-700 bg-slate-50 py-1 rounded border border-slate-100">
                      {code}
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 3: Enter 6-Digit Code to Activate */}
              <form onSubmit={handleVerify} className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-3">
                <div className="flex items-center gap-2 text-slate-800 font-bold">
                  <span className="h-5 w-5 rounded-full bg-[var(--emerald-deep)] text-white text-[11px] flex items-center justify-center">
                    3
                  </span>
                  <span>Confirm Code to Activate MFA</span>
                </div>

                <p className="text-slate-600 text-[11px]">
                  Enter the 6-digit code currently shown in your authenticator app to confirm setup:
                </p>

                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={verifyCode}
                      onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="e.g. 123456"
                      className="w-full pl-9 pr-3 py-2 bg-white rounded-lg border border-slate-300 focus:outline-none focus:border-emerald-500 font-mono text-base tracking-widest text-slate-800 text-center font-bold"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={verifying || verifyCode.length < 6}
                    className="px-5 py-2.5 rounded-lg bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] disabled:opacity-50 text-white font-bold transition flex items-center gap-2 shadow-xs"
                  >
                    {verifying ? (
                      <Clock className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <span>Activate MFA</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] text-[var(--gray-muted)] border-t border-[var(--gray-border)] bg-white">
        © {new Date().getFullYear()} DelaHR Inc. Universal Multi-Tenant Enterprise HRMS & Payroll.
      </footer>
    </div>
  );
}
