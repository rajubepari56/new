"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Reveal from "./Reveal";

export default function Access() {
  const [sent, setSent] = useState(false);
  return (
    <section id="access" className="relative scroll-mt-20 overflow-hidden py-28">
      <div className="absolute inset-x-0 bottom-0 h-[420px] bg-gradient-to-t from-gold-500/10 to-transparent" aria-hidden />
      <div className="container-x relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <div className="eyebrow">Institutional access</div>
          <h2 className="h-display mt-4 text-4xl sm:text-6xl">See the agent run <em className="text-gold-400">on your mandate.</em></h2>
          <p className="mt-5 text-lg text-zinc-400">We onboard a limited number of allocators each quarter. Tell us about your book and we will be in touch.</p>
        </Reveal>
        <Reveal delay={0.1} className="mx-auto mt-10 max-w-xl">
          {sent ? (
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="panel p-10 text-center">
              <div className="font-serif text-3xl text-white">Request received.</div>
              <p className="mt-2 text-zinc-400">This is a demo form. No data was sent or stored.</p>
            </motion.div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="panel space-y-4 p-6 sm:p-8">
              {[["name", "Full name", "text"], ["email", "Work email", "email"], ["firm", "Firm and approximate AUM", "text"]].map(([n, l, t]) => (
                <label key={n} className="block">
                  <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">{l}</span>
                  <input required name={n} type={t} className="w-full rounded-lg border border-white/10 bg-ink-900/80 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-gold-400/70 focus:ring-2 focus:ring-gold-400/20" />
                </label>
              ))}
              <button className="btn-gold w-full">Request access</button>
              <p className="text-center font-mono text-[10px] text-zinc-600">Demo only. Nothing is transmitted.</p>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
