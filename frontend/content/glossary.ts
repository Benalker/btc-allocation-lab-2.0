export interface GlossaryEntry {
  title: string;
  /** 1–2 sentence tooltip text */
  short: string;
  whenHigher?: string;
  whenLower?: string;
  /** slug for /learn/[slug] */
  learnSlug?: string;
}

export const GLOSSARY: Record<string, GlossaryEntry> = {
  // ── Input controls ─────────────────────────────────────────────────────────
  profile: {
    title: "Risk Profile",
    short:
      "Your overall tolerance for risk and return. Conservative = stability first. Balanced = both. Growth = maximum long-term return, accepting large swings.",
    whenHigher:
      "Moving toward Growth increases allocations to equities and crypto, targeting higher long-term returns at the cost of larger drawdowns.",
    whenLower:
      "Moving toward Conservative shifts weight to bonds and cash, trading return potential for stability.",
    learnSlug: "markowitz",
  },
  btc_max: {
    title: "Bitcoin Maximum Allocation",
    short:
      "The hard upper limit on how much of your portfolio can be in Bitcoin. Bitcoin has historically delivered high returns but with extreme volatility — 70%+ annual swings are common.",
    whenHigher:
      "More BTC exposure increases expected return potential but also tail risk (crash risk). Bitcoin can drop 70–80% in a bear market.",
    whenLower:
      "A lower BTC cap reduces crypto tail risk. Even small allocations (5–10%) have historically improved risk-adjusted returns via diversification.",
    learnSlug: "diversification",
  },
  cash_max: {
    title: "Cash Maximum Allocation",
    short:
      "The upper limit on cash and cash equivalents (e.g. T-bills). Cash preserves capital but loses real value to inflation over time.",
    whenHigher:
      "More cash reduces volatility and provides 'dry powder' for rebalancing. In high-rate environments, cash yields ~4–5%.",
    whenLower:
      "Less cash means more capital deployed into risk assets, potentially improving long-term returns.",
    learnSlug: "markowitz",
  },
  per_asset_max: {
    title: "Per-Asset Maximum",
    short:
      "The maximum weight any single asset can hold. Prevents concentration risk — even in a conviction position.",
    whenHigher:
      "Higher cap allows stronger concentration in high-conviction bets, increasing potential upside and downside.",
    whenLower:
      "Lower cap forces diversification across more assets, smoothing out individual asset shocks.",
    learnSlug: "diversification",
  },

  // ── Risk metrics ───────────────────────────────────────────────────────────
  vol_annual: {
    title: "Annual Volatility",
    short:
      "The annualized standard deviation of returns — a measure of how much the portfolio's value fluctuates. A 10% vol portfolio moves ±10% from its expected return in a typical year.",
    whenHigher:
      "Higher vol means larger swings, both up and down. Historically, higher vol correlates with higher long-term returns — but also larger drawdowns.",
    whenLower:
      "Lower vol means a smoother ride. Bonds and cash have vol of 3–10%; equities 15–20%; Bitcoin 60–80%.",
    learnSlug: "volatility",
  },
  max_drawdown: {
    title: "Maximum Drawdown",
    short:
      "The largest peak-to-trough decline in the portfolio's history (simulated). A −30% max drawdown means: if you invested $10,000, you could have seen it fall to $7,000 before recovering.",
    whenHigher:
      "Larger drawdowns test investor discipline. Many investors sell at the bottom, locking in losses. Knowing your expected max drawdown helps you stay the course.",
    whenLower:
      "Smaller drawdown = less pain during crashes. Conservative portfolios with lots of bonds typically have max drawdowns of −5% to −20%.",
    learnSlug: "drawdown",
  },
  var95: {
    title: "Value at Risk (95%)",
    short:
      "The worst expected 1-day loss on 95% of days. A VaR of −2% means: on a typical bad day, you expect to lose no more than 2%. On the remaining 5% of days, losses could be larger.",
    whenHigher:
      "A larger (more negative) VaR means worse typical bad days. This is expected with higher-vol allocations.",
    whenLower:
      "Smaller VaR indicates more resilience to normal market shocks. Bond-heavy portfolios have small VaR.",
    learnSlug: "var-es",
  },
  es95: {
    title: "Expected Shortfall (ES 95%)",
    short:
      "The average loss on the worst 5% of days — what you can expect to lose when things go really wrong. Also called CVaR (Conditional Value at Risk).",
    whenHigher:
      "Higher ES means worse tail outcomes. Portfolios with crypto or high-yield bonds tend to have fat tails and high ES.",
    whenLower:
      "Lower ES indicates the tail risk is limited. Government bond portfolios have very low ES.",
    learnSlug: "var-es",
  },
  sharpe: {
    title: "Sharpe Ratio",
    short:
      "Return per unit of risk: (Return − Risk-Free Rate) ÷ Volatility. A Sharpe > 1.0 is considered good; > 2.0 is excellent. Higher = better risk-adjusted return.",
    whenHigher:
      "Higher Sharpe means you're being compensated more for each unit of risk you take.",
    whenLower:
      "A Sharpe below 0.5 suggests the portfolio's return barely compensates for its volatility.",
    learnSlug: "markowitz",
  },
  sortino: {
    title: "Sortino Ratio",
    short:
      "Like Sharpe, but only penalizes downside volatility — the bad swings. More relevant for investors who care mainly about avoiding losses, not limiting upside.",
    whenHigher:
      "A high Sortino means most of the portfolio's volatility is to the upside — desirable.",
    whenLower:
      "A low Sortino means too much of the movement is to the downside.",
    learnSlug: "markowitz",
  },
  beta_spy: {
    title: "Beta vs S&P 500",
    short:
      "How much the portfolio moves relative to the S&P 500 (SPY). Beta=1.0 means it moves with the market. Beta=0.5 means it moves half as much. Beta<0 means it tends to move opposite.",
    whenHigher:
      "Higher beta = more market exposure. Good in bull markets, painful in crashes.",
    whenLower:
      "Lower beta = more defensive. Bond-heavy or gold-heavy portfolios typically have low beta.",
    learnSlug: "diversification",
  },
};
