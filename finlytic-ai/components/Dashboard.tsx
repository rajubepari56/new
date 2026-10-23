"use client";
import { motion } from "framer-motion";
import LiveChart, { Bars } from "./LiveChart";
import { useSeries } from "@/lib/useLive";
import { fmt } from "@/lib/sim";

/** Hero terminal: live equity curve + KPI strip + exposure bars. All values are simulated. */
export default function Dashboard() {
  const nav = useSeries(90, 900, 1000, 0.5, 2.2);
  const last = nav[nav.length - 1] ?? 0, first = nav[0] ?? 0;
  const chg = first ? ((last - first) / first) * 100 : 0;
  const expo = useSeries(10, 1400, 50, 0, 14).map((v) => Math.abs(v) + 12);
  const kpis = [
    ["Net exposure", "62.4%", "text-white"], ["Sharpe (30d)", "2.31", "text-pos"], ["Max drawdown", "−3.8%", "text-neg"], ["Agent latency", "11 ms", "text-gold-300"],
  ];
  return (
    <div className="panel relative overflow-hidden p-4 shadow-glow sm:p-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/70 to-transparent" />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">
            <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-pos" /> Live · Portfolio NAV · simulated
          </div>
          <div className="tnum mt-2 font-serif text-4xl text-white sm:text-5xl">${last ? fmt(last * 12480, 0) : "—"}</div>
        </div>
        <div className={`tnum rounded-full border px-3 py-1 font-mono text-xs ${chg >= 0 ? "border-pos/30 bg-pos/10 text-pos" : "border-neg/30 bg-neg/10 text-neg"}`}>
          {chg >= 0 ? "▲" : "▼"} {fmt(Math.abs(chg))}% · session
        </div>
      </div>
      <LiveChart data={nav} height={230} className="mt-5 w-full" />
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {kpis.map(([l, v, c], i) => (
          <motion.div key={l} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 + i * 0.1 }} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">{l}</div>
            <div className={`tnum mt-1 text-lg font-semibold ${c}`}>{v}</div>
          </motion.div>
        ))}
      </div>
      <div className="mt-5 flex items-end justify-between gap-4">
        <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Sector exposure</div>
        <div className="w-2/3 sm:w-3/4">{expo.length > 0 && <Bars values={expo} height={44} />}</div>
      </div>
    </div>
  );
}
