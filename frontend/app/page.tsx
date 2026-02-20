"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { OptimizeRequest, OptimizeResponse, FrontierResponse, Profile } from "@/lib/api";
import { optimize, getFrontier } from "@/lib/api";
import SegmentedControl from "@/components/SegmentedControl";
import SliderInput from "@/components/SliderInput";
import AllocationChart from "@/components/AllocationChart";
import WeightsTable from "@/components/WeightsTable";
import MetricCards from "@/components/MetricCards";
import FrontierChart from "@/components/FrontierChart";
import InfoPopover from "@/components/ui/InfoPopover";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// ── Risk Contributions mini chart ─────────────────────────────────────────────
function RiskContributionChart({
  contributions,
}: {
  contributions: { ticker: string; contribution_pct: number }[];
}) {
  const top = contributions.slice(0, 8);
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
        data={top}
        layout="vertical"
        margin={{ top: 0, right: 20, bottom: 0, left: 10 }}
      >
        <XAxis
          type="number"
          unit="%"
          tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
          axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="ticker"
          tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={36}
        />
        <Tooltip
          contentStyle={{
            background: "rgba(0,0,0,0.85)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
          }}
          formatter={(v: number) => [`${v.toFixed(1)}%`, "Risk contribution"]}
        />
        <Bar dataKey="contribution_pct" fill="#a855f7" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function Home() {
  const [profile, setProfile] = useState<Profile>("balanced");
  const [btcMax, setBtcMax] = useState(0.15);
  const [cashMax, setCashMax] = useState(0.2);
  const [perAssetMax, setPerAssetMax] = useState(0.35);

  const [result, setResult]     = useState<OptimizeResponse | null>(null);
  const [frontier, setFrontier] = useState<FrontierResponse | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  async function handleOptimize() {
    setLoading(true);
    setError(null);
    const req: OptimizeRequest = {
      profile,
      btc_max: btcMax,
      cash_max: cashMax,
      per_asset_max: perAssetMax,
    };
    try {
      const [optRes, frontRes] = await Promise.all([
        optimize(req),
        getFrontier(req),
      ]);
      setResult(optRes);
      setFrontier(frontRes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="mb-10 text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
          Portfolio Optimizer
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          BTC Allocation Lab
        </h1>
        <p className="mt-3 text-base text-white/50">
          Multi-asset optimization with Bitcoin constraints
        </p>
      </header>

      {/* ── Input card ─────────────────────────────────────────────────────── */}
      <section className="glass-card mb-8 p-6 sm:p-8">
        <h2 className="mb-6 text-[10px] font-semibold uppercase tracking-widest text-white/40">
          Portfolio Parameters
        </h2>

        <div className="space-y-7">
          {/* Profile */}
          <div>
            <div className="mb-3 flex items-center">
              <p className="text-sm font-medium text-white/60">Risk Profile</p>
            </div>
            <SegmentedControl value={profile} onChange={setProfile} />
          </div>

          {/* Sliders */}
          <div className="grid gap-4 sm:grid-cols-3">
            <SliderInput
              label="BTC Max"
              value={btcMax}
              min={0}
              max={0.3}
              step={0.01}
              onChange={setBtcMax}
              infoKey="btc_max"
            />
            <SliderInput
              label="Cash Max"
              value={cashMax}
              min={0}
              max={0.3}
              step={0.01}
              onChange={setCashMax}
              infoKey="cash_max"
            />
            <SliderInput
              label="Per-Asset Max"
              value={perAssetMax}
              min={0.05}
              max={0.4}
              step={0.01}
              onChange={setPerAssetMax}
              infoKey="per_asset_max"
            />
          </div>

          {/* CTA */}
          <motion.button
            onClick={handleOptimize}
            disabled={loading}
            className="w-full rounded-2xl bg-violet-600 py-3.5 text-base font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            whileHover={{ scale: 1.01, backgroundColor: "#7c3aed" }}
            whileTap={{ scale: 0.985 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Optimizing…
              </span>
            ) : (
              "Optimize Portfolio"
            )}
          </motion.button>
        </div>
      </section>

      {/* ── Results ────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-6"
          >
            {/* Row 1: Chart + Metrics */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Donut */}
              <div className="glass-card p-6">
                <h2 className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-white/40">
                  Allocation
                </h2>
                <AllocationChart weights={result.weights} />
              </div>

              {/* Metrics */}
              <div className="glass-card p-6">
                <h2 className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-white/40">
                  Risk Metrics
                </h2>
                <MetricCards metrics={result.risk_metrics} />

                {/* Constraints */}
                <div className="mt-5 border-t border-white/[0.06] pt-4">
                  <div className="flex items-center gap-1 mb-2">
                    <h3 className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
                      Active Constraints
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      ["BTC ≤", result.constraints_summary.btc_cap],
                      ["Cash ≤", result.constraints_summary.cash_cap],
                      ["Per-Asset ≤", result.constraints_summary.per_asset_cap],
                    ].map(([label, val]) => (
                      <span
                        key={String(label)}
                        className="rounded-lg bg-white/5 px-2 py-1 text-xs text-white/60"
                      >
                        {label} {((val as number) * 100).toFixed(0)}%
                      </span>
                    ))}
                    <span className="rounded-lg bg-violet-500/10 px-2 py-1 text-xs capitalize text-violet-400">
                      {result.constraints_summary.budgets_profile}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Efficient Frontier */}
            {frontier && (
              <div className="glass-card p-6">
                <div className="mb-4 flex items-center gap-2">
                  <h2 className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
                    Efficient Frontier
                  </h2>
                  <InfoPopover contentKey="sharpe" />
                </div>
                <FrontierChart data={frontier} />
              </div>
            )}

            {/* Row 3: Risk Contributions + Weights */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="glass-card p-6">
                <h2 className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-white/40">
                  Risk Contributions
                </h2>
                <RiskContributionChart contributions={result.risk_contributions} />
                <p className="mt-2 text-xs text-white/30">
                  % of total portfolio variance contributed by each asset.
                </p>
              </div>

              <div className="glass-card p-6">
                <h2 className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-white/40">
                  Portfolio Weights
                </h2>
                <WeightsTable weights={result.weights} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Error toast ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 flex max-w-sm items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/15 px-4 py-3 backdrop-blur-xl"
          >
            <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-400">Error</p>
              <p className="mt-0.5 text-xs text-white/60">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-white/40 hover:text-white/70">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
