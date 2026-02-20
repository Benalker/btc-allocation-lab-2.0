"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  CartesianGrid,
} from "recharts";

// ── Shared mini chart styles ──────────────────────────────────────────────────

const tickStyle = { fill: "rgba(255,255,255,0.4)", fontSize: 11 };
const axisLine  = { stroke: "rgba(255,255,255,0.1)" };

// ── Volatility demo data ──────────────────────────────────────────────────────

function makeVolChart() {
  const lowVol:  { x: number; y: number }[] = [];
  const highVol: { x: number; y: number }[] = [];
  let lv = 100, hv = 100;
  // Deterministic pseudo-random
  const seeds = [0.12, -0.05, 0.08, -0.03, 0.11, -0.07, 0.06, 0.02, -0.04, 0.09,
                 0.04, -0.06, 0.10, -0.02, 0.07, -0.01, 0.05, -0.08, 0.12, -0.03];
  for (let i = 0; i < 20; i++) {
    lv *= 1 + seeds[i] * 0.3;
    hv *= 1 + seeds[i] * 1.1;
    lowVol.push({ x: i, y: +lv.toFixed(2) });
    highVol.push({ x: i, y: +hv.toFixed(2) });
  }
  return { lowVol, highVol };
}

export function VolatilityChart() {
  const { lowVol, highVol } = makeVolChart();
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
        <XAxis dataKey="x" hide />
        <YAxis domain={["auto", "auto"]} tick={tickStyle} axisLine={axisLine} tickLine={false} />
        <Tooltip
          formatter={(v: number, name: string) => [`${v.toFixed(1)}`, name]}
          contentStyle={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}
          labelStyle={{ color: "rgba(255,255,255,0.4)" }}
        />
        <Line data={lowVol}  dataKey="y" name="Low Vol (bonds)"  stroke="#22c55e" strokeWidth={2} dot={false} />
        <Line data={highVol} dataKey="y" name="High Vol (crypto)" stroke="#f97316" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── Drawdown demo data ────────────────────────────────────────────────────────

function makeDrawdownChart() {
  const prices = [100,105,112,118,122,119,108,92,85,89,96,100,106,114,120,116,110,103,98,105,112];
  const points = prices.map((p, i) => {
    const peak = Math.max(...prices.slice(0, i + 1));
    return { x: i, price: p, drawdown: +((p - peak) / peak * 100).toFixed(1) };
  });
  return points;
}

export function DrawdownChart() {
  const data = makeDrawdownChart();
  return (
    <div className="space-y-2">
      <ResponsiveContainer width="100%" height={130}>
        <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
          <XAxis dataKey="x" hide />
          <YAxis domain={["auto", "auto"]} tick={tickStyle} axisLine={axisLine} tickLine={false} />
          <Line dataKey="price" name="Portfolio" stroke="#a855f7" strokeWidth={2} dot={false} />
          <Tooltip contentStyle={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
        </LineChart>
      </ResponsiveContainer>
      <ResponsiveContainer width="100%" height={90}>
        <AreaChart data={data} margin={{ top: 0, right: 10, bottom: 5, left: 0 }}>
          <XAxis dataKey="x" hide />
          <YAxis domain={[-35, 0]} tick={tickStyle} axisLine={axisLine} tickLine={false} />
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" />
          <Area dataKey="drawdown" name="Drawdown %" stroke="#ef4444" fill="rgba(239,68,68,0.15)" strokeWidth={1.5} />
          <Tooltip contentStyle={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── VaR / ES distribution chart ───────────────────────────────────────────────

export function VarEsChart() {
  // Normal-ish distribution with fat tails
  const bins = Array.from({ length: 40 }, (_, i) => {
    const x = -0.10 + i * 0.005;
    const normal = Math.exp(-0.5 * ((x - 0.0005) / 0.013) ** 2);
    const tail = x < -0.03 ? Math.exp(-0.5 * ((x + 0.045) / 0.012) ** 2) * 0.25 : 0;
    return { x: +(x * 100).toFixed(1), freq: +(normal + tail).toFixed(3) };
  });
  const var95 = -2.5;  // ~-2.5% for illustration
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={bins} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
        <XAxis dataKey="x" tick={tickStyle} axisLine={axisLine} tickLine={false}
          label={{ value: "Daily Return (%)", position: "insideBottom", offset: -5, fill: "rgba(255,255,255,0.3)", fontSize: 11 }} />
        <YAxis hide />
        <Tooltip
          formatter={(v: number) => [v.toFixed(3), "Freq"]}
          contentStyle={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}
        />
        <Area dataKey="freq" stroke="#3b82f6" fill="rgba(59,130,246,0.2)" strokeWidth={2} />
        <ReferenceLine x={var95} stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 2"
          label={{ value: "VaR 95%", fill: "#f59e0b", fontSize: 10 }} />
        <ReferenceLine x={-4.5} stroke="#ef4444" strokeWidth={2} strokeDasharray="4 2"
          label={{ value: "ES 95%", fill: "#ef4444", fontSize: 10 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── Markowitz frontier chart ──────────────────────────────────────────────────

export function MarkowitzMiniChart() {
  const frontier = Array.from({ length: 20 }, (_, i) => {
    const vol = 0.05 + i * 0.016;
    const ret = 0.04 + 0.044 * Math.log(vol / 0.05);
    return { vol: +(vol * 100).toFixed(1), ret: +(ret * 100).toFixed(1) };
  });

  const scatter = Array.from({ length: 60 }, (_, i) => {
    const v = 5 + (i * 0.7 % 28);
    const maxRet = 0.04 + 0.044 * Math.log(v / 5) * 100;
    const r = maxRet * (0.5 + Math.abs(Math.sin(i * 2.1)) * 0.45);
    return { vol: +v.toFixed(1), ret: +r.toFixed(1) };
  });

  return (
    <ResponsiveContainer width="100%" height={220}>
      <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="vol" type="number" name="Risk" unit="%" tick={tickStyle} axisLine={axisLine} tickLine={false}
          label={{ value: "Risk →", position: "insideBottom", offset: -10, fill: "rgba(255,255,255,0.3)", fontSize: 11 }} />
        <YAxis dataKey="ret" type="number" name="Return" unit="%" tick={tickStyle} axisLine={axisLine} tickLine={false}
          label={{ value: "Return →", angle: -90, position: "insideLeft", fill: "rgba(255,255,255,0.3)", fontSize: 11 }} />
        <Tooltip cursor={{ strokeDasharray: "3 3" }}
          contentStyle={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
        {/* Random portfolios */}
        <Scatter name="Random Portfolios" data={scatter} fill="rgba(99,102,241,0.35)" r={3} />
        {/* Frontier line as scatter */}
        <Scatter name="Efficient Frontier" data={frontier} fill="#f59e0b" r={2} line={{ stroke: "#f59e0b", strokeWidth: 2 }} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

// ── Content registry ──────────────────────────────────────────────────────────

export interface LearnPageContent {
  slug: string;
  title: string;
  subtitle: string;
  intro: string;
  sections: { heading: string; body: string }[];
  chart: React.ReactNode;
  chartCaption: string;
  keyTakeaways: string[];
}

export const LEARN_CONTENT: Record<string, LearnPageContent> = {
  volatility: {
    slug: "volatility",
    title: "What is Volatility?",
    subtitle: "Understanding the ups and downs of your portfolio",
    intro:
      "Volatility measures how much an asset's price swings over time. A highly volatile asset can gain 50% in a year — or lose 50%. A low-volatility asset moves gently, rarely straying far from its average. In finance, volatility is typically measured as the standard deviation of returns, expressed as an annualized percentage.",
    sections: [
      {
        heading: "Why does it matter?",
        body: "Volatility isn't just an abstract number — it reflects the real emotional and financial roller-coaster you'll experience as an investor. High volatility tests your discipline: when your portfolio drops 30% in a month, will you hold? Historical data shows that many investors sell at exactly the wrong time.",
      },
      {
        heading: "A real-world comparison",
        body: "US government bonds (AGG) have annual volatility of ~6%. The S&P 500 (SPY) has ~18%. Bitcoin has ~70–80%. The chart below shows how differently these paths look over time. The orange line (high vol) swings wildly; the green line (low vol) is smooth but grows more slowly.",
      },
      {
        heading: "Volatility ≠ risk (but it's related)",
        body: "A stock that swings ±40% per year isn't necessarily 'risky' if you hold it for 20 years and it trends upward. Volatility creates opportunity for long-term investors. The problem is behavioral: volatility makes it hard to stay invested. Matching your portfolio's volatility to your emotional tolerance is crucial.",
      },
    ],
    chart: <VolatilityChart />,
    chartCaption: "Same starting point, same expected return — but very different journey. High volatility (orange) vs low volatility (green).",
    keyTakeaways: [
      "Volatility = standard deviation of returns, annualized.",
      "Higher vol → bigger swings, potentially higher long-term returns.",
      "Match your allocation's vol to your actual risk tolerance — not your ideal one.",
    ],
  },

  drawdown: {
    slug: "drawdown",
    title: "Understanding Drawdown",
    subtitle: "How deep does your portfolio fall — and how long to recover?",
    intro:
      "Maximum drawdown is the largest decline from a portfolio's peak value to its lowest point, before a new peak is reached. If your portfolio hits $100k, then falls to $65k before recovering, that's a 35% maximum drawdown. It's often a more intuitive measure of risk than volatility.",
    sections: [
      {
        heading: "The recovery problem",
        body: "Drawdown is asymmetric: a 50% loss requires a 100% gain to break even. A 33% loss requires a 50% gain. This 'recovery math' is why limiting drawdowns matters even if you don't need the money soon — large losses compound against you.",
      },
      {
        heading: "Historical benchmarks",
        body: "S&P 500 max drawdown: ~−57% (2008 GFC). A 60/40 portfolio: ~−35%. Bitcoin: ~−83% (multiple times). Conservative bond portfolio: ~−15%. The chart shows price and drawdown together — notice how the drawdown zone (red) corresponds to extended periods of recovery time.",
      },
      {
        heading: "The mental challenge",
        body: "Seeing your portfolio down 40% feels very different from reading a number. Research shows investors underestimate how long recoveries take. The 2000–2002 dot-com crash took until 2007 to fully recover for US equities. Knowing your expected max drawdown helps you size positions and set expectations.",
      },
    ],
    chart: <DrawdownChart />,
    chartCaption: "Top: simulated portfolio value. Bottom: drawdown (% below peak). Red = time spent below prior highs.",
    keyTakeaways: [
      "Max drawdown = worst peak-to-trough decline in the period.",
      "Recovery is asymmetric: a 50% loss needs a 100% gain to break even.",
      "Use drawdown to stress-test your emotional tolerance, not just math.",
    ],
  },

  "var-es": {
    slug: "var-es",
    title: "Value at Risk & Expected Shortfall",
    subtitle: "What's the worst I can expect on a bad day?",
    intro:
      "Value at Risk (VaR) answers a specific question: 'On 95% of days, my portfolio won't lose more than X%.' The remaining 5% of days, losses could be larger — VaR doesn't tell you how much larger. Expected Shortfall (ES), also called CVaR, fills that gap: it's the average loss on those worst 5% of days.",
    sections: [
      {
        heading: "Understanding the 95% level",
        body: "If your 1-day 95% VaR is −2%, it means: over 100 trading days, you'd expect 95 of those days to have losses no worse than 2%. On the 5 remaining days, things could be worse. ES gives you the average of those 5 bad days — it tells you what 'worse' looks like on average.",
      },
      {
        heading: "Why ES matters more in a crisis",
        body: "VaR is sometimes criticized for being blind to extreme events. During the 2008 financial crisis, daily losses far exceeded VaR estimates because the distribution of returns has 'fat tails' — extreme events happen more often than a normal distribution would predict. ES captures this by focusing on the tail.",
      },
      {
        heading: "The chart below",
        body: "The chart shows a stylized daily return distribution. The yellow line marks the 95% VaR threshold: 95% of days are to the right. The red line shows the ES: the average of everything to the left of VaR. Note the fat left tail — more mass in extreme losses than a simple bell curve would suggest.",
      },
    ],
    chart: <VarEsChart />,
    chartCaption: "Daily return distribution. Yellow = VaR 95% (worst 5% threshold). Red = ES 95% (average of worst 5%).",
    keyTakeaways: [
      "VaR = the loss threshold you won't exceed on 95% of days.",
      "ES = the average loss on the worst 5% of days (tail average).",
      "ES > VaR (more negative) because ES averages the entire tail.",
    ],
  },

  markowitz: {
    slug: "markowitz",
    title: "Modern Portfolio Theory",
    subtitle: "The mathematics of diversification",
    intro:
      "In 1952, Harry Markowitz showed that you can combine assets to create a portfolio with better risk-return characteristics than any single asset. The key insight: assets don't move together perfectly (correlation < 1), so combining them reduces overall portfolio volatility without sacrificing the same amount of return. This is the math behind diversification.",
    sections: [
      {
        heading: "The Efficient Frontier",
        body: "The 'Efficient Frontier' is the set of portfolios that offer the highest expected return for a given level of risk. Any portfolio below the frontier is suboptimal — you're taking unnecessary risk. The chart below shows random portfolios (purple dots) and the efficient frontier (yellow line). Most portfolios are inefficient; the frontier is the best possible.",
      },
      {
        heading: "Key portfolio points",
        body: "Minimum Variance Portfolio: the portfolio with the lowest possible volatility (far left of the frontier). Maximum Sharpe Portfolio: the portfolio with the best risk-adjusted return (highest return per unit of risk). These are the two most commonly sought targets in optimization.",
      },
      {
        heading: "Limitations in practice",
        body: "Markowitz theory assumes stable correlations and normal return distributions. In reality, correlations spike during crises (when you most need diversification), returns have fat tails, and future expected returns are uncertain. The optimizer in this app uses these insights as guides, not absolute rules.",
      },
    ],
    chart: <MarkowitzMiniChart />,
    chartCaption: "Purple dots = random portfolios. Yellow line = efficient frontier. Only the frontier portfolios are optimal.",
    keyTakeaways: [
      "Diversification reduces risk without proportionally reducing return.",
      "The efficient frontier = best possible return for each risk level.",
      "Real portfolios often fall below the frontier due to constraints and uncertainty.",
    ],
  },
};

export const LEARN_INDEX = Object.values(LEARN_CONTENT).map((c) => ({
  slug: c.slug,
  title: c.title,
  subtitle: c.subtitle,
}));
