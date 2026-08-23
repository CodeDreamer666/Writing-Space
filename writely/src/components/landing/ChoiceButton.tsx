export default function ChoiceButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-[46px] cursor-pointer border-0 px-4 text-sm sm:px-6 ${active ? "bg-(--w-foreground) font-medium text-(--w-background)" : "bg-transparent text-(--w-subtle)"}`}
    >
      {children}
    </button>
  );
}
