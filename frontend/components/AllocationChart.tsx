"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { AssetWeight } from "@/lib/api";

const CLASS_COLORS: Record<string, string> = {
  crypto:       "#f97316",
  equity:       "#3b82f6",
  intl_equity:  "#06b6d4",
  fixed_income: "#22c55e",
  commodity:    "#eab308",
  reit:         "#ec4899",
  cash:         "#94a3b8",
};

interface TooltipProps {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any[];
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as AssetWeight;
  return (
    <div className="rounded-xl border border-white/10 bg-black/75 px-3 py-2 backdrop-blur-lg">
      <p className="font-semibold text-white">{d.ticker}</p>
      <p className="text-sm text-white/60">
        {(d.weight * 100).toFixed(1)}%
      </p>
    </div>
  );
}

interface Props {
  weights: AssetWeight[];
}

export default function AllocationChart({ weights }: Props) {
  const data = weights.map((w) => ({
    ...w,
    name: w.ticker,
    value: Math.round(w.weight * 1000) / 10,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={108}
          paddingAngle={3}
          dataKey="value"
          strokeWidth={0}
        >
          {data.map((entry, i) => (
            <Cell
              key={`cell-${i}`}
              fill={CLASS_COLORS[entry.asset_class] ?? "#6366f1"}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value: string) => (
            <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
              {value}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
