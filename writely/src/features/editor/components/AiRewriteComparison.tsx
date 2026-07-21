type Props = {
  original: string;
  improved: string;
  changes: string;
};

export default function AiRewriteComparison({
  original,
  improved,
  changes,
}: Props) {
  return (
    <div className="mt-3 space-y-4">
      <section>
        <p className="text-[11px] font-medium tracking-widest text-[var(--w-subtle)] uppercase">
          Original
        </p>
        <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-[var(--w-muted)]">
          {original}
        </p>
      </section>

      <section>
        <p className="text-[11px] font-medium tracking-widest text-[var(--w-subtle)] uppercase">
          Improved version
        </p>
        <div
          className="mt-2 text-sm leading-relaxed text-[var(--w-foreground)] [&_h1]:mt-4 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:text-lg [&_h3]:font-semibold [&_li]:ml-5 [&_ol]:my-2 [&_ol]:list-decimal [&_p]:whitespace-pre-wrap [&_ul]:my-2 [&_ul]:list-disc"
          dangerouslySetInnerHTML={{ __html: improved }}
        />
      </section>

      <section>
        <p className="text-[11px] font-medium tracking-widest text-[var(--w-subtle)] uppercase">
          What changed
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--w-strong)]">
          {changes}
        </p>
      </section>
    </div>
  );
}
