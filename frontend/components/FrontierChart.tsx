"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
  ReferenceLine,
} from "recharts";
import type { FrontierResponse, SpecialPoint } from "@/lib/api";

interface TooltipProps {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any[];
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as { vol: number; ret: number; sharpe?: number; label?: string };
  return (
    <div className="rounded-xl border border-white/10 bg-black/80 px-3 py-2 backdrop-blur-lg">
      {d.label && (
        <p className="mb-1 text-xs font-semibold text-violet-400">{d.label}</p>
      )}
      <p className="text-sm text-white">
        Risk: <span className="font-mono">{(d.vol * 100).toFixed(1)}%</span>
      </p>
      <p className="text-sm text-white">
        Return: <span className="font-mono">{(d.ret * 100).toFixed(1)}%</span>
      </p>
      {d.sharpe !== undefined && (
        <p className="text-sm text-white/60">
          Sharpe: <span className="font-mono">{d.sharpe.toFixed(2)}</span>
        </p>
      )}
    </div>
  );
}

interface Props {
  data: FrontierResponse;
}

export default function FrontierChart({ data }: Props) {
  const special: (SpecialPoint & { fill: string })[] = [
    { ...data.min_var,    fill: "#22c55e" },
    { ...data.max_sharpe, fill: "#f59e0b" },
    { ...data.current,    fill: "#a855f7" },
  ];

  const xMin = Math.max(0, Math.min(...data.frontier.map((p) => p.vol)) - 0.01);
  const xMax = Math.max(...data.frontier.map((p) => p.vol)) + 0.02;

  const fmt = (v: number) => `${(v * 100).toFixed(0)}%`;

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
          <XAxis
            dataKey="vol"
            type="number"
            domain={[xMin, xMax]}
            tickFormatter={fmt}
            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            tickLine={false}
            label={{ value: "Risk (Volatility)", position: "insideBottom", offset: -10, fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
          />
          <YAxis
            dataKey="ret"
            type="number"
            tickFormatter={fmt}
            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            tickLine={false}
            label={{ value: "Expected Return", angle: -90, position: "insideLeft", offset: 10, fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Frontier line */}
          <Line
            data={data.frontier}
            dataKey="ret"
            stroke="url(#frontierGradient)"
            strokeWidth={2.5}
            dot={false}
            type="monotone"
          />

          {/* Special points */}
          {special.map((pt) => (
            <Scatter
              key={pt.label}
              name={pt.label}
              data={[pt]}
              fill={pt.fill}
              r={7}
            />
          ))}

          <defs>
            <linearGradient id="frontierGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
        </ComposedChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {[
          { color: "#22c55e", label: "Min Variance", vol: data.min_var.vol, ret: data.min_var.ret },
          { color: "#f59e0b", label: "Max Sharpe",   vol: data.max_sharpe.vol, ret: data.max_sharpe.ret },
          { color: "#a855f7", label: "Your Portfolio", vol: data.current.vol, ret: data.current.ret },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2"
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-white/70">{item.label}</span>
            <span className="font-mono text-xs text-white/40">
              {fmt(item.vol)} / {fmt(item.ret)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
