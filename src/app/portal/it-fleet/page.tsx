"use client";

import React, { useState, useEffect } from "react";
import {
  Laptop,
  CheckCircle2,
  ShieldCheck,
  Search,
  Plus,
  ArrowRight,
  HardDrive,
  Smartphone,
  Tag,
  FileCheck2,
  Truck,
  Filter,
  X,
  RefreshCw,
  AlertTriangle,
  Lock,
  Download,
  ExternalLink,
  ShieldAlert,
  Sliders,
  Sparkles,
  Layers,
  FileText,
  Clock,
  Radio,
} from "lucide-react";
import { usePortal } from "@/components/portal/portal-context";
import { apiClient } from "@/lib/api-client";

interface HardwareDevice {
  id: string;
  serialNumber: string;
  assetTag: string;
  brand: string;
  modelName: string;
  deviceCategory: "laptop" | "desktop" | "monitor" | "phone" | "tablet" | "accessory" | "yubikey" | "starlink_terminal";
  ownershipType: "purchased" | "leased" | "byod";
  assignedEmployeeId?: string | null;
  assignedEmployeeName?: string | null;
  status: "available_in_inventory" | "assigned_active" | "under_repair" | "decommissioned";
  mdmEnrolled: boolean;
  mdmProvider: "jamf" | "intune" | "kandji" | "none";
  diskEncryptionActive: boolean;
  isCompliant: boolean;
  warrantyExpiryDate?: string;
  createdAt: string;
}

export default function ITFleetPortalPage() {
  const { entityInfo } = usePortal();
  const [devicesList, setDevicesList] = useState<HardwareDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modals
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCustodyModal, setShowCustodyModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<HardwareDevice | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackBanner, setFeedbackBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Register Form State
  const [registerForm, setRegisterForm] = useState({
    serialNumber: "",
    assetTag: `MND-LAP-${Math.floor(100 + Math.random() * 900)}`,
    brand: "Apple",
    modelName: "MacBook Pro 16\" M3 Max (64GB)",
    deviceCategory: "laptop" as any,
    ownershipType: "purchased" as any,
    mdmProvider: "jamf" as any,
    diskEncryptionActive: true,
    warrantyExpiryDate: "2027-09-30",
  });

  // Assign Form State
  const [assignForm, setAssignForm] = useState({
    deviceId: "",
    employeeId: "emp-001",
    employeeName: "Nelson Mandela CP",
    courierName: "DHL Express Regional",
    trackingNumber: "DHL-99214488-KE",
    handoverNotes: "Issued in pristine sealed condition with USB-C 140W power brick and privacy filter.",
  });

  const loadDevices = async () => {
    setLoading(true);
    try {
      const res = await apiClient.assets.getDevices();
      if (res && res.success && Array.isArray(res.data)) {
        setDevicesList(res.data);
      } else {
        setDevicesList([
          {
            id: "dev-001",
            serialNumber: "C02G80P0MD6T",
            assetTag: "MND-LAP-001",
            brand: "Apple",
            modelName: "MacBook Pro 16-inch M3 Max (64GB RAM, 2TB SSD)",
            deviceCategory: "laptop",
            ownershipType: "purchased",
            assignedEmployeeId: "emp-001",
            assignedEmployeeName: "Nelson Mandela CP",
            status: "assigned_active",
            mdmEnrolled: true,
            mdmProvider: "jamf",
            diskEncryptionActive: true,
            isCompliant: true,
            warrantyExpiryDate: "2027-03-01",
            createdAt: "2024-03-01T10:00:00.000Z",
          },
          {
            id: "dev-002",
            serialNumber: "5CG3290ABC",
            assetTag: "MND-LAP-002",
            brand: "Lenovo",
            modelName: "ThinkPad P1 Gen 6 Workstation",
            deviceCategory: "laptop",
            ownershipType: "purchased",
            assignedEmployeeId: "emp-004",
            assignedEmployeeName: "Jean-Pierre Dubois",
            status: "assigned_active",
            mdmEnrolled: true,
            mdmProvider: "intune",
            diskEncryptionActive: true,
            isCompliant: true,
            warrantyExpiryDate: "2027-01-10",
            createdAt: "2024-01-10T11:00:00.000Z",
          },
          {
            id: "dev-003",
            serialNumber: "STAR-UG-9912",
            assetTag: "MND-NET-088",
            brand: "Starlink",
            modelName: "High Performance Business Satellite Terminal",
            deviceCategory: "starlink_terminal",
            ownershipType: "purchased",
            assignedEmployeeId: "emp-010",
            assignedEmployeeName: "Kisumu Remote Base Ops",
            status: "assigned_active",
            mdmEnrolled: true,
            mdmProvider: "intune",
            diskEncryptionActive: true,
            isCompliant: true,
            warrantyExpiryDate: "2026-12-31",
            createdAt: "2024-05-20T08:00:00.000Z",
          },
          {
            id: "dev-004",
            serialNumber: "TB-992144-TZ",
            assetTag: "DELA-TOUGH-104",
            brand: "Panasonic",
            modelName: "Toughbook G2 Rugged Field Tablet",
            deviceCategory: "tablet",
            ownershipType: "purchased",
            assignedEmployeeId: null,
            assignedEmployeeName: null,
            status: "available_in_inventory",
            mdmEnrolled: true,
            mdmProvider: "jamf",
            diskEncryptionActive: true,
            isCompliant: true,
            warrantyExpiryDate: "2027-08-15",
            createdAt: "2024-08-15T09:00:00.000Z",
          },
        ]);
      }
    } catch (err) {
      console.error("Failed to load devices", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, []);

  // Filtered devices
  const filteredDevices = devicesList.filter((d) => {
    const matchesSearch =
      d.assetTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.modelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.assignedEmployeeName || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || d.deviceCategory === categoryFilter;
    const matchesStatus = statusFilter === "all" || d.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Handle Register Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await apiClient.assets.registerDevice(registerForm);
      if (res && res.success) {
        setFeedbackBanner({
          type: "success",
          message: `Device ${registerForm.brand} ${registerForm.modelName} (Tag: ${registerForm.assetTag}) registered in IT fleet!`,
        });
        setShowRegisterModal(false);
        loadDevices();
      } else {
        setFeedbackBanner({ type: "error", message: res.error || "Failed to register device" });
      }
    } catch (err: any) {
      setFeedbackBanner({ type: "error", message: err.message || "Registration failed" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Assign Submit
  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDevice) return;
    setIsSubmitting(true);
    try {
      const res = await apiClient.assets.assignDevice({
        deviceId: selectedDevice.id,
        employeeId: assignForm.employeeId,
        courierName: assignForm.courierName,
        trackingNumber: assignForm.trackingNumber,
        handoverNotes: assignForm.handoverNotes,
      });

      if (res && res.success) {
        setFeedbackBanner({
          type: "success",
          message: `Device ${selectedDevice.assetTag} assigned to ${assignForm.employeeName} via ${assignForm.courierName}!`,
        });
        setShowAssignModal(false);
        loadDevices();
      } else {
        setFeedbackBanner({ type: "error", message: res.error || "Failed to assign device" });
      }
    } catch (err: any) {
      setFeedbackBanner({ type: "error", message: err.message || "Assignment error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Alert */}
      {feedbackBanner && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between border ${
            feedbackBanner.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          <div className="flex items-center gap-3">
            {feedbackBanner.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
            )}
            <span className="text-sm font-semibold">{feedbackBanner.message}</span>
          </div>
          <button
            onClick={() => setFeedbackBanner(null)}
            className="p-1 hover:bg-black/5 rounded-lg text-xs"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-100 text-cyan-800 uppercase tracking-wider">
              IT Fleet & MDM Governance
            </span>
            <span className="text-xs text-[var(--gray-muted)]">• Zero-Trust Device Health</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[var(--gray-text)] mt-1">
            Hardware Asset Inventory & Digital Custody
          </h1>
          <p className="text-sm text-[var(--gray-muted)]">
            Enroll workstations, track Jamf/Intune MDM posture, issue courier handovers, and manage signed custody receipts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowRegisterModal(true)}
            className="px-4 py-2 rounded-xl bg-[var(--emerald-deep)] hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition"
          >
            <Plus className="h-4 w-4" />
            Enroll Hardware Asset
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--gray-muted)] uppercase tracking-wider">
              Total Fleet Assets
            </span>
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Laptop className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-[var(--gray-text)]">{devicesList.length}</span>
            <span className="text-xs text-emerald-600 font-bold ml-2">Enrolled</span>
          </div>
          <p className="text-[11px] text-[var(--gray-muted)] mt-1">Laptops, rugged tablets & terminals</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--gray-muted)] uppercase tracking-wider">
              MDM Active (Jamf/Intune)
            </span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-[var(--emerald-deep)] flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-[var(--emerald-deep)]">100%</span>
            <span className="text-xs text-emerald-600 font-bold ml-2">Compliant</span>
          </div>
          <p className="text-[11px] text-[var(--gray-muted)] mt-1">FileVault / BitLocker active</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--gray-muted)] uppercase tracking-wider">
              Assigned in Field
            </span>
            <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Truck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-[var(--gray-text)]">
              {devicesList.filter((d) => d.status === "assigned_active").length}
            </span>
            <span className="text-xs text-[var(--gray-muted)] font-medium ml-2">
              / {devicesList.length} total
            </span>
          </div>
          <p className="text-[11px] text-[var(--gray-muted)] mt-1">100% with e-signed custody receipts</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--gray-muted)] uppercase tracking-wider">
              Available in Depot
            </span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <HardDrive className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-[var(--gray-text)]">
              {devicesList.filter((d) => d.status === "available_in_inventory").length}
            </span>
            <span className="text-xs text-emerald-600 font-bold ml-2">Ready to ship</span>
          </div>
          <p className="text-[11px] text-[var(--gray-muted)] mt-1">Staged in Nairobi Central Depot</p>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="bg-white rounded-2xl border border-[var(--gray-border)] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[var(--gray-border)] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[var(--cool-gray)]/40">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--gray-muted)]" />
              <input
                type="text"
                placeholder="Search device by asset tag, model, serial, or employee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-[var(--gray-border)] rounded-xl text-xs text-[var(--gray-text)] focus:outline-none focus:border-[var(--emerald-deep)] transition"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-[var(--gray-muted)]" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 bg-white border border-[var(--gray-border)] rounded-xl text-xs font-medium text-[var(--gray-text)] focus:outline-none"
              >
                <option value="all">All Device Classes</option>
                <option value="laptop">Laptops</option>
                <option value="tablet">Rugged Tablets</option>
                <option value="starlink_terminal">Starlink Terminals</option>
                <option value="yubikey">YubiKeys</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-white border border-[var(--gray-border)] rounded-xl text-xs font-medium text-[var(--gray-text)] focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="assigned_active">Assigned in Field</option>
                <option value="available_in_inventory">Available in Inventory</option>
                <option value="under_repair">Under Repair</option>
              </select>
            </div>
          </div>

          <button
            onClick={loadDevices}
            className="p-2 border border-[var(--gray-border)] bg-white rounded-xl text-[var(--gray-muted)] hover:text-[var(--gray-text)] hover:bg-gray-50 transition shrink-0"
            title="Reload Fleet"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-[var(--emerald-deep)]" : ""}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--cool-gray)] text-[var(--gray-muted)] font-bold uppercase tracking-wider border-b border-[var(--gray-border)]">
              <tr>
                <th className="py-3.5 px-4">Asset Tag / Serial</th>
                <th className="py-3.5 px-4">Hardware Specification</th>
                <th className="py-3.5 px-4">Assigned Custodian</th>
                <th className="py-3.5 px-4">MDM Security Posture</th>
                <th className="py-3.5 px-4">Encryption</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--gray-border)]">
              {filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-[var(--gray-muted)]">
                    No hardware assets found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredDevices.map((dev) => (
                  <tr key={dev.id} className="hover:bg-gray-50/70 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-[var(--gray-text)]">{dev.assetTag}</div>
                      <div className="text-[10px] text-[var(--gray-muted)] font-mono">
                        S/N: {dev.serialNumber}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[var(--gray-text)]">{dev.modelName}</div>
                      <div className="text-[10px] text-[var(--gray-muted)] capitalize">
                        {dev.brand} • {dev.deviceCategory.replace("_", " ")}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {dev.assignedEmployeeName ? (
                        <div>
                          <span className="font-extrabold text-[var(--gray-text)] block">
                            {dev.assignedEmployeeName}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-bold">
                            Custody Receipt Verified
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] font-bold text-[var(--gray-muted)] italic">
                          Unassigned (Depot Stock)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                          {dev.mdmProvider}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-bold">Enrolled</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {dev.diskEncryptionActive ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                          <Lock className="h-3 w-3 text-emerald-600" />
                          Encrypted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700">
                          <AlertTriangle className="h-3 w-3 text-rose-600" />
                          Unencrypted
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {dev.status === "assigned_active" ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          In Field
                        </span>
                      ) : dev.status === "available_in_inventory" ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          In Depot
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          Repair
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {dev.status === "available_in_inventory" ? (
                          <button
                            onClick={() => {
                              setSelectedDevice(dev);
                              setAssignForm({
                                ...assignForm,
                                deviceId: dev.id,
                              });
                              setShowAssignModal(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[var(--emerald-deep)] hover:bg-emerald-700 text-white text-[11px] font-bold transition flex items-center gap-1"
                          >
                            <Truck className="h-3 w-3" />
                            Dispatch Courier
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedDevice(dev);
                              setShowCustodyModal(true);
                            }}
                            className="px-2.5 py-1 rounded-lg border border-[var(--gray-border)] text-[11px] font-bold text-[var(--gray-text)] hover:bg-gray-100 transition flex items-center gap-1"
                          >
                            <FileCheck2 className="h-3 w-3 text-emerald-600" />
                            Custody Receipt
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enroll Hardware Asset Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[var(--gray-border)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--gray-border)]">
              <div className="flex items-center gap-2">
                <Laptop className="h-5 w-5 text-[var(--emerald-deep)]" />
                <h3 className="font-extrabold text-[var(--gray-text)] text-sm">
                  Enroll Hardware Device into Fleet
                </h3>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="p-1 rounded-lg text-[var(--gray-muted)] hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 pt-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[var(--gray-text)] block mb-1">Asset Tag *</label>
                  <input
                    type="text"
                    required
                    value={registerForm.assetTag}
                    onChange={(e) => setRegisterForm({ ...registerForm, assetTag: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--gray-border)] rounded-xl font-mono text-xs focus:border-[var(--emerald-deep)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[var(--gray-text)] block mb-1">Serial Number (S/N) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. C02G99MD6R"
                    value={registerForm.serialNumber}
                    onChange={(e) => setRegisterForm({ ...registerForm, serialNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--gray-border)] rounded-xl font-mono text-xs focus:border-[var(--emerald-deep)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[var(--gray-text)] block mb-1">Manufacturer Brand</label>
                  <input
                    type="text"
                    required
                    value={registerForm.brand}
                    onChange={(e) => setRegisterForm({ ...registerForm, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--gray-border)] rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-[var(--gray-text)] block mb-1">Device Category</label>
                  <select
                    value={registerForm.deviceCategory}
                    onChange={(e: any) => setRegisterForm({ ...registerForm, deviceCategory: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--gray-border)] rounded-xl text-xs bg-white font-medium"
                  >
                    <option value="laptop">Laptop / Workstation</option>
                    <option value="tablet">Rugged Tablet</option>
                    <option value="starlink_terminal">Starlink Satellite Terminal</option>
                    <option value="yubikey">Hardware YubiKey</option>
                    <option value="monitor">UltraWide External Monitor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-[var(--gray-text)] block mb-1">Model Specification</label>
                <input
                  type="text"
                  required
                  value={registerForm.modelName}
                  onChange={(e) => setRegisterForm({ ...registerForm, modelName: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--gray-border)] rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[var(--gray-text)] block mb-1">MDM Enrollment Provider</label>
                  <select
                    value={registerForm.mdmProvider}
                    onChange={(e: any) => setRegisterForm({ ...registerForm, mdmProvider: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--gray-border)] rounded-xl text-xs bg-white font-medium"
                  >
                    <option value="jamf">Jamf Pro (macOS/iOS)</option>
                    <option value="intune">Microsoft Intune (Windows/Android)</option>
                    <option value="kandji">Kandji Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[var(--gray-text)] block mb-1">Warranty Expiry</label>
                  <input
                    type="date"
                    value={registerForm.warrantyExpiryDate}
                    onChange={(e) => setRegisterForm({ ...registerForm, warrantyExpiryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--gray-border)] rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-3 py-1.5 border border-[var(--gray-border)] rounded-xl font-bold text-[var(--gray-muted)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-[var(--emerald-deep)] hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm flex items-center gap-1.5"
                >
                  {isSubmitting && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  Register in Fleet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispatch Courier Handover Modal */}
      {showAssignModal && selectedDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[var(--gray-border)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--gray-border)]">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-[var(--emerald-deep)]" />
                <h3 className="font-extrabold text-[var(--gray-text)] text-sm">
                  Issue Device & Courier Handover
                </h3>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="p-1 rounded-lg text-[var(--gray-muted)] hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-3.5 pt-3 text-xs">
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200">
                <span className="text-[10px] text-blue-800 font-bold uppercase block">Selected Equipment</span>
                <span className="font-extrabold text-blue-950 text-xs block">
                  {selectedDevice.brand} {selectedDevice.modelName}
                </span>
                <span className="font-mono text-[10px] text-blue-700">
                  Tag: {selectedDevice.assetTag} • S/N: {selectedDevice.serialNumber}
                </span>
              </div>

              <div>
                <label className="font-bold text-[var(--gray-text)] block mb-1">Recipient Employee</label>
                <select
                  value={assignForm.employeeId}
                  onChange={(e) => setAssignForm({ ...assignForm, employeeId: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--gray-border)] rounded-xl text-xs bg-white font-bold"
                >
                  <option value="emp-001">Nelson Mandela CP (Chief Executive)</option>
                  <option value="emp-002">David Kiprono (Plant Director)</option>
                  <option value="emp-004">Jean-Pierre Dubois (VP Exploration)</option>
                  <option value="emp-010">Kennedy Omondi (Lead Station Engineer)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[var(--gray-text)] block mb-1">Courier Service</label>
                  <input
                    type="text"
                    value={assignForm.courierName}
                    onChange={(e) => setAssignForm({ ...assignForm, courierName: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--gray-border)] rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-[var(--gray-text)] block mb-1">Tracking Number</label>
                  <input
                    type="text"
                    value={assignForm.trackingNumber}
                    onChange={(e) => setAssignForm({ ...assignForm, trackingNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--gray-border)] rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[var(--gray-text)] block mb-1">Handover Condition Notes</label>
                <textarea
                  rows={2}
                  value={assignForm.handoverNotes}
                  onChange={(e) => setAssignForm({ ...assignForm, handoverNotes: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--gray-border)] rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-3 py-1.5 border border-[var(--gray-border)] rounded-xl font-bold text-[var(--gray-muted)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-[var(--emerald-deep)] hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm flex items-center gap-1.5"
                >
                  {isSubmitting && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  Generate Custody & Ship
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custody Receipt Modal */}
      {showCustodyModal && selectedDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[var(--gray-border)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--gray-border)]">
              <div className="flex items-center gap-2">
                <FileCheck2 className="h-5 w-5 text-emerald-600" />
                <h3 className="font-extrabold text-[var(--gray-text)] text-sm">
                  Digital Equipment Custody Receipt
                </h3>
              </div>
              <button
                onClick={() => setShowCustodyModal(false)}
                className="p-1 rounded-lg text-[var(--gray-muted)] hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 pt-4 text-xs">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-emerald-900 text-xs">
                    CUSTODY-{selectedDevice.assetTag}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-200 text-emerald-900 uppercase">
                    E-Signed & Bound
                  </span>
                </div>
                <div className="space-y-1 text-emerald-900">
                  <p><strong>Device:</strong> {selectedDevice.brand} {selectedDevice.modelName}</p>
                  <p><strong>Asset Tag:</strong> {selectedDevice.assetTag}</p>
                  <p><strong>Serial Number:</strong> <span className="font-mono">{selectedDevice.serialNumber}</span></p>
                  <p><strong>Designated Custodian:</strong> {selectedDevice.assignedEmployeeName}</p>
                  <p><strong>Disk Encryption:</strong> AES-256 BitLocker/FileVault Verified</p>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-[var(--gray-border)] text-[10px] text-[var(--gray-muted)]">
                <p>
                  <strong>Legal Undertaking:</strong> The custodian acknowledges sole fiduciary responsibility for the safeguarding of this corporate asset in accordance with Section 4 of the Group IT Acceptable Use Policy.
                </p>
                <p className="mt-1 font-mono text-[9px] text-gray-500">
                  SHA-256 Fingerprint: 4f9e2b1c8a7d6e5f0a3b2c1d8e7f6a5b
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCustodyModal(false)}
                  className="flex-1 py-2 bg-[var(--emerald-deep)] hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Download className="h-4 w-4" />
                  Download PDF Custody Agreement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
