export default function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-10">
      <h2 className="text-xl font-medium text-(--w-foreground)">{title}</h2>
      <div className="mt-3 text-sm leading-7 text-(--w-muted)">{children}</div>
    </section>
  );
}
