import useTimeAgo from "../hooks/useTimeago";
import Link from "next/link";

export default function DocItem({
    id,
    title,
    createdAt
}: {
    id: string,
    title: string,
    createdAt: Date
}) {
    const timeAgo = useTimeAgo(createdAt)

    return (
        <Link
            href={`/${id}`}
            className="flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-3 text-left transition-colors hover:bg-[#12161C]"
        >

            <span className="font-medium">
                {title}
            </span>

            <span className="text-sm text-[#8E96A3]">
                {timeAgo}
            </span>
        </Link>
    )
}