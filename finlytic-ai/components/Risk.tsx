"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Section from "./Section";
import Reveal from "./Reveal";

const controls = [
  ["Max single-name concentration", "5.0%"], ["Daily loss limit", "−1.5%"], ["Pre-trade notional cap", "$2.5M / order"], ["Restricted-list screening", "On"], ["Gross leverage ceiling", "2.0×"],
];

export default function Risk() {
  const [halted, setHalted] = useState(false);
  return (
    <Section id="risk" eyebrow="Risk & compliance" title={<>Autonomy that <em className="text-gold-400">answers to you.</em></>} lead="Limits are enforced before an order is sent, not discovered after. Try the kill switch.">
      <div className="grid items-stretch gap-5 lg:grid-cols-2">
        <Reveal>
          <div className="panel h-full divide-y divide-white/[0.06]">
            {controls.map(([l, v]) => (
              <div key={l} className="flex items-center justify-between px-6 py-4">
                <span className="text-zinc-300">{l}</span><span className="tnum font-mono text-sm text-gold-300">{v}</span>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className={`panel relative flex h-full flex-col items-center justify-center overflow-hidden p-10 text-center transition-colors duration-500 ${halted ? "!border-neg/40" : ""}`}>
            <AnimatePresence mode="wait">
              <motion.div key={String(halted)} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }}>
                <div className={`font-mono text-[11px] uppercase tracking-[0.22em] ${halted ? "text-neg" : "text-pos"}`}>{halted ? "Agent halted" : "Agent active"}</div>
                <div className="mt-3 font-serif text-4xl text-white">{halted ? "All orders paused" : "Trading within limits"}</div>
                <p className="mx-auto mt-3 max-w-sm text-zinc-400">{halted ? "Working orders cancelled. Positions untouched. Your desk decides what happens next." : "Orders are being placed and logged in real time."}</p>
              </motion.div>
            </AnimatePresence>
            <button onClick={() => setHalted((h) => !h)} aria-pressed={halted} className={`mt-8 rounded-full px-7 py-3 text-sm font-semibold transition ${halted ? "btn-gold" : "border border-neg/50 bg-neg/10 text-neg hover:bg-neg/20"}`}>
              {halted ? "Resume agent" : "Halt agent (kill switch)"}
            </button>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
