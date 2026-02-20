# BTC Allocation Lab 2.0

> **Educational tool only. Not financial advice.**

Interactive multi-asset portfolio optimizer with Apple Liquid / Glassmorphism UI.

| Service  | URL |
|----------|-----|
| Frontend (Next.js) | http://localhost:3000 |
| Backend (FastAPI)  | http://localhost:8000 |
| Swagger UI         | http://localhost:8000/docs |

---

## Quick Start

```bash
# 1 — Install everything
make install

# 2a — Start both in one terminal (needs concurrently)
make dev

# 2b — OR start separately
make dev-backend    # Terminal 1 — FastAPI :8000
make dev-frontend   # Terminal 2 — Next.js :3000
```

> `--legacy-peer-deps` is used automatically for the frontend because Recharts has a React 18 peer dep while we run React 19.

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Portfolio optimizer — configure profile, constraints, run optimization |
| `/learn` | Knowledge base index |
| `/learn/volatility` | What is volatility? |
| `/learn/drawdown` | Understanding drawdown |
| `/learn/var-es` | Value at Risk & Expected Shortfall |
| `/learn/markowitz` | Modern Portfolio Theory |
| `/history` | Asset history with simulated charts & market events |

---

## API Endpoints

### `POST /optimize`
Run the stub optimizer.
```json
{
  "profile": "balanced",
  "btc_max": 0.15,
  "cash_max": 0.20,
  "per_asset_max": 0.35
}
```
Returns: `weights[]`, `risk_metrics` (vol, drawdown, VaR, ES, Sharpe, Sortino, Beta), `constraints_summary`, `risk_contributions[]`

### `POST /frontier`
Same input as `/optimize`. Returns efficient frontier points + named landmarks (min-var, max-sharpe, your portfolio).

### `GET /asset-history?ticker=SPY&range=3y`
Returns simulated price history + drawdown + stats + hardcoded market events.

### `GET /tickers`
Returns list of all supported tickers with name and asset class.

---

## Asset Universe (17 assets)

| Class | Tickers |
|-------|---------|
| US Equity | SPY, QQQ, VTI, IWM |
| Intl Equity | EFA, EEM |
| Fixed Income | AGG, TLT, BND, HYG, TIP |
| Commodity | GLD, DBC |
| REIT | VNQ |
| Cash | BIL |
| Crypto | BTC, ETH |

---

## Features

- **Apple Liquid UI** — animated gradient blobs, glassmorphism cards, Framer Motion spring animations
- **Info Popovers** — click the `i` icon on any parameter or metric for a plain-language explanation
- **Efficient Frontier** — Markowitz frontier chart with min-var, max-sharpe, and your portfolio marked
- **Risk Contributions** — per-asset % of total portfolio variance
- **Knowledge Pages** — interactive charts + explanations for volatility, drawdown, VaR/ES, Markowitz
- **History Page** — simulated price & drawdown charts with annotated market events
- **Expanded Universe** — 17 asset classes (ETF proxies + BTC/ETH)
- **Search/filter** — filter the weights table by ticker, name or asset class

---

## Architecture

```
btc-allocation-lab-2.0/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   └── main.py          # FastAPI: /optimize, /frontier, /asset-history, /tickers
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx        # Nav + background blobs
│   │   ├── page.tsx          # Optimizer page
│   │   ├── learn/page.tsx    # Knowledge index
│   │   ├── learn/[slug]/     # Individual learn pages
│   │   └── history/page.tsx  # Asset history
│   ├── components/
│   │   ├── ui/
│   │   │   ├── GlassCard.tsx
│   │   │   └── InfoPopover.tsx
│   │   ├── AllocationChart.tsx
│   │   ├── FrontierChart.tsx
│   │   ├── MetricCards.tsx
│   │   ├── SegmentedControl.tsx
│   │   ├── SliderInput.tsx
│   │   └── WeightsTable.tsx
│   ├── content/
│   │   ├── glossary.ts       # Info popover content for all params + metrics
│   │   └── learnContent.tsx  # Knowledge page content + charts
│   └── lib/
│       └── api.ts
└── Makefile
```

---

## Notes

- The optimizer is a **stub** — plausible base weights per profile, clamped to constraints and renormalized. A real engine (cvxpy + yfinance) is the natural next step.
- Price histories are **simulated** via geometric Brownian motion with realistic per-ticker parameters (deterministic, seeded per ticker). Not actual historical data.
- Market event descriptions are educational context, not causal claims.
