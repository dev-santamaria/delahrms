"use client";

import React from "react";
import { usePortal } from "./portal-context";
import { PortalSidebar } from "./portal-sidebar";
import { PortalHeader } from "./portal-header";
import { CommandSearchDialog } from "./command-search-dialog";

export function PortalLayoutShell({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = usePortal();

  return (
    <div className="min-h-screen bg-[var(--cool-gray)] text-[var(--gray-text)] font-sans flex">
      {/* Sidebar */}
      <PortalSidebar />

      {/* Main Column */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          sidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        <PortalHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6">
          {children}
        </main>
      </div>

      {/* Command Palette Modal */}
      <CommandSearchDialog />
    </div>
  );
}
