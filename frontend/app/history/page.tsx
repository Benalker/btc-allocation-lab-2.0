"use client";

import { useState, useEffect } from "react";
import {
  ComposedChart,
  AreaChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { AssetHistoryResponse, MarketEvent, TickerMeta } from "@/lib/api";
import { getAssetHistory, getTickers } from "@/lib/api";

const EVENT_COLORS: Record<string, string> = {
  crisis: "#ef4444",
  macro:  "#f59e0b",
  crypto: "#f97316",
  bull:   "#22c55e",
  info:   "#3b82f6",
};

const RANGES = [
  { label: "1 Year",  value: "1y" },
  { label: "3 Years", value: "3y" },
  { label: "5 Years", value: "5y" },
];

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
      <p className="text-[11px] text-white/40">{label}</p>
      <p className="mt-1 text-xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-white/40">{sub}</p>}
    </div>
  );
}

function EventBadge({ event }: { event: MarketEvent }) {
  const [open, setOpen] = useState(false);
  const color = EVENT_COLORS[event.type] ?? "#6366f1";
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 text-left transition-colors hover:bg-white/[0.06]"
      >
        <span
          className="mt-1 h-2 w-2 flex-shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-white">{event.label}</p>
            <p className="flex-shrink-0 text-[10px] text-white/40">{event.date}</p>
          </div>
          {open && (
            <p className="mt-2 text-xs leading-relaxed text-white/60">
              {event.description}
            </p>
          )}
        </div>
        <svg
          className={`mt-0.5 h-4 w-4 flex-shrink-0 text-white/30 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
}

const tickStyle = { fill: "rgba(255,255,255,0.4)", fontSize: 11 };
const axisLine  = { stroke: "rgba(255,255,255,0.1)" };

export default function HistoryPage() {
  const [tickers, setTickers]   = useState<TickerMeta[]>([]);
  const [ticker, setTicker]     = useState("SPY");
  const [range, setRange]       = useState("3y");
  const [data, setData]         = useState<AssetHistoryResponse | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  // Load ticker list
  useEffect(() => {
    getTickers().then(setTickers).catch(() => {});
  }, []);

  // Load history on change
  useEffect(() => {
    setLoading(true);
    setError(null);
    getAssetHistory(ticker, range)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [ticker, range]);

  const fmt = (v: number) => `${(v * 100).toFixed(1)}%`;

  // Find events that fall within the data range
  const eventsInRange = data
    ? data.events.filter((e) => {
        if (!data.prices.length) return false;
        return e.date >= data.prices[0].date && e.date <= data.prices[data.prices.length - 1].date;
      })
    : [];

  return (
    <main className="relative min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-14">
        {/* Header */}
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
            Market History
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Asset History & Insights
          </h1>
          <p className="mt-3 text-base text-white/50">
            Simulated historical data with real market context.
            <br />
            <span className="text-xs text-white/30">
              Prices are educational simulations — not real historical data.
              Not financial advice.
            </span>
          </p>
        </div>

        {/* Controls */}
        <div className="glass-card mb-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
          {/* Ticker selector */}
          <div className="flex-1">
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-white/40">
              Asset
            </label>
            <select
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-violet-500/50"
            >
              {tickers.map((t) => (
                <option key={t.ticker} value={t.ticker} className="bg-[#0f0f20]">
                  {t.ticker} — {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Range selector */}
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-white/40">
              Range
            </label>
            <div className="flex gap-2">
              {RANGES.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRange(r.value)}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                    range === r.value
                      ? "bg-violet-600 text-white"
                      : "border border-white/10 bg-white/5 text-white/50 hover:text-white/80"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading && (
          <div className="glass-card flex items-center justify-center p-16">
            <svg className="h-6 w-6 animate-spin text-violet-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}

        {error && (
          <div className="glass-card p-6 text-center text-red-400">
            {error} — make sure the backend is running on port 8000.
          </div>
        )}

        {data && !loading && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              <StatCard label="Total Return" value={fmt(data.stats.total_return)} />
              <StatCard label="CAGR" value={fmt(data.stats.cagr)} sub="annualized" />
              <StatCard label="Volatility" value={fmt(data.stats.vol_annual)} sub="annualized" />
              <StatCard label="Max Drawdown" value={fmt(data.stats.max_drawdown)} />
              <StatCard label="Worst Period" value={fmt(data.stats.worst_month)} sub="single period" />
            </div>

            {/* Price chart */}
            <div className="glass-card p-6">
              <h2 className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-white/40">
                {data.name} ({data.ticker}) — Simulated Price
              </h2>
              <ResponsiveContainer width="100%" height={240}>
                <ComposedChart data={data.prices} margin={{ top: 5, right: 15, bottom: 20, left: 10 }}>
                  <XAxis
                    dataKey="date"
                    tick={tickStyle}
                    axisLine={axisLine}
                    tickLine={false}
                    interval={Math.floor(data.prices.length / 5)}
                    tickFormatter={(d: string) => d.slice(0, 7)}
                  />
                  <YAxis tick={tickStyle} axisLine={axisLine} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "rgba(0,0,0,0.85)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}
                    formatter={(v: number) => [v.toFixed(2), "Price"]}
                    labelFormatter={(l: string) => l}
                  />
                  <Area dataKey="price" stroke="#a855f7" fill="rgba(168,85,247,0.08)" strokeWidth={2} dot={false} />
                  {/* Event reference lines */}
                  {eventsInRange.map((e) => (
                    <ReferenceLine
                      key={e.date}
                      x={e.date}
                      stroke={EVENT_COLORS[e.type] ?? "#6366f1"}
                      strokeOpacity={0.5}
                      strokeDasharray="3 3"
                    />
                  ))}
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Drawdown chart */}
            <div className="glass-card p-6">
              <h2 className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-white/40">
                Drawdown (% below peak)
              </h2>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={data.prices} margin={{ top: 5, right: 15, bottom: 10, left: 10 }}>
                  <XAxis
                    dataKey="date"
                    tick={tickStyle}
                    axisLine={axisLine}
                    tickLine={false}
                    interval={Math.floor(data.prices.length / 5)}
                    tickFormatter={(d: string) => d.slice(0, 7)}
                  />
                  <YAxis
                    tick={tickStyle}
                    axisLine={axisLine}
                    tickLine={false}
                    tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
                  />
                  <Tooltip
                    contentStyle={{ background: "rgba(0,0,0,0.85)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}
                    formatter={(v: number) => [`${(v * 100).toFixed(1)}%`, "Drawdown"]}
                  />
                  <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" />
                  <Area
                    dataKey="drawdown"
                    stroke="#ef4444"
                    fill="rgba(239,68,68,0.12)"
                    strokeWidth={1.5}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Events */}
            {eventsInRange.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-white/40">
                  Market Context (click to expand)
                </h2>
                <p className="mb-4 text-xs text-white/35">
                  These events provide market context for the simulated period. Presented as educational background, not causal explanations.
                </p>
                <div className="space-y-2">
                  {eventsInRange.map((e) => (
                    <EventBadge key={e.date} event={e} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
