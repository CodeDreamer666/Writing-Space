const Button = ({
    active,
    children,
    onClick,
}: {
    active: boolean;
    children: React.ReactNode;
    onClick: () => void;
}) => {
    return (
        <button
            onClick={onClick}
            className={`
                cursor-pointer
                flex
                h-8
                min-w-8
                items-center
                justify-center
                rounded-lg
                px-2
                text-sm
                transition-colors
                ${active
                    ? "bg-[#1A1F26] text-[#F5F5F7]"
                    : "text-[#8E96A3] hover:bg-[#12161C] hover:text-[#F5F5F7]"
                }`}
        >
            {children}
        </button>
    );
};

export default Button
