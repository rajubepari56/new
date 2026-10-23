"use client";
import { motion } from "framer-motion";
import Section from "./Section";
import Reveal from "./Reveal";

const items = [
  { t: "Portfolio telemetry", d: "Streaming P&L, factor exposure and drawdown across every account, recomputed continuously.", span: "lg:col-span-2", glyph: "M3 17l5-6 4 3 8-9" },
  { t: "Policy-bound execution", d: "Orders are checked against notional, concentration and loss limits before they leave the building.", span: "", glyph: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" },
  { t: "Immutable audit trail", d: "Every decision is hashed and appended. Export for compliance in one click.", span: "", glyph: "M5 4h14v16H5zM9 9h6M9 13h6M9 17h3" },
  { t: "Smart order routing", d: "Slices size across lit and dark venues to reduce footprint and slippage.", span: "", glyph: "M4 12h6l3-6 3 12 2-6h2" },
  { t: "Human override, always", d: "A single kill switch halts the agent. Every action can be paused, reviewed and reversed by your desk.", span: "lg:col-span-2", glyph: "M12 3v9M6.5 6.5a8 8 0 1 0 11 0" },
];

export default function Capabilities() {
  return (
    <Section id="capabilities" eyebrow="Capabilities" title={<>Institutional control. <em className="text-gold-400">Machine speed.</em></>}>
      <div className="grid gap-5 lg:grid-cols-4">
        {items.map((c, i) => (
          <Reveal key={c.t} delay={i * 0.07} className={c.span}>
            <motion.div whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 300, damping: 22 }} className="panel group relative h-full overflow-hidden p-7">
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gold-500/0 blur-3xl transition duration-500 group-hover:bg-gold-500/25" />
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#E6C36A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={c.glyph} /></svg>
              <h3 className="mt-6 font-serif text-2xl text-white">{c.t}</h3>
              <p className="mt-3 leading-relaxed text-zinc-400">{c.d}</p>
            </motion.div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
