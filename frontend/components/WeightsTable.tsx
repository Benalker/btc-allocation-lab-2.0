"use client";

import { useState } from "react";
import type { AssetWeight } from "@/lib/api";

const CLASS_STYLES: Record<string, string> = {
  equity:       "text-blue-400   bg-blue-400/10",
  intl_equity:  "text-cyan-400   bg-cyan-400/10",
  fixed_income: "text-green-400  bg-green-400/10",
  commodity:    "text-yellow-400 bg-yellow-400/10",
  reit:         "text-pink-400   bg-pink-400/10",
  cash:         "text-slate-400  bg-slate-400/10",
  crypto:       "text-orange-400 bg-orange-400/10",
};

const CLASS_ORDER = [
  "crypto", "equity", "intl_equity", "reit", "fixed_income", "commodity", "cash",
];

interface Props {
  weights: AssetWeight[];
}

export default function WeightsTable({ weights }: Props) {
  const [filter, setFilter] = useState("");

  const filtered = weights.filter(
    (w) =>
      w.ticker.toLowerCase().includes(filter.toLowerCase()) ||
      w.name.toLowerCase().includes(filter.toLowerCase()) ||
      w.asset_class.toLowerCase().includes(filter.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    const ac = CLASS_ORDER.indexOf(a.asset_class);
    const bc = CLASS_ORDER.indexOf(b.asset_class);
    if (ac !== bc) return ac - bc;
    return b.weight - a.weight;
  });

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Filter by ticker, name or class…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-white placeholder-white/30 outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.07]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.07] bg-white/[0.03]">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/40">Ticker</th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/40 sm:table-cell">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/40">Class</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white/40">Weight</th>
              <th className="hidden px-4 py-3 sm:table-cell" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((w, i) => (
              <tr
                key={w.ticker}
                className={`transition-colors hover:bg-white/[0.02] ${
                  i < sorted.length - 1 ? "border-b border-white/[0.05]" : ""
                }`}
              >
                <td className="px-4 py-3 font-semibold text-white">{w.ticker}</td>
                <td className="hidden px-4 py-3 text-white/50 sm:table-cell">{w.name}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      CLASS_STYLES[w.asset_class] ?? "text-white/50 bg-white/10"
                    }`}
                  >
                    {w.asset_class.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-mono text-white">
                  {(w.weight * 100).toFixed(1)}%
                </td>
                <td className="hidden px-4 py-3 sm:table-cell">
                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-violet-500"
                      style={{ width: `${Math.min(w.weight * 100 / 0.3, 100)}%` }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <p className="py-6 text-center text-sm text-white/30">No matching assets</p>
        )}
      </div>
    </div>
  );
}
