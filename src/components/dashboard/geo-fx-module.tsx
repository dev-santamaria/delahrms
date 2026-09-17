"use client";

import React, { useState } from "react";
import {
  Globe2,
  DollarSign,
  Layers,
  ArrowRightLeft,
  Server,
  CheckCircle2,
  Building2,
  MapPin,
  RefreshCw,
} from "lucide-react";

export function GeoFxModule() {
  const [geoUnits] = useState([
    { id: "geo-1", country: "Kenya", flag: "🇰🇪", code: "KE-47", name: "Nairobi County", type: "County (Level 1)", currency: "KES", minWage: "KES 18,500 / mo", timezone: "Africa/Nairobi" },
    { id: "geo-2", country: "Kenya", flag: "🇰🇪", code: "KE-01", name: "Mombasa County", type: "County (Level 1)", currency: "KES", minWage: "KES 16,800 / mo", timezone: "Africa/Nairobi" },
    { id: "geo-3", country: "Uganda", flag: "🇺🇬", code: "UG-102", name: "Kampala District", type: "District (Level 1)", currency: "UGX", minWage: "UGX 450,000 / mo", timezone: "Africa/Kampala" },
    { id: "geo-4", country: "Uganda", flag: "🇺🇬", code: "UG-113", name: "Wakiso District", type: "District (Level 1)", currency: "UGX", minWage: "UGX 400,000 / mo", timezone: "Africa/Kampala" },
    { id: "geo-5", country: "Tanzania", flag: "🇹🇿", code: "TZ-02", name: "Dar es Salaam Region", type: "Region (Level 1)", currency: "TZS", minWage: "TZS 350,000 / mo", timezone: "Africa/Dar_es_Salaam" },
    { id: "geo-6", country: "Tanzania", flag: "🇹🇿", code: "TZ-01", name: "Arusha Region", type: "Region (Level 1)", currency: "TZS", minWage: "TZS 320,000 / mo", timezone: "Africa/Dar_es_Salaam" },
    { id: "geo-7", country: "Rwanda", flag: "🇷🇼", code: "RW-01", name: "Kigali City Province", type: "Province (Level 1)", currency: "RWF", minWage: "RWF 150,000 / mo", timezone: "Africa/Kigali" },
  ]);

  const [convertAmount, setConvertAmount] = useState<number>(1000);
  const [fromCurrency, setFromCurrency] = useState<string>("USD");
  const [toCurrency, setToCurrency] = useState<string>("KES");

  const ratesToUSD: Record<string, number> = {
    USD: 1.0,
    EUR: 1 / 0.92,
    GBP: 1 / 0.78,
    KES: 1 / 129.50,
    UGX: 1 / 3720.00,
    TZS: 1 / 2650.00,
    RWF: 1 / 1350.00,
  };

  const calculateConverted = () => {
    const fromUSD = convertAmount * ratesToUSD[fromCurrency];
    const target = fromUSD / ratesToUSD[toCurrency];
    return Math.round(target * 100) / 100;
  };

  const [erpConnectors] = useState([
    {
      name: "Corporate SAP S/4HANA Finance Hub",
      type: "SAP BAPI (Document Type SA)",
      auth: "OAuth 2.0 Mutual TLS",
      status: "Connected & Synced",
      lastSync: "Today, 08:30 EAT",
      direction: "Outbound Payroll & Sub-Ledger",
    },
    {
      name: "Oracle NetSuite OneWorld Multi-Subsidiary",
      type: "REST Web Services & SuiteTalk",
      auth: "OAuth 2.0 Token-Based",
      status: "Connected & Synced",
      lastSync: "Today, 08:15 EAT",
      direction: "Vendor Bills & Employee Headcount",
    },
    {
      name: "Microsoft Dynamics 365 Finance & Operations",
      type: "OData v4 Enterprise Connector",
      auth: "Azure AD App Registration",
      status: "Configured (Standby)",
      lastSync: "Yesterday, 18:00 EAT",
      direction: "Bi-Directional GL Mapping",
    },
    {
      name: "ERPNext Community Cloud Integration",
      type: "REST API v2",
      auth: "API Key / Secret Token",
      status: "Connected & Synced",
      lastSync: "Today, 09:00 EAT",
      direction: "Direct Journal Entry Creation",
    },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Globe2 className="h-5 w-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Dynamic Geographic Divisions, Multi-Currency Treasury & ERP Mesh
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
              Universal Global Hierarchy
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Dynamic spatial administrative boundaries (Counties, Districts, Regions, Provinces), real-time FX conversion across 7 currencies, and universal ERP integration mesh (SAP, NetSuite, Dynamics 365)
          </p>
        </div>
      </div>

      {/* FX Treasury Converter Card */}
      <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
              Corporate Multi-Currency Treasury & FX Triangulation Calculator
            </h3>
          </div>
          <span className="text-[11px] text-zinc-400">Official Central Bank month-end corporate accounting rates</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Amount:</label>
            <input
              type="number"
              value={convertAmount}
              onChange={(e) => setConvertAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm font-mono text-zinc-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">From Currency:</label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="USD">USD - United States Dollar</option>
              <option value="KES">KES - Kenyan Shilling</option>
              <option value="UGX">UGX - Ugandan Shilling</option>
              <option value="TZS">TZS - Tanzanian Shilling</option>
              <option value="RWF">RWF - Rwandan Franc</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">To Target Currency:</label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="KES">KES - Kenyan Shilling</option>
              <option value="UGX">UGX - Ugandan Shilling</option>
              <option value="TZS">TZS - Tanzanian Shilling</option>
              <option value="RWF">RWF - Rwandan Franc</option>
              <option value="USD">USD - United States Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
            </select>
          </div>
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-right">
            <p className="text-[10px] text-zinc-500 uppercase">Converted Value:</p>
            <p className="text-base font-bold text-emerald-400 font-mono">
              {toCurrency} {calculateConverted().toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Dynamic Geographic Administrative Hierarchy Table */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
              Dynamic Spatial Administrative Hierarchy (Kenya, Uganda, Tanzania, Rwanda)
            </h3>
            <p className="text-[11px] text-zinc-400">Jurisdiction-specific regional units with inherited minimum wage rates and timezones</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/60 text-zinc-400 text-[11px] border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Administrative Unit</th>
                <th className="py-3 px-3">Country</th>
                <th className="py-3 px-3">Division Level</th>
                <th className="py-3 px-3">Official Currency</th>
                <th className="py-3 px-3">Statutory Minimum Wage</th>
                <th className="py-3 px-4 text-right">Timezone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {geoUnits.map((geo) => (
                <tr key={geo.id} className="hover:bg-zinc-800/30 transition">
                  <td className="py-3.5 px-4 font-semibold text-zinc-200">
                    <div>{geo.name}</div>
                    <div className="text-[10px] font-mono text-zinc-500">{geo.code}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="mr-1.5">{geo.flag}</span>
                    <span className="text-zinc-300 font-medium">{geo.country}</span>
                  </td>
                  <td className="py-3.5 px-3 text-zinc-400">{geo.type}</td>
                  <td className="py-3.5 px-3 font-mono font-medium text-amber-400">{geo.currency}</td>
                  <td className="py-3.5 px-3 font-mono text-emerald-400">{geo.minWage}</td>
                  <td className="py-3.5 px-4 text-right font-mono text-zinc-400">{geo.timezone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Universal ERP Connectors Hub */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
              Universal ERP Integration Connectors & Event Mesh
            </h3>
            <p className="text-[11px] text-zinc-400">Live bi-directional sync to SAP, NetSuite, Dynamics 365, and ERPNext</p>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Outbox Event Mesh Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
          {erpConnectors.map((erp, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white">{erp.name}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  {erp.status}
                </span>
              </div>
              <div className="text-[11px] text-zinc-400 space-y-1">
                <div>Protocol: <span className="text-zinc-200 font-mono">{erp.type}</span></div>
                <div>Auth Rail: <span className="text-zinc-200 font-mono">{erp.auth}</span></div>
                <div>Sync Direction: <span className="text-indigo-300 font-medium">{erp.direction}</span></div>
              </div>
              <div className="pt-2 border-t border-zinc-800/80 text-[10px] text-zinc-500 flex items-center justify-between">
                <span>Last Heartbeat Sync: {erp.lastSync}</span>
                <span className="text-emerald-400 font-medium">0 Lost Outbox Events</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
