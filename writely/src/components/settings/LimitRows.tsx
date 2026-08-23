export default function LimitRows({ rows }: { rows: string[][] }) {
  return (
    <dl className="border-t border-(--w-border-soft)">
      {rows.map(([label, value]) => (
        <div
          key={label}
          className="flex justify-between gap-5 border-b border-(--w-border-soft) py-3.5"
        >
          <dt>{label}</dt>
          <dd className="font-mono-label text-right text-[13px] text-(--w-foreground)">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
