export type Profile = "conservative" | "balanced" | "growth";

// ── Optimize ──────────────────────────────────────────────────────────────────

export interface OptimizeRequest {
  profile: Profile;
  btc_max: number;
  cash_max: number;
  per_asset_max: number;
}

export interface AssetWeight {
  ticker: string;
  asset_class: string;
  name: string;
  weight: number;
}

export interface RiskMetrics {
  vol_annual: number;
  max_drawdown: number;
  var95: number;
  es95: number;
  sharpe: number;
  sortino: number;
  beta_spy: number;
}

export interface RiskContribution {
  ticker: string;
  contribution_pct: number;
}

export interface ConstraintsSummary {
  cash_cap: number;
  btc_cap: number;
  per_asset_cap: number;
  budgets_profile: string;
}

export interface OptimizeResponse {
  weights: AssetWeight[];
  risk_metrics: RiskMetrics;
  constraints_summary: ConstraintsSummary;
  risk_contributions: RiskContribution[];
}

// ── Frontier ──────────────────────────────────────────────────────────────────

export interface FrontierPoint {
  vol: number;
  ret: number;
  sharpe: number;
}

export interface SpecialPoint {
  vol: number;
  ret: number;
  label: string;
}

export interface FrontierResponse {
  frontier: FrontierPoint[];
  current: SpecialPoint;
  min_var: SpecialPoint;
  max_sharpe: SpecialPoint;
}

// ── Asset History ─────────────────────────────────────────────────────────────

export interface PricePoint {
  date: string;
  price: number;
  drawdown: number;
}

export interface AssetStats {
  cagr: number;
  vol_annual: number;
  max_drawdown: number;
  worst_month: number;
  total_return: number;
}

export interface MarketEvent {
  date: string;
  label: string;
  description: string;
  type: "crisis" | "macro" | "crypto" | "bull" | "info";
}

export interface AssetHistoryResponse {
  ticker: string;
  name: string;
  range_years: number;
  prices: PricePoint[];
  stats: AssetStats;
  events: MarketEvent[];
}

export interface TickerMeta {
  ticker: string;
  name: string;
  asset_class: string;
}

// ── Fetch helpers ─────────────────────────────────────────────────────────────

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return res.json() as Promise<T>;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

export const optimize = (req: OptimizeRequest) =>
  post<OptimizeResponse>("/optimize", req);

export const getFrontier = (req: OptimizeRequest) =>
  post<FrontierResponse>("/frontier", req);

export const getAssetHistory = (ticker: string, range: string) =>
  get<AssetHistoryResponse>(`/asset-history?ticker=${ticker}&range=${range}`);

export const getTickers = () => get<TickerMeta[]>("/tickers");
