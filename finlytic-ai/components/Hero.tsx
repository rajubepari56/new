"use client";
import { motion } from "framer-motion";
import Dashboard from "./Dashboard";

const ease = [0.22, 1, 0.36, 1] as const;

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pb-24 pt-32 sm:pt-40">
      <div className="grid-bg absolute inset-0" aria-hidden />
      <motion.div aria-hidden className="absolute left-1/2 top-[-18%] h-[620px] w-[900px] -translate-x-1/2 rounded-full bg-gold-500/20 blur-[140px]" animate={{ opacity: [0.5, 0.9, 0.5], scale: [1, 1.08, 1] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }} />
      <div className="container-x relative">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }} className="mx-auto inline-flex items-center gap-2 rounded-full border border-gold-400/25 bg-gold-400/[0.06] px-4 py-1.5">
            <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-gold-400" />
            <span className="eyebrow !tracking-[0.18em]">Autonomous execution · Institutional grade</span>
          </motion.div>
          <h1 className="h-display mt-7 text-5xl leading-[1.04] sm:text-7xl">
            {["The", "quantitative", "agent", "that"].map((w, i) => (
              <motion.span key={w} className="mr-[0.25em] inline-block" initial={{ opacity: 0, y: 40, filter: "blur(10px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.9, delay: 0.15 + i * 0.09, ease }}>{w}</motion.span>
            ))}
            <br />
            {["never", "stops"].map((w, i) => (
              <motion.span key={w} className="mr-[0.25em] inline-block bg-gradient-to-r from-gold-300 via-gold-400 to-gold-600 bg-clip-text italic text-transparent" initial={{ opacity: 0, y: 40, filter: "blur(10px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.9, delay: 0.55 + i * 0.1, ease }}>{w}</motion.span>
            ))}
            <motion.span className="inline-block" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>watching.</motion.span>
          </h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.9, ease }} className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-zinc-400">
            Finlytic monitors every position in real time, executes inside the risk limits you set, and writes an immutable log of every order it places. Built for allocators who need speed without surrendering control.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.05, ease }} className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a href="#access" className="btn-gold">Request institutional access →</a>
            <a href="#agent" className="btn-ghost">Watch the agent trade</a>
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0, y: 70, rotateX: 14 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: 1.3, delay: 0.6, ease }} style={{ transformPerspective: 1400 }} className="mx-auto mt-16 max-w-5xl">
          <Dashboard />
        </motion.div>
        <p className="mx-auto mt-6 max-w-3xl text-center font-mono text-[11px] leading-relaxed text-zinc-600">
          All figures, charts and orders on this page are simulated for demonstration. Not investment advice. Past or simulated performance does not predict future results.
        </p>
      </div>
    </section>
  );
}
