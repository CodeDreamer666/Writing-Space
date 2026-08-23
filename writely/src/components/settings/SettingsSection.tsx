export default function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-5 border-b border-(--w-border-soft) py-9 sm:py-11 md:grid-cols-[200px_minmax(0,1fr)] md:gap-10">
      <h2 className="font-mono-label text-[11px] tracking-[0.18em] uppercase">
        {title}
      </h2>
      <div className="text-[15px] leading-[1.75] text-(--w-muted)">
        {children}
      </div>
    </section>
  );
}
