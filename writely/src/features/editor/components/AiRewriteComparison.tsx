type Props = {
  original: string;
  improved: string;
  changes: string[];
};

export default function AiRewriteComparison({
  original,
  improved,
  changes,
}: Props) {
  return (
    <div className="mt-3 space-y-4">
      <section>
        <p className="text-[11px] font-medium tracking-widest text-[#6B7280] uppercase">
          Original
        </p>
        <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-[#AEB4BE]">
          {original}
        </p>
      </section>

      <section>
        <p className="text-[11px] font-medium tracking-widest text-[#6B7280] uppercase">
          Improved version
        </p>
        <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-[#F5F5F7]">
          {improved}
        </p>
      </section>

      <section>
        <p className="text-[11px] font-medium tracking-widest text-[#6B7280] uppercase">
          What changed
        </p>
        <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-[#D5D9DF]">
          {changes.map((change) => (
            <li key={change} className="flex gap-2">
              <span aria-hidden="true" className="text-[#8E96A3]">
                •
              </span>
              <span>{change}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
