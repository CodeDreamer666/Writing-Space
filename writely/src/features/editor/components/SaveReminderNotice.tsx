type Props = {
    onDismiss: () => void;
};

export default function SaveReminderNotice({ onDismiss }: Props) {
    return (
        <aside className="mb-5 flex items-center justify-between gap-3 rounded-lg border border-[#253041] bg-[#121820] px-3 py-2 text-xs text-[#AEB4BE]">
            <p>Before you leave, remember to save your work</p>
            <button
                onClick={onDismiss}
                className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-[#8E96A3] transition-colors hover:bg-[#1E2530] hover:text-[#F5F5F7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8E96A3]"
                aria-label="Dismiss save reminder"
            >
                ×
            </button>
        </aside>
    );
}
