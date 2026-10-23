# Finlytic AI Agent — institutional fintech landing page

Next.js 15 (App Router) · Tailwind CSS 3 · Framer Motion · TypeScript. No chart library: telemetry is hand-built SVG.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## What is on the page
- **Hero**: staggered word reveal, 3D-tilting live NAV terminal.
- **Telemetry**: strategy vs benchmark, risk-budget gauge, drawdown, venue share, execution quality.
- **Agent log**: streaming order table (new rows animate in every ~1.7 s).
- **Capabilities, process, risk controls (working kill switch), access form (demo only, sends nothing).**

All data comes from `lib/sim.ts` (random walks) and is labelled as simulated. Swap `lib/useLive.ts` for a WebSocket feed to go live.
Design: ink/gold palette in `tailwind.config.ts`; honours `prefers-reduced-motion`.

This is an independent recreation inspired by the "institutional fintech" look; it does not copy the MotionSites template's code or assets.
