"""
BTC Allocation Lab 2.0 – FastAPI backend
Stub optimizer + real market data via yfinance.
NOT financial advice.
"""

from __future__ import annotations

import logging
import math
import time
from typing import Literal

import numpy as np
import pandas as pd
import yfinance as yf
from cachetools import TTLCache
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

logger = logging.getLogger("btc-lab")

app = FastAPI(title="BTC Allocation Lab API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Shared ticker meta ────────────────────────────────────────────────────────

ASSET_META: dict[str, dict] = {
    # US Equity
    "SPY":     {"asset_class": "equity",       "name": "S&P 500 ETF",         "expected_ret": 0.108, "vol": 0.18},
    "QQQ":     {"asset_class": "equity",       "name": "Nasdaq-100 ETF",      "expected_ret": 0.128, "vol": 0.22},
    "VTI":     {"asset_class": "equity",       "name": "Total US Market ETF", "expected_ret": 0.105, "vol": 0.18},
    "IWM":     {"asset_class": "equity",       "name": "Russell 2000 ETF",    "expected_ret": 0.095, "vol": 0.22},
    # International
    "EFA":     {"asset_class": "intl_equity",  "name": "Developed Markets",   "expected_ret": 0.078, "vol": 0.17},
    "EEM":     {"asset_class": "intl_equity",  "name": "Emerging Markets",    "expected_ret": 0.085, "vol": 0.22},
    # Bonds
    "AGG":     {"asset_class": "fixed_income", "name": "US Agg Bond ETF",     "expected_ret": 0.040, "vol": 0.06},
    "TLT":     {"asset_class": "fixed_income", "name": "20Y Treasury ETF",    "expected_ret": 0.040, "vol": 0.14},
    "BND":     {"asset_class": "fixed_income", "name": "Total Bond Market",   "expected_ret": 0.038, "vol": 0.06},
    "HYG":     {"asset_class": "fixed_income", "name": "High-Yield Corp ETF", "expected_ret": 0.060, "vol": 0.09},
    "TIP":     {"asset_class": "fixed_income", "name": "TIPS ETF",            "expected_ret": 0.038, "vol": 0.05},
    # Commodities / Alts
    "GLD":     {"asset_class": "commodity",    "name": "Gold ETF",            "expected_ret": 0.055, "vol": 0.15},
    "DBC":     {"asset_class": "commodity",    "name": "Commodities ETF",     "expected_ret": 0.050, "vol": 0.18},
    # REITs
    "VNQ":     {"asset_class": "reit",         "name": "US REIT ETF",         "expected_ret": 0.080, "vol": 0.20},
    # Cash
    "BIL":     {"asset_class": "cash",         "name": "T-Bill ETF (Cash)",   "expected_ret": 0.045, "vol": 0.005},
    # Crypto
    "BTC":     {"asset_class": "crypto",       "name": "Bitcoin",             "expected_ret": 0.400, "vol": 0.70},
    "ETH":     {"asset_class": "crypto",       "name": "Ethereum",            "expected_ret": 0.350, "vol": 0.80},
}


# ── Optimize schemas ──────────────────────────────────────────────────────────

class OptimizeRequest(BaseModel):
    profile: Literal["conservative", "balanced", "growth"]
    btc_max: float = Field(0.15, ge=0.0, le=0.3)
    cash_max: float = Field(0.20, ge=0.0, le=0.3)
    per_asset_max: float = Field(0.35, ge=0.05, le=0.4)


class AssetWeight(BaseModel):
    ticker: str
    asset_class: str
    name: str
    weight: float


class RiskMetrics(BaseModel):
    vol_annual: float
    max_drawdown: float
    var95: float
    es95: float
    sharpe: float
    sortino: float
    beta_spy: float


class RiskContribution(BaseModel):
    ticker: str
    contribution_pct: float  # 0–100


class ConstraintsSummary(BaseModel):
    cash_cap: float
    btc_cap: float
    per_asset_cap: float
    budgets_profile: str


class OptimizeResponse(BaseModel):
    weights: list[AssetWeight]
    risk_metrics: RiskMetrics
    constraints_summary: ConstraintsSummary
    risk_contributions: list[RiskContribution]


# ── Stub data ─────────────────────────────────────────────────────────────────

PROFILE_STUBS: dict[str, dict] = {
    "conservative": {
        "base_weights": {
            "BIL": 0.15, "AGG": 0.20, "BND": 0.10, "TIP": 0.05,
            "TLT": 0.05, "GLD": 0.08, "SPY": 0.18, "VTI": 0.05,
            "EFA": 0.05, "VNQ": 0.04, "BTC": 0.05,
        },
        "risk": {
            "vol_annual": 0.082, "max_drawdown": -0.120, "var95": -0.042,
            "es95": -0.062, "sharpe": 0.68, "sortino": 0.95, "beta_spy": 0.28,
        },
    },
    "balanced": {
        "base_weights": {
            "BIL": 0.08, "AGG": 0.10, "BND": 0.05, "TLT": 0.04,
            "GLD": 0.06, "SPY": 0.22, "QQQ": 0.10, "VTI": 0.06,
            "EFA": 0.06, "EEM": 0.04, "VNQ": 0.04, "HYG": 0.03,
            "DBC": 0.03, "BTC": 0.09,
        },
        "risk": {
            "vol_annual": 0.138, "max_drawdown": -0.215, "var95": -0.068,
            "es95": -0.098, "sharpe": 0.81, "sortino": 1.12, "beta_spy": 0.62,
        },
    },
    "growth": {
        "base_weights": {
            "BIL": 0.03, "AGG": 0.04, "GLD": 0.04, "SPY": 0.22,
            "QQQ": 0.18, "VTI": 0.08, "EFA": 0.05, "EEM": 0.06,
            "IWM": 0.05, "VNQ": 0.04, "HYG": 0.03, "DBC": 0.03,
            "BTC": 0.15,
        },
        "risk": {
            "vol_annual": 0.218, "max_drawdown": -0.348, "var95": -0.118,
            "es95": -0.168, "sharpe": 0.92, "sortino": 1.31, "beta_spy": 0.88,
        },
    },
}


def _apply_constraints(
    base_weights: dict[str, float],
    btc_max: float,
    cash_max: float,
    per_asset_max: float,
) -> list[dict]:
    clamped: dict[str, float] = {}
    for ticker, wt in base_weights.items():
        meta = ASSET_META.get(ticker, {})
        if ticker == "BTC":
            wt = min(wt, btc_max)
        if meta.get("asset_class") == "cash":
            wt = min(wt, cash_max)
        wt = min(wt, per_asset_max)
        clamped[ticker] = wt

    total = sum(clamped.values())
    if total > 0:
        clamped = {t: w / total for t, w in clamped.items()}

    result = []
    for ticker, weight in sorted(clamped.items(), key=lambda x: -x[1]):
        if weight > 0.001:
            meta = ASSET_META.get(ticker, {})
            result.append({
                "ticker": ticker,
                "asset_class": meta.get("asset_class", "other"),
                "name": meta.get("name", ticker),
                "weight": round(weight, 4),
            })
    return result


def _risk_contributions(weights: list[dict]) -> list[RiskContribution]:
    """Simplified risk contribution: weight * vol^2 as proxy for marginal contrib."""
    rc = []
    for w in weights:
        meta = ASSET_META.get(w["ticker"], {})
        vol = meta.get("vol", 0.15)
        rc.append((w["ticker"], w["weight"] * vol ** 2))
    total_rc = sum(v for _, v in rc) or 1
    return [
        RiskContribution(ticker=t, contribution_pct=round(v / total_rc * 100, 1))
        for t, v in sorted(rc, key=lambda x: -x[1])
    ]


# ── Optimize endpoint ─────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "version": "2.0.0"}


@app.post("/optimize", response_model=OptimizeResponse)
def optimize(req: OptimizeRequest) -> OptimizeResponse:
    stub = PROFILE_STUBS[req.profile]
    weights = _apply_constraints(
        stub["base_weights"], req.btc_max, req.cash_max, req.per_asset_max
    )
    return OptimizeResponse(
        weights=[AssetWeight(**w) for w in weights],
        risk_metrics=RiskMetrics(**stub["risk"]),
        constraints_summary=ConstraintsSummary(
            cash_cap=req.cash_max,
            btc_cap=req.btc_max,
            per_asset_cap=req.per_asset_max,
            budgets_profile=req.profile,
        ),
        risk_contributions=_risk_contributions(weights),
    )


# ── Frontier schemas ──────────────────────────────────────────────────────────

class FrontierPoint(BaseModel):
    vol: float
    ret: float
    sharpe: float


class SpecialPoint(BaseModel):
    vol: float
    ret: float
    label: str


class FrontierResponse(BaseModel):
    frontier: list[FrontierPoint]
    current: SpecialPoint
    min_var: SpecialPoint
    max_sharpe: SpecialPoint


# ── Frontier endpoint ─────────────────────────────────────────────────────────

@app.post("/frontier", response_model=FrontierResponse)
def frontier(req: OptimizeRequest) -> FrontierResponse:
    """
    Generate a plausible efficient frontier using a closed-form approximation.
    This is educational / illustrative only.
    """
    rng = np.random.default_rng(42)
    rf = 0.043  # risk-free rate (approx current)

    # Frontier: parabolic in (vol, ret) space
    # min-var ~5-8% vol depending on profile; grows concavely
    profile_offset = {"conservative": 0.0, "balanced": 0.03, "growth": 0.06}
    base_min_vol = 0.055 + profile_offset[req.profile]

    n = 60
    vols = np.linspace(base_min_vol, 0.40, n)
    # Diminishing-returns shape: ret = a + b*ln(vol / min_vol)
    a = 0.046 + profile_offset[req.profile] * 0.5
    b = 0.042
    rets = a + b * np.log(vols / base_min_vol)
    rets = np.clip(rets, 0.01, 0.30)

    # Add tiny noise for visual texture
    noise = rng.normal(0, 0.0015, n)
    rets_noisy = np.clip(rets + noise, 0.01, 0.30)

    frontier_pts = [
        FrontierPoint(
            vol=round(float(v), 4),
            ret=round(float(r), 4),
            sharpe=round((float(r) - rf) / float(v), 3),
        )
        for v, r in zip(vols, rets_noisy)
    ]

    # Named landmarks
    min_var = SpecialPoint(
        vol=round(float(vols[0]), 4),
        ret=round(float(rets_noisy[0]), 4),
        label="Min Variance",
    )
    sharpe_idx = int(np.argmax((rets_noisy - rf) / vols))
    max_sharpe = SpecialPoint(
        vol=round(float(vols[sharpe_idx]), 4),
        ret=round(float(rets_noisy[sharpe_idx]), 4),
        label="Max Sharpe",
    )

    # Current portfolio from stub
    stub_risk = PROFILE_STUBS[req.profile]["risk"]
    current_vol = stub_risk["vol_annual"]
    current_ret = a + b * math.log(max(current_vol, base_min_vol) / base_min_vol)
    current = SpecialPoint(
        vol=round(current_vol, 4),
        ret=round(current_ret, 4),
        label="Your Portfolio",
    )

    return FrontierResponse(
        frontier=frontier_pts,
        current=current,
        min_var=min_var,
        max_sharpe=max_sharpe,
    )


# ── Asset History schemas ─────────────────────────────────────────────────────

class PricePoint(BaseModel):
    date: str
    price: float
    drawdown: float  # 0 to -1


class AssetStats(BaseModel):
    cagr: float
    vol_annual: float
    max_drawdown: float
    worst_month: float
    total_return: float


class MarketEvent(BaseModel):
    date: str
    label: str
    description: str
    type: Literal["crisis", "macro", "crypto", "bull", "info"]


class AssetHistoryResponse(BaseModel):
    ticker: str
    name: str
    range_years: int
    prices: list[PricePoint]
    stats: AssetStats
    events: list[MarketEvent]
    data_source: str = "Yahoo Finance"


# ── Hard-coded market events ──────────────────────────────────────────────────

GLOBAL_EVENTS: list[dict] = [
    {
        "date": "2020-02-24",
        "label": "COVID-19 Crash",
        "description": (
            "Global pandemic fears triggered a rapid 34% drop in the S&P 500 "
            "in just 33 trading days — one of the fastest bear markets in history. "
            "Central banks responded with record stimulus."
        ),
        "type": "crisis",
    },
    {
        "date": "2020-04-01",
        "label": "Fed 'Infinite QE'",
        "description": (
            "The US Federal Reserve announced unlimited asset purchases. "
            "Combined with $2T+ in fiscal stimulus, this helped trigger "
            "a sharp recovery across equities and bonds."
        ),
        "type": "macro",
    },
    {
        "date": "2021-11-15",
        "label": "Inflation Peaks",
        "description": (
            "US CPI reached its highest level since 1982 (~8%). "
            "Markets began pricing in aggressive Fed rate hikes, "
            "hitting bond prices and growth stocks hardest."
        ),
        "type": "macro",
    },
    {
        "date": "2022-03-16",
        "label": "Fed Hike Cycle Begins",
        "description": (
            "The Federal Reserve started raising rates from ~0% to ~5.25% "
            "over 18 months. Long-duration bonds (TLT) fell ~40%. "
            "Growth stocks and crypto sold off sharply."
        ),
        "type": "macro",
    },
    {
        "date": "2022-11-11",
        "label": "FTX Collapse",
        "description": (
            "Major crypto exchange FTX filed for bankruptcy amid fraud allegations. "
            "Bitcoin dropped ~20% in days; broader crypto market lost ~$200B in value. "
            "Context: not a fundamental change to BTC's underlying tech."
        ),
        "type": "crypto",
    },
    {
        "date": "2023-03-10",
        "label": "SVB Bank Failure",
        "description": (
            "Silicon Valley Bank collapsed — the second-largest US bank failure in history. "
            "Caused by duration mismatch on bond portfolios during rising rates. "
            "Short-term panic; Fed backstopped depositors within 48 hours."
        ),
        "type": "crisis",
    },
    {
        "date": "2024-01-10",
        "label": "Bitcoin Spot ETF Approved",
        "description": (
            "The SEC approved the first US spot Bitcoin ETFs (BlackRock, Fidelity et al.). "
            "This opened BTC to institutional investors and pension funds, "
            "driving significant inflows and price appreciation."
        ),
        "type": "crypto",
    },
]


# ── Real market data via yfinance ─────────────────────────────────────────────

# Map internal tickers → yfinance symbols
YF_TICKER_MAP: dict[str, str] = {
    "BTC": "BTC-USD",
    "ETH": "ETH-USD",
}

# yfinance period strings
RANGE_MAP: dict[str, str] = {
    "1y": "1y",
    "3y": "3y",
    "5y": "5y",
    "max": "max",
}

VALID_TICKERS: list[str] = list(ASSET_META.keys())

# TTL cache: 100 entries, 6-hour TTL
_history_cache: TTLCache = TTLCache(maxsize=100, ttl=6 * 3600)


def _fetch_real_history(ticker: str, period: str) -> tuple[list[PricePoint], AssetStats]:
    """
    Download real OHLC data from Yahoo Finance, compute drawdowns and stats.
    Returns (price_points, stats). Raises ValueError on empty/bad data.
    Retries once on rate-limit errors with a short back-off.
    """
    yf_ticker = YF_TICKER_MAP.get(ticker, ticker)

    def _download() -> pd.DataFrame:
        # Use Ticker.history() — more reliable against transient rate limits
        # than yf.download() for single-ticker requests.
        t = yf.Ticker(yf_ticker)
        return t.history(
            period=period,
            interval="1d",
            auto_adjust=True,
        )

    df = _download()
    if df is None or df.empty:
        # One retry after a short back-off
        logger.warning("Empty response for %s, retrying in 5s…", yf_ticker)
        time.sleep(5)
        df = _download()

    if df is None or df.empty:
        raise ValueError(f"No data returned by Yahoo Finance for '{yf_ticker}'")

    # Normalize columns: newer yfinance may return MultiIndex
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)

    if "Close" not in df.columns:
        raise ValueError(f"'Close' column not found for '{yf_ticker}'")

    closes: pd.Series = df["Close"].ffill().dropna()

    if len(closes) < 5:
        raise ValueError(f"Insufficient data for '{yf_ticker}' (got {len(closes)} rows)")

    close_arr = closes.to_numpy(dtype=float)

    # Drawdown series
    running_max = np.maximum.accumulate(close_arr)
    drawdowns = (close_arr - running_max) / running_max  # ≤ 0

    # Weekly down-sample (≈52 points/year) to keep payload small
    n = len(close_arr)
    years_approx = max((closes.index[-1] - closes.index[0]).days / 365.25, 0.1)
    step = max(1, n // int(years_approx * 52 + 1))

    price_points: list[PricePoint] = []
    for i in range(0, n, step):
        price_points.append(PricePoint(
            date=closes.index[i].date().isoformat(),
            price=round(float(close_arr[i]), 4),
            drawdown=round(float(drawdowns[i]), 4),
        ))
    # Always include the last trading day
    if price_points[-1].date != closes.index[-1].date().isoformat():
        price_points.append(PricePoint(
            date=closes.index[-1].date().isoformat(),
            price=round(float(close_arr[-1]), 4),
            drawdown=round(float(drawdowns[-1]), 4),
        ))

    # ── Statistics ────────────────────────────────────────────────────────────
    total_ret = (close_arr[-1] / close_arr[0]) - 1
    cagr = (close_arr[-1] / close_arr[0]) ** (1.0 / years_approx) - 1

    # Daily log-returns → annualised vol
    log_rets = np.log(close_arr[1:] / close_arr[:-1])
    annual_vol = float(np.std(log_rets)) * math.sqrt(252)

    # Worst single calendar-month approx (every ~21 trading days)
    monthly_simple = [
        (close_arr[min(i + 21, n - 1)] / close_arr[i]) - 1
        for i in range(0, n - 1, 21)
    ]
    worst_month = float(min(monthly_simple)) if monthly_simple else 0.0
    max_dd = float(drawdowns.min())

    stats = AssetStats(
        cagr=round(cagr, 4),
        vol_annual=round(annual_vol, 4),
        max_drawdown=round(max_dd, 4),
        worst_month=round(worst_month, 4),
        total_return=round(total_ret, 4),
    )

    return price_points, stats


# ── History endpoint ──────────────────────────────────────────────────────────

@app.get("/asset-history", response_model=AssetHistoryResponse)
def asset_history(
    ticker: str = Query("SPY", description="Asset ticker (e.g. SPY, BTC, GLD)"),
    range: str = Query("3y", description="Time range: 1y | 3y | 5y | max"),
) -> AssetHistoryResponse:
    ticker = ticker.upper()
    if ticker not in ASSET_META:
        raise HTTPException(status_code=400, detail=f"Unknown ticker '{ticker}'. Use /tickers to list valid symbols.")

    period = RANGE_MAP.get(range, "3y")
    cache_key = (ticker, period)

    # ── Cache lookup ──────────────────────────────────────────────────────────
    if cache_key in _history_cache:
        price_points, stats = _history_cache[cache_key]
        logger.info("Cache hit: %s %s", ticker, period)
    else:
        logger.info("Fetching from Yahoo Finance: %s %s", ticker, period)
        try:
            price_points, stats = _fetch_real_history(ticker, period)
            _history_cache[cache_key] = (price_points, stats)
        except Exception as exc:
            logger.error("yfinance error for %s: %s", ticker, exc)
            raise HTTPException(
                status_code=502,
                detail=f"Could not fetch data for '{ticker}' from Yahoo Finance: {exc}",
            )

    meta = ASSET_META.get(ticker, {"name": ticker, "asset_class": "other"})
    years_approx = len(price_points) // 52 or 1

    return AssetHistoryResponse(
        ticker=ticker,
        name=meta["name"],
        range_years=years_approx,
        prices=price_points,
        stats=stats,
        events=GLOBAL_EVENTS,
        data_source="Yahoo Finance (via yfinance)",
    )


@app.get("/tickers")
def list_tickers():
    return [
        {
            "ticker": t,
            "name": ASSET_META[t]["name"],
            "asset_class": ASSET_META[t]["asset_class"],
        }
        for t in VALID_TICKERS
    ]
