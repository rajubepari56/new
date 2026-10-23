import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.07] py-12">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <Logo />
          <nav className="flex gap-6 text-sm text-zinc-500" aria-label="Footer">
            {["Telemetry", "Agent log", "Risk", "Access"].map((l) => <a key={l} href={`#${{ Telemetry: "telemetry", "Agent log": "agent", Risk: "risk", Access: "access" }[l]}`} className="hover:text-white">{l}</a>)}
          </nav>
        </div>
        <p className="mt-8 max-w-4xl font-mono text-[11px] leading-relaxed text-zinc-600">
          Finlytic AI Agent is a concept landing page. All performance figures, charts, symbols and order data are simulated for illustration and are not real trading results. Nothing here is investment advice or an offer of securities or advisory services. Trading involves risk of loss.
        </p>
        <p className="mt-3 font-mono text-[11px] text-zinc-700">© {new Date().getFullYear()} Finlytic. Independent design recreation; not affiliated with MotionSites.</p>
      </div>
    </footer>
  );
}
