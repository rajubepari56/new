"use client";
import { motion } from "framer-motion";
import Section from "./Section";

const steps = [
  ["01", "Connect", "Read-only connections to your custodians and prime brokers. No funds ever move to us."],
  ["02", "Define limits", "Set mandate, risk budget, venue rules and loss limits. These are hard constraints, not suggestions."],
  ["03", "Agent executes", "The agent trades inside your limits and streams every order to the log in real time."],
  ["04", "You review", "Daily attribution, full audit export and override controls, in one terminal."],
];

export default function Process() {
  return (
    <Section id="process" eyebrow="How it works" title={<>From connection to execution in <em className="text-gold-400">four steps.</em></>}>
      <div className="relative grid gap-5 md:grid-cols-4">
        <div className="absolute left-0 right-0 top-[27px] hidden h-px bg-white/10 md:block" aria-hidden>
          <motion.div className="h-full bg-gradient-to-r from-gold-600 via-gold-300 to-transparent" initial={{ width: 0 }} whileInView={{ width: "100%" }} viewport={{ once: true }} transition={{ duration: 2, ease: "easeInOut" }} />
        </div>
        {steps.map(([n, t, d], i) => (
          <motion.div key={n} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.7, delay: i * 0.18 }} className="relative">
            <div className="relative z-10 grid h-14 w-14 place-items-center rounded-full border border-gold-400/40 bg-ink-900 font-mono text-sm text-gold-300 shadow-glow">{n}</div>
            <h3 className="mt-6 font-serif text-2xl text-white">{t}</h3>
            <p className="mt-2 leading-relaxed text-zinc-400">{d}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
