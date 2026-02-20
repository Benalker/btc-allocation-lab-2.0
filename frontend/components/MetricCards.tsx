import type { RiskMetrics } from "@/lib/api";
import InfoPopover from "@/components/ui/InfoPopover";

interface CardDef {
  label: string;
  description: string;
  value: string;
  gradient: string;
  infoKey: string;
}

interface Props {
  metrics: RiskMetrics;
}

export default function MetricCards({ metrics }: Props) {
  const cards: CardDef[] = [
    {
      label: "Annual Vol",
      description: "Annualized volatility",
      value: `${(metrics.vol_annual * 100).toFixed(1)}%`,
      gradient: "from-blue-500/20 to-blue-700/5",
      infoKey: "vol_annual",
    },
    {
      label: "Max Drawdown",
      description: "Worst peak-to-trough",
      value: `${(metrics.max_drawdown * 100).toFixed(1)}%`,
      gradient: "from-red-500/20 to-red-700/5",
      infoKey: "max_drawdown",
    },
    {
      label: "VaR 95%",
      description: "1-day, 95% confidence",
      value: `${(metrics.var95 * 100).toFixed(1)}%`,
      gradient: "from-orange-500/20 to-orange-700/5",
      infoKey: "var95",
    },
    {
      label: "ES 95%",
      description: "Expected shortfall",
      value: `${(metrics.es95 * 100).toFixed(1)}%`,
      gradient: "from-violet-500/20 to-violet-700/5",
      infoKey: "es95",
    },
    {
      label: "Sharpe",
      description: "Return per unit of risk",
      value: metrics.sharpe.toFixed(2),
      gradient: "from-emerald-500/20 to-emerald-700/5",
      infoKey: "sharpe",
    },
    {
      label: "Sortino",
      description: "Downside-adjusted return",
      value: metrics.sortino.toFixed(2),
      gradient: "from-teal-500/20 to-teal-700/5",
      infoKey: "sortino",
    },
    {
      label: "Beta (SPY)",
      description: "Market sensitivity",
      value: metrics.beta_spy.toFixed(2),
      gradient: "from-sky-500/20 to-sky-700/5",
      infoKey: "beta_spy",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-2xl border border-white/[0.07] bg-gradient-to-br ${card.gradient} p-4`}
        >
          <div className="mb-1 flex items-center gap-1">
            <p className="text-[11px] text-white/40">{card.description}</p>
            <InfoPopover contentKey={card.infoKey} />
          </div>
          <p className="text-2xl font-bold tracking-tight text-white">
            {card.value}
          </p>
          <p className="mt-1 text-sm font-medium text-white/60">{card.label}</p>
        </div>
      ))}
    </div>
  );
}
