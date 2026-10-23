"use client";
import { AnimatePresence, motion } from "framer-motion";
import Section from "./Section";
import Reveal from "./Reveal";
import { useOrders } from "@/lib/useLive";
import { fmt } from "@/lib/sim";

const tone: Record<string, string> = {
  FILLED: "text-pos bg-pos/10 border-pos/25", PARTIAL: "text-gold-300 bg-gold-400/10 border-gold-400/25",
  ROUTED: "text-sky-300 bg-sky-400/10 border-sky-400/25", REJECTED: "text-neg bg-neg/10 border-neg/25",
};

export default function OrderLog() {
  const orders = useOrders(12, 1700);
  return (
    <Section id="agent" eyebrow="Automated agent log" title={<>Every decision, <em className="text-gold-400">written down.</em></>} lead="Each order carries its strategy, venue, risk check and rationale. Nothing the agent does is opaque, and nothing can be edited after the fact.">
      <Reveal>
        <div className="panel overflow-hidden shadow-glow">
          <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-3">
            <div className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-neg/70" /><i className="h-2.5 w-2.5 rounded-full bg-gold-400/70" /><i className="h-2.5 w-2.5 rounded-full bg-pos/70" /></div>
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">finlytic://agent/orders · streaming</div>
            <div className="flex items-center gap-2 font-mono text-[11px] text-pos"><span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-pos" />LIVE</div>
          </div>
          <div className="scroll-thin max-h-[520px] overflow-x-auto overflow-y-hidden">
            <table className="w-full min-w-[820px] text-left font-mono text-[12px]">
              <thead>
                <tr className="border-b border-white/[0.05] text-[10px] uppercase tracking-[0.16em] text-zinc-600">
                  {["Time (UTC)", "Order", "Symbol", "Side", "Qty", "Price", "Venue", "Strategy", "Status", "Rationale"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {orders.map((o) => (
                    <motion.tr key={o.id} layout initial={{ opacity: 0, backgroundColor: "rgba(230,195,106,.18)", x: -16 }} animate={{ opacity: 1, backgroundColor: "rgba(230,195,106,0)", x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.7 }} className="border-b border-white/[0.04] text-zinc-300">
                      <td className="tnum px-4 py-2.5 text-zinc-500">{o.t}</td>
                      <td className="px-4 py-2.5 text-zinc-400">{o.id}</td>
                      <td className="px-4 py-2.5 font-semibold text-white">{o.sym}</td>
                      <td className={`px-4 py-2.5 font-semibold ${o.side === "BUY" ? "text-pos" : "text-neg"}`}>{o.side}</td>
                      <td className="tnum px-4 py-2.5">{o.qty.toLocaleString()}</td>
                      <td className="tnum px-4 py-2.5">{fmt(o.px, o.sym === "EURUSD" ? 4 : 2)}</td>
                      <td className="px-4 py-2.5 text-zinc-400">{o.venue}</td>
                      <td className="px-4 py-2.5 text-zinc-400">{o.strat}</td>
                      <td className="px-4 py-2.5"><span className={`rounded-full border px-2 py-0.5 text-[10px] ${tone[o.status]}`}>{o.status}</span></td>
                      <td className="px-4 py-2.5 text-zinc-500">{o.note}</td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          <div className="border-t border-white/[0.07] px-5 py-3 font-mono text-[10px] text-zinc-600">Simulated order flow for demonstration. Symbols and prices are illustrative.</div>
        </div>
      </Reveal>
    </Section>
  );
}
