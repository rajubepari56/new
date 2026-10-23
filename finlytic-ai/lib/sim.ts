/** Deterministic-ish market simulation. Every number on this site is synthetic and labelled as such. */
export type Side = "BUY" | "SELL";
export type Status = "FILLED" | "PARTIAL" | "ROUTED" | "REJECTED";

export interface Order {
  id: string;
  t: string;
  sym: string;
  side: Side;
  qty: number;
  px: number;
  venue: string;
  status: Status;
  strat: string;
  note: string;
}

export const SYMBOLS: Record<string, number> = {
  AAPL: 231.4, MSFT: 428.7, NVDA: 131.2, TLT: 92.6, GLD: 241.3, EURUSD: 1.0842, "ES-F": 5712.5, "BTC-USD": 67210,
};
const VENUES = ["XNAS", "ARCX", "XNYS", "BATS", "IEXG", "DARK-1"];
const STRATS = ["Mean-Rev 03", "Momentum 11", "Carry 02", "Hedge-Δ", "Vol-Target", "Rebalance"];
const NOTES = [
  "Within risk budget", "Slice 1/4 · TWAP", "Spread < 1.2 bp", "Hedge ratio restored", "Liquidity sweep",
  "Cross at midpoint", "Limit improved +0.4 bp", "Drift > 35 bp → rebalance",
];

const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
export const fmt = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
export const clock = () => new Date().toISOString().slice(11, 19);

let seq = 48210;
export function makeOrder(): Order {
  const sym = pick(Object.keys(SYMBOLS));
  const base = SYMBOLS[sym];
  const px = base * (1 + (Math.random() - 0.5) * 0.002);
  const r = Math.random();
  const status: Status = r > 0.93 ? "REJECTED" : r > 0.8 ? "PARTIAL" : r > 0.65 ? "ROUTED" : "FILLED";
  const big = base > 1000;
  const qty = big ? Math.round(1 + Math.random() * 6) : Math.round((50 + Math.random() * 950) / 10) * 10;
  return {
    id: `AG-${seq++}`, t: clock(), sym, side: Math.random() > 0.5 ? "BUY" : "SELL", qty,
    px: sym === "EURUSD" ? +px.toFixed(4) : +px.toFixed(2), venue: pick(VENUES), status,
    strat: pick(STRATS), note: status === "REJECTED" ? "Pre-trade check: notional cap" : pick(NOTES),
  };
}

/** Random walk with drift, used by the live charts. */
export function step(prev: number, drift = 0.04, vol = 0.45) {
  return prev + drift + (Math.random() - 0.5) * 2 * vol;
}
export function seed(n: number, start = 100, drift = 0.04, vol = 0.45) {
  const out = [start];
  for (let i = 1; i < n; i++) out.push(step(out[i - 1], drift, vol));
  return out;
}
