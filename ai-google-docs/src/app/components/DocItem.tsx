"use client"
import { useState } from "react";
import { api } from "~/trpc/react";
import Link from "next/link";

export default function DocItem({
    id,
    title,
}: {
    id: string,
    title: string,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const utils = api.useUtils();

    const deleteDoc = api.docs.deleteDoc.useMutation({
        onMutate: async (newData) => {
            await utils.docs.getUserDocs.cancel();

            const previousInfo = utils.docs.getUserDocs.getData();

            utils.docs.getUserDocs.setData(undefined, (old) => {
                if (!old) return old;

                return old.filter(doc => doc.id !== newData.docId)
            });

            return { previousInfo };
        },

        onSettled: async () => {
            await utils.invalidate();
        }
    })

    return (
        <>
            <Link
                href={`/${id}`}
                className="flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-3 text-left transition-colors hover:bg-[#12161C]"
            >

                <span className="font-medium">
                    {title}
                </span>

                <button
                    onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setIsOpen(true)
                    }}
                    className={`
                 cursor-pointer
                 flex
                 h-8
                 w-8
                 items-center
                 justify-center
                 rounded-lg
               text-[#69707C]
                 transition-colors
                hover:bg-[#1A1F26]
                hover:text-[#F5F5F7]
              `}
                >
                    &hellip;
                </button>
            </Link>

            {isOpen && (
                <div
                    className="
                    z-50
                    absolute
                    right-4
                    w-40
                    overflow-hidden
                    rounded-2xl
                    border
                    border-[#252B36]
                    bg-[#12161C]
                    shadow-2xl
                    "
                >
                    <button
                        className="   
                        cursor-pointer
                        flex
                        gap-2
                        w-full
                        items-center
                        px-4
                        py-3
                        text-sm
                        transition-colors
                        hover:bg-[#1A1F26]
                        "
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                            />
                        </svg>
                        <span>Rename</span>
                    </button>

                    <div className="h-px bg-[#252B36]" />

                    <button
                        onClick={() => deleteDoc.mutate({ docId: id })}
                        className=" 
                        cursor-pointer
                        flex
                        gap-2
                        w-full
                        items-center
                        px-4
                        py-3
                        text-sm
                        transition-colors
                        hover:bg-[#1A1F26]
                        "
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none" viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                            />
                        </svg>
                        <span>Delete</span>
                    </button>
                </div>
            )}

            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    className="fixed inset-0 opacity-0"
                />
            )}
        </>
    )
}