"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import Logo from "./Logo";

const links = [["Telemetry", "#telemetry"], ["Agent log", "#agent"], ["Capabilities", "#capabilities"], ["Risk", "#risk"], ["Access", "#access"]];

export default function Nav() {
  const { scrollY } = useScroll();
  const bg = useTransform(scrollY, [0, 120], ["rgba(5,6,10,0)", "rgba(5,6,10,0.78)"]);
  const line = useTransform(scrollY, [0, 120], ["rgba(255,255,255,0)", "rgba(255,255,255,0.08)"]);
  return (
    <motion.header style={{ backgroundColor: bg, borderBottomColor: line }} className="fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl">
      <div className="container-x flex h-16 items-center justify-between">
        <a href="#top" aria-label="Finlytic AI Agent home"><Logo /></a>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {links.map(([l, h]) => (
            <a key={h} href={h} className="text-sm text-zinc-400 transition hover:text-white">{l}</a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a href="#access" className="hidden text-sm text-zinc-300 hover:text-white sm:block">Sign in</a>
          <a href="#access" className="btn-gold !px-5 !py-2">Request access</a>
        </div>
      </div>
    </motion.header>
  );
}
