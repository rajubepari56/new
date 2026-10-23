import Reveal from "./Reveal";

export default function Section({ id, eyebrow, title, lead, children }: { id: string; eyebrow: string; title: React.ReactNode; lead?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="relative scroll-mt-20 py-24 sm:py-32">
      <div className="container-x">
        <Reveal className="mx-auto max-w-3xl text-center">
          <div className="eyebrow">{eyebrow}</div>
          <h2 className="h-display mt-4 text-4xl leading-[1.1] sm:text-5xl">{title}</h2>
          {lead && <p className="mt-5 text-lg leading-relaxed text-zinc-400">{lead}</p>}
        </Reveal>
        <div className="mt-14">{children}</div>
      </div>
    </section>
  );
}
