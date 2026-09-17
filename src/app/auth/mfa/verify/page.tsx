"use client";

import React, { Suspense, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Smartphone,
  Lock,
  RefreshCw,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";

function MfaVerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("admin@delahr.com");
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [backupCode, setBackupCode] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(30);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  // Rolling 30s countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : 30));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleDigitChange = (index: number, value: string) => {
    // Handle paste of complete 6-digit code
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, "").slice(0, 6);
      if (pasted.length > 0) {
        const newDigits = [...digits];
        for (let i = 0; i < pasted.length; i++) {
          newDigits[i] = pasted[i];
        }
        setDigits(newDigits);
        const nextIndex = Math.min(pasted.length, 5);
        inputRefs.current[nextIndex]?.focus();
      }
      return;
    }

    const cleanVal = value.replace(/\D/g, "");
    const newDigits = [...digits];
    newDigits[index] = cleanVal;
    setDigits(newDigits);

    // Auto-advance
    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    const fullCode = useBackupCode ? backupCode.trim() : digits.join("");

    if (!useBackupCode && fullCode.length < 6) {
      setErrorMessage("Please enter all 6 digits.");
      setLoading(false);
      return;
    }

    try {
      const res = await apiClient.auth.verifyMfa({
        email,
        code: fullCode,
        isBackupCode: useBackupCode,
      });

      if (res.success && res.token) {
        // Save session in local storage for portal
        if (typeof window !== "undefined") {
          localStorage.setItem("delahr_auth_token", res.token);
          localStorage.setItem("delahr_auth_user", JSON.stringify(res.user));
          const portalPersona = res.user?.role === "super_admin" ? "super_admin" : "employee";
          localStorage.setItem("delahr_portal_persona", portalPersona);
          apiClient.setContext({
            userId: res.user?.id,
            userRole: portalPersona,
            tenantId: res.user?.tenantId,
            organizationId: res.user?.organizationId,
          });
        }

        setSuccess(true);
        setTimeout(() => {
          if (res.user?.role === "super_admin") {
            router.push("/portal/saas");
          } else {
            router.push("/portal/dashboard");
          }
        }, 1200);
      } else {
        setErrorMessage(res.error || "Verification failed. Code is invalid or expired.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to verify authentication challenge.");
    } finally {
      setLoading(false);
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
          </Link>

          <Link
            href="/auth/login"
            className="text-xs font-semibold text-[var(--gray-text)] hover:underline"
          >
            Cancel & Back to Sign In
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md p-8 rounded-2xl bg-white border border-[var(--gray-border)] shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-[var(--emerald-deep)] mx-auto flex items-center justify-center shadow-xs">
              <Smartphone className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Two-Factor Authentication
            </h1>
            <p className="text-xs text-[var(--gray-muted)]">
              Enter the verification code from your authenticator application for <strong>{email}</strong>
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {success ? (
            <div className="py-6 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-emerald-100 text-[var(--emerald-deep)] mx-auto flex items-center justify-center animate-bounce">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-emerald-800">Two-Factor Authenticated!</h3>
                <p className="text-xs text-slate-500">Loading your enterprise workspace...</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              {useBackupCode ? (
                <div className="space-y-2">
                  <label className="font-semibold text-slate-700">Emergency Backup Recovery Code</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={backupCode}
                      onChange={(e) => setBackupCode(e.target.value)}
                      placeholder="e.g. 8421-9304"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 font-mono text-center text-sm font-bold tracking-widest text-slate-800 focus:outline-none focus:border-emerald-500 bg-white"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500">Each emergency backup code can only be used once.</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-700">Enter 6-Digit Code</label>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Clock className="h-3 w-3 text-emerald-600 animate-spin" />
                      <span>Refreshes in {countdown}s</span>
                    </div>
                  </div>

                  {/* 6 Box Input */}
                  <div className="grid grid-cols-6 gap-2">
                    {digits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          inputRefs.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={6} // Allows paste on any box
                        value={digit}
                        onChange={(e) => handleDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        autoFocus={idx === 0}
                        className="w-full h-12 text-center text-lg font-bold font-mono rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 bg-white text-slate-900 transition"
                      />
                    ))}
                  </div>

                  <div className="text-center pt-1">
                    <span className="text-[11px] text-slate-500">
                      Tip: You can use test code <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-slate-700">123456</code> in testing.
                    </span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] disabled:opacity-50 text-white font-bold shadow-xs transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Clock className="h-4 w-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <span>Verify & Continue to Portal</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="pt-2 border-t border-slate-200 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setUseBackupCode(!useBackupCode);
                    setErrorMessage(null);
                  }}
                  className="text-xs font-semibold text-[var(--emerald-deep)] hover:underline inline-flex items-center gap-1"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  <span>{useBackupCode ? "Use Authenticator App Code Instead" : "Lost your device? Use Emergency Backup Code"}</span>
                </button>
              </div>
            </form>
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

export default function MfaVerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--cool-gray)]">
        <div className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    }>
      <MfaVerifyContent />
    </Suspense>
  );
}
