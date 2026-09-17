"use client";

import React, { useState } from "react";
import {
  Laptop,
  Shield,
  Key,
  Lock,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Monitor,
  HardDrive,
  Cpu,
  Layers,
  Power,
  Search,
} from "lucide-react";

interface FleetDevice {
  id: string;
  serialNumber: string;
  brand: string;
  model: string;
  assignedTo: string;
  ownership: "purchased" | "leased";
  mdmProvider: "Jamf Pro" | "Microsoft Intune" | "Kandji";
  mdmStatus: "enrolled_healthy" | "policy_pending" | "offline";
  encryption: string;
  osVersion: string;
  location: string;
}

interface SaasApp {
  id: string;
  name: string;
  category: string;
  icon: string;
  activeSeats: number;
  totalSeats: number;
  autoProvisionRoles: string[];
}

export function ItFleetModule() {
  const [devices, setDevices] = useState<FleetDevice[]>([
    {
      id: "dev-001",
      serialNumber: "C02G89X0MD6R",
      brand: "Apple",
      model: "MacBook Pro 16\" M3 Max (36GB / 1TB)",
      assignedTo: "Nelson Mandela CP",
      ownership: "purchased",
      mdmProvider: "Jamf Pro",
      mdmStatus: "enrolled_healthy",
      encryption: "FileVault 2 (Encrypted)",
      osVersion: "macOS Sequoia 15.1",
      location: "Nairobi, Kenya",
    },
    {
      id: "dev-002",
      serialNumber: "8HQ91L2",
      brand: "Dell",
      model: "Dell XPS 15 9530 (32GB / 1TB)",
      assignedTo: "Amina Odhiambo",
      ownership: "leased",
      mdmProvider: "Microsoft Intune",
      mdmStatus: "enrolled_healthy",
      encryption: "BitLocker XTS-256",
      osVersion: "Ubuntu LTS 24.04",
      location: "Nairobi, Kenya",
    },
    {
      id: "dev-003",
      serialNumber: "YUBI-889104",
      brand: "Yubico",
      model: "YubiKey 5C NFC FIDO2 Key",
      assignedTo: "Nelson Mandela CP",
      ownership: "purchased",
      mdmProvider: "Jamf Pro",
      mdmStatus: "enrolled_healthy",
      encryption: "FIDO2 / WebAuthn Active",
      osVersion: "Firmware 5.7.1",
      location: "Upper Hill HQ",
    },
  ]);

  const [saasApps, setSaasApps] = useState<SaasApp[]>([
    { id: "saas-1", name: "Google Workspace Enterprise", category: "Email & Collaboration", icon: "📧", activeSeats: 48, totalSeats: 60, autoProvisionRoles: ["All Employees"] },
    { id: "saas-2", name: "Slack Enterprise Grid", category: "Team Messaging", icon: "💬", activeSeats: 48, totalSeats: 60, autoProvisionRoles: ["All Employees"] },
    { id: "saas-3", name: "GitHub Enterprise", category: "Code Repository", icon: "🐙", activeSeats: 24, totalSeats: 30, autoProvisionRoles: ["Software Engineering", "DevOps"] },
    { id: "saas-4", name: "AWS IAM Identity Center", category: "Cloud Infrastructure", icon: "☁️", activeSeats: 12, totalSeats: 15, autoProvisionRoles: ["Platform Leads", "SecOps"] },
  ]);

  const [activeTab, setActiveTab] = useState<"fleet" | "saas">("fleet");
  const [remoteActionNotice, setRemoteActionNotice] = useState<string | null>(null);

  const handleRemoteAction = (action: string, serialNumber: string) => {
    setRemoteActionNotice(`Command dispatched: [${action}] to device ${serialNumber} via MDM API`);
    setTimeout(() => setRemoteActionNotice(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Laptop className="h-5 w-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Workforce IT & Fleet Lifecycle Management
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
              Zero-Touch MDM Enrollment
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Global hardware procurement, MDM fleet telemetry (Jamf/Intune), automated app provisioning on hire, and 1-click remote wipe on offboarding
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex p-0.5 rounded-xl bg-zinc-950 border border-zinc-800">
          <button
            onClick={() => setActiveTab("fleet")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === "fleet" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Hardware Fleet ({devices.length})
          </button>
          <button
            onClick={() => setActiveTab("saas")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === "saas" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            SaaS Access Matrix ({saasApps.length})
          </button>
        </div>
      </div>

      {/* Remote Action Feedback Alert */}
      {remoteActionNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{remoteActionNotice}</span>
        </div>
      )}

      {activeTab === "fleet" ? (
        /* Fleet Table */
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
              Enrolled Hardware Fleet Telemetry
            </h3>
            <span className="text-[11px] text-zinc-400">Real-time MDM health & disk encryption audit</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/60 text-zinc-400 text-[11px] border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Hardware Device</th>
                  <th className="py-3 px-3">Serial / Asset Tag</th>
                  <th className="py-3 px-3">Assigned User</th>
                  <th className="py-3 px-3">MDM Provider</th>
                  <th className="py-3 px-3">Disk Encryption</th>
                  <th className="py-3 px-3">OS & Location</th>
                  <th className="py-3 px-4 text-right">Lifecycle Remote Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {devices.map((dev) => (
                  <tr key={dev.id} className="hover:bg-zinc-800/30 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-zinc-200">{dev.model}</div>
                      <div className="text-[10px] text-zinc-400 capitalize">{dev.brand} • {dev.ownership}</div>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-zinc-300 font-medium">{dev.serialNumber}</td>
                    <td className="py-3.5 px-3 font-medium text-zinc-200">{dev.assignedTo}</td>
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                        <Shield className="h-3 w-3 text-indigo-400" />
                        {dev.mdmProvider}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                        <CheckCircle2 className="h-3 w-3" />
                        {dev.encryption}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-zinc-400 text-[11px]">
                      <div>{dev.osVersion}</div>
                      <div className="text-[10px] text-zinc-400">{dev.location}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleRemoteAction("Lock Screen", dev.serialNumber)}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition"
                          title="Remote Lock Device"
                        >
                          <Lock className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleRemoteAction("MDM Sync & Audit", dev.serialNumber)}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition"
                          title="Trigger Policy Sync"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleRemoteAction("Remote Wipe & Deprovision", dev.serialNumber)}
                          className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 transition"
                          title="Offboarding: Remote Wipe"
                        >
                          <Power className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* SaaS Access Matrix */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {saasApps.map((app) => (
            <div key={app.id} className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{app.icon}</span>
                  <div>
                    <h4 className="text-sm font-bold text-white">{app.name}</h4>
                    <p className="text-xs text-zinc-400">{app.category}</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  {app.activeSeats} / {app.totalSeats} Seats Active
                </span>
              </div>

              <div>
                <p className="text-[11px] text-zinc-400 uppercase font-medium">Auto-Provisioned Roles:</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {app.autoProvisionRoles.map((role, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  SCIM & SAML SSO Enforced
                </span>
                <button
                  onClick={() => handleRemoteAction(`Audit & Sync App Provisioning for ${app.name}`, "ALL")}
                  className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition"
                >
                  Sync Access
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
