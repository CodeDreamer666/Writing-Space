export default function Loading() {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-[#0B0D10]">
            <div className="relative">
                <div
                    className="
                      h-10
                      w-10
                      animate-spin
                      rounded-full
                      border-2
                    border-[#252B36]
                    border-t-[#F5F5F7]
          "
                />
            </div>
        </div>
    );
}