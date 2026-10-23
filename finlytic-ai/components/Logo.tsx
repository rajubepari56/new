export default function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden>
        <defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F2DDA6" /><stop offset="1" stopColor="#B28A2E" /></linearGradient></defs>
        <rect x="1" y="1" width="24" height="24" rx="7" fill="none" stroke="url(#lg)" strokeWidth="1.5" />
        <path d="M6 17l4.5-5 3.5 3 6-7" fill="none" stroke="url(#lg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="font-serif text-lg tracking-tight text-white">Finlytic<span className="ml-1.5 font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-400">AI Agent</span></span>
    </span>
  );
}
