import React from "react";
import type { Metadata } from "next";
import { PortalProvider } from "@/components/portal/portal-context";
import { PortalLayoutShell } from "@/components/portal/portal-layout-shell";

export const metadata: Metadata = {
  title: {
    default: "DelaHR Enterprise Portal — People, Shifts & Payroll Cockpit",
    template: "%s | DelaHR Portal",
  },
  description:
    "Authenticated enterprise operations portal for global workforce management, 24/7 continuous industrial shift rosters, multi-currency payroll, and paperless compliance.",
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalProvider>
      <PortalLayoutShell>{children}</PortalLayoutShell>
    </PortalProvider>
  );
}
