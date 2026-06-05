import Link from "next/link";

export default function ServerError() {
    return (
        <section className="fixed inset-0 z-9999 flex items-center justify-center bg-black px-4">
            <div className="w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-900 p-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-red-500/20 bg-neutral-950">

                    <svg
                        className="size-7 text-red-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                        />
                    </svg>
                </div>

                <h2 className="mt-6 text-2xl font-semibold text-white">
                    Something went wrong
                </h2>

                <p className="mt-3 text-sm leading-7 text-neutral-400">
                    Please try again.
                </p>

                <div className="mt-8 flex flex-col gap-3">
                    <button
                        onClick={() => {
                            window.location.reload()
                        }}
                        className="h-11 rounded-xl cursor-pointer bg-white text-black text-sm font-medium transition-colors duration-200 hover:bg-white/80"
                    >
                        Try again
                    </button>

                    <Link
                        href="/"
                        className="flex h-11 items-center cursor-pointer justify-center rounded-xl border border-neutral-800 bg-neutral-950 text-sm font-medium text-white transition-colors duration-200 hover:bg-neutral-800"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        </section>
    )
}