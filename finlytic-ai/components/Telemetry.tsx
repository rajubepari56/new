"use client";
import { motion } from "framer-motion";
import LiveChart, { Bars } from "./LiveChart";
import Section from "./Section";
import Reveal from "./Reveal";
import { useSeries } from "@/lib/useLive";
import { fmt } from "@/lib/sim";

function Head({ label, value, tone = "text-white", sub }: { label: string; value: string; tone?: string; sub?: string }) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">{label}</div>
        <div className={`tnum mt-1 text-2xl font-semibold ${tone}`}>{value}</div>
      </div>
      {sub && <div className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-[10px] text-zinc-400">{sub}</div>}
    </div>
  );
}

function Gauge({ value }: { value: number }) {
  const r = 54, c = 2 * Math.PI * r * 0.75;
  return (
    <svg viewBox="0 0 140 120" className="mx-auto h-36 w-full" role="img" aria-label={`Risk utilisation ${Math.round(value)} percent`}>
      <g transform="rotate(135 70 70)" fill="none" strokeWidth="9" strokeLinecap="round">
        <circle cx="70" cy="70" r={r} stroke="rgba(255,255,255,.07)" strokeDasharray={`${c} 999`} />
        <motion.circle cx="70" cy="70" r={r} stroke="url(#gg)" strokeDasharray={`${c} 999`} animate={{ strokeDashoffset: c * (1 - value / 100) }} transition={{ type: "spring", stiffness: 60, damping: 18 }} />
      </g>
      <defs><linearGradient id="gg" x1="0" x2="1"><stop offset="0" stopColor="#3DDC97" /><stop offset=".6" stopColor="#E6C36A" /><stop offset="1" stopColor="#FF5C6C" /></linearGradient></defs>
      <text x="70" y="72" textAnchor="middle" className="fill-white font-serif" fontSize="26">{Math.round(value)}%</text>
      <text x="70" y="90" textAnchor="middle" className="fill-zinc-500 font-mono" fontSize="8" letterSpacing="1.5">OF RISK BUDGET</text>
    </svg>
  );
}

export default function Telemetry() {
  const nav = useSeries(80, 1000, 100, 0.07, 0.5);
  const bench = useSeries(80, 1000, 100, 0.03, 0.55);
  const dd = useSeries(80, 1000, 0, 0, 0.9).map((v) => -Math.abs(v) * 0.6);
  const util = useSeries(24, 1500, 56, 0, 4);
  const u = util.length ? Math.min(92, Math.max(22, util[util.length - 1])) : 0;
  const alpha = nav.length && bench.length ? nav[nav.length - 1] - bench[bench.length - 1] : 0;
  const venues = [38, 24, 17, 12, 9];
  return (
    <Section id="telemetry" eyebrow="Real-time telemetry" title={<>Every position. Every basis point. <em className="text-gold-400">Live.</em></>} lead="Streaming P&L, drawdown, exposure and risk-budget utilisation, recomputed continuously instead of at end of day.">
      <div className="grid gap-5 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
          <div className="panel h-full p-6">
            <Head label="Strategy vs benchmark · indexed to 100" value={nav.length ? fmt(nav[nav.length - 1]) : "—"} sub={`α ${alpha >= 0 ? "+" : ""}${fmt(alpha)}`} tone="text-gold-300" />
            <div className="relative mt-4">
              <LiveChart data={bench} height={250} stroke="#6B7280" fill={false} grid className="absolute inset-0 w-full opacity-80" />
              <LiveChart data={nav} height={250} className="relative w-full" grid={false} />
            </div>
            <div className="mt-3 flex gap-5 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              <span className="flex items-center gap-2"><i className="h-0.5 w-4 bg-gold-400" /> Finlytic agent</span>
              <span className="flex items-center gap-2"><i className="h-0.5 w-4 bg-zinc-500" /> Benchmark</span>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="panel h-full p-6">
            <Head label="Risk-budget utilisation" value="Within limits" tone="text-pos" />
            <div className="mt-2"><Gauge value={u} /></div>
            <p className="mt-1 text-center text-xs text-zinc-500">The agent throttles size automatically as utilisation approaches 100%.</p>
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <div className="panel p-6">
            <Head label="Drawdown" value={dd.length ? `${fmt(dd[dd.length - 1])}%` : "—"} tone="text-neg" sub="rolling 30d" />
            <LiveChart data={dd} height={140} stroke="#FF5C6C" className="mt-4 w-full" />
          </div>
        </Reveal>
        <Reveal delay={0.12}>
          <div className="panel p-6">
            <Head label="Execution venue share" value="5 venues" sub="smart routing" />
            <div className="mt-6"><Bars values={venues} height={110} /></div>
            <div className="mt-2 flex justify-between font-mono text-[10px] text-zinc-500">{["XNAS", "ARCX", "XNYS", "BATS", "IEXG"].map((v) => <span key={v}>{v}</span>)}</div>
          </div>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="panel flex h-full flex-col justify-between p-6">
            <Head label="Slippage vs arrival" value="−0.6 bp" tone="text-pos" sub="avg · simulated" />
            <ul className="mt-5 space-y-3">
              {[["Fill rate", 97], ["Quote-to-trade latency", 88], ["Cost vs VWAP", 92]].map(([l, v]) => (
                <li key={l as string}>
                  <div className="mb-1.5 flex justify-between font-mono text-[10px] uppercase tracking-wider text-zinc-500"><span>{l}</span><span className="text-zinc-300">{v}%</span></div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <motion.div className="h-full rounded-full bg-gradient-to-r from-gold-600 to-gold-300" initial={{ width: 0 }} whileInView={{ width: `${v}%` }} viewport={{ once: true }} transition={{ duration: 1.4, ease: "easeOut" }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
