const comparisonRows = [
  {
    typical: "Tools visible before writing",
    writely: "Tools appear after selecting text",
  },
  {
    typical: "AI can become the centre",
    writely: "AI stays hidden until requested",
  },
  {
    typical: "Document management inside the editor",
    writely: "The writing space stays almost empty",
  },
  {
    typical: "Designed around formatting the document",
    writely: "Designed around developing the thought",
  },
];

const trustItems = [
  { title: "Safe as you write", body: "Autosave and browser recovery" },
  { title: "Private by design", body: "AI receives selected text only" },
  { title: "Yours to take", body: "Export whenever you need" },
];

export default function Comparison() {
  return (
    <section className="border-b border-(--w-border-soft) px-5 py-16 sm:px-10 sm:py-[88px]">
      <p className="font-mono-label mb-10 text-[11px] tracking-[0.2em] text-(--w-subtle) uppercase">
        03 — The difference
      </p>
      <h2 className="font-display mb-14 max-w-[24ch] text-[clamp(2.2rem,4.4vw,4rem)] leading-[1.04] font-light tracking-[-0.03em]">
        Built around the <em>thought</em>, not the toolbar
      </h2>
      <div className="border-t border-(--w-foreground)">
        <div className="grid grid-cols-2 border-b border-(--w-border-soft)">
          <p className="font-mono-label py-4 pr-4 text-[10px] tracking-[0.18em] text-(--w-subtle) uppercase sm:pr-6">
            Typical document editor
          </p>
          <p className="font-mono-label border-l border-(--w-border-soft) py-4 pl-4 text-[10px] tracking-[0.18em] uppercase sm:pl-6">
            Writely
          </p>
        </div>
        {comparisonRows.map((row) => (
          <div
            key={row.typical}
            className="grid grid-cols-2 border-b border-(--w-border-soft)"
          >
            <p className="py-5 pr-4 text-sm leading-[1.6] text-(--w-subtle) sm:py-[26px] sm:pr-6 sm:text-base">
              {row.typical}
            </p>
            <p className="border-l border-(--w-border-soft) py-5 pl-4 text-sm leading-[1.6] sm:py-[26px] sm:pl-6 sm:text-base">
              {row.writely}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-14 grid gap-9 lg:grid-cols-3 lg:gap-8">
        {trustItems.map((item) => (
          <div key={item.title}>
            <h3 className="font-display mb-2.5 text-[22px] leading-[1.2] font-normal">
              {item.title}
            </h3>
            <p className="text-sm leading-[1.7] text-(--w-muted)">
              {item.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
