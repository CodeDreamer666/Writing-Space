"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import LoadingIcon from "~/components/shared/LoadingIcon";
import { useHandleTRPCError } from "~/lib/useHandleTRPCError";
import { api } from "~/trpc/react";

function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins <= 0) {
    return "Just now";
  }

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  }

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  if (diffDays === 1) {
    return "Yesterday";
  }

  if (diffDays < 7) {
    return then.toLocaleDateString("en-US", { weekday: "long" });
  }

  return then.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: then.getFullYear() === now.getFullYear() ? undefined : "numeric",
  });
}

type DocItemProps = {
  id: string;
  title: string;
  updatedAt: Date | string;
  isDeleting: boolean;
  onDelete: (docId: string) => void;
};

export default function DocItem({
  id,
  title,
  updatedAt,
  isDeleting,
  onDelete,
}: DocItemProps) {
  const router = useRouter();
  const utils = api.useUtils();
  const handleTRPCError = useHandleTRPCError();
  const deleteDialogRef = useRef<HTMLElement>(null);
  const optionsButtonRef = useRef<HTMLButtonElement>(null);
  const renameDialogRef = useRef<HTMLElement>(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [renameInput, setRenameInput] = useState(title);

  const renameDocTitle = api.docs.renameDocTitle.useMutation({
    onMutate: async (input) => {
      await utils.docs.getUserDocs.cancel();
      const previousDocuments = utils.docs.getUserDocs.getData();

      utils.docs.getUserDocs.setData(undefined, (currentDocuments) =>
        currentDocuments?.map((document) =>
          document.id === input.docId
            ? { ...document, title: input.title }
            : document,
        ),
      );

      return { previousDocuments };
    },
    onSuccess: () => {
      setIsRenameDialogOpen(false);
    },
    onError: (error, _input, context) => {
      utils.docs.getUserDocs.setData(undefined, context?.previousDocuments);
      handleTRPCError({ error, router });
    },
    onSettled: async () => {
      await utils.docs.getUserDocs.invalidate();
    },
  });

  useEffect(() => {
    if (!isDropdownOpen) {
      return;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
        optionsButtonRef.current?.focus();
      }
    };

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isDropdownOpen]);

  const closeDialog = useCallback(
    (dialog: "rename" | "delete") => {
      if (dialog === "rename") {
        setIsRenameDialogOpen(false);
        setRenameInput(title);
      } else {
        setIsDeleteDialogOpen(false);
      }

      queueMicrotask(() => optionsButtonRef.current?.focus());
    },
    [title],
  );

  useEffect(() => {
    const dialog = isRenameDialogOpen
      ? renameDialogRef.current
      : isDeleteDialogOpen
        ? deleteDialogRef.current
        : null;

    if (!dialog) {
      return;
    }

    const handleDialogKeys = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !renameDocTitle.isPending && !isDeleting) {
        event.preventDefault();
        closeDialog(isRenameDialogOpen ? "rename" : "delete");
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
        ),
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);

      if (!firstElement || !lastElement) {
        return;
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    dialog.addEventListener("keydown", handleDialogKeys);

    return () => {
      dialog.removeEventListener("keydown", handleDialogKeys);
    };
  }, [
    isDeleteDialogOpen,
    isDeleting,
    isRenameDialogOpen,
    closeDialog,
    renameDocTitle.isPending,
  ]);

  const handleRename = () => {
    const nextTitle = renameInput.trim();

    if (!nextTitle || renameDocTitle.isPending) {
      return;
    }

    renameDocTitle.mutate({
      docId: id,
      title: nextTitle,
    });
  };

  return (
    <>
      <li className="relative">
        <div className="group flex items-center rounded-xl transition-colors focus-within:bg-[#161B22] hover:bg-[#161B22]">
          <Link
            href={`/${id}`}
            className="flex min-w-0 flex-1 items-center gap-3.5 rounded-xl px-3 py-3.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8E96A3]"
          >
            <svg
              className="h-9 w-8 shrink-0"
              viewBox="0 0 32 38"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <rect x="0" y="0" width="32" height="38" rx="4" fill="#262C36" />
              <path d="M22 0 L32 10 L22 10 Z" fill="#343C49" />
              <line
                x1="7"
                y1="17"
                x2="25"
                y2="17"
                stroke="#4A5363"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <line
                x1="7"
                y1="22"
                x2="25"
                y2="22"
                stroke="#4A5363"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <line
                x1="7"
                y1="27"
                x2="19"
                y2="27"
                stroke="#4A5363"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[#E5E7EA]">
                {title}
              </p>
              <p className="mt-1 text-xs text-[#6B7280]">
                {formatRelativeTime(updatedAt)}
              </p>
            </div>
          </Link>

          <button
            ref={optionsButtonRef}
            type="button"
            onClick={() => setIsDropdownOpen((isOpen) => !isOpen)}
            className="mr-2 flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[#8E96A3] opacity-100 transition-all hover:bg-[#262C36] hover:text-[#F5F5F7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8E96A3] sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
            aria-label={`Options for ${title}`}
            aria-haspopup="menu"
            aria-expanded={isDropdownOpen}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
        </div>

        {isDropdownOpen && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 cursor-default"
              onClick={() => setIsDropdownOpen(false)}
              aria-label="Close draft options"
            />
            <div
              role="menu"
              className="absolute top-full right-2 z-50 mt-1 w-40 overflow-hidden rounded-xl border border-[#262C36] bg-[#12161C] shadow-2xl"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsDropdownOpen(false);
                  setRenameInput(title);
                  setIsRenameDialogOpen(true);
                }}
                className="flex min-h-11 w-full cursor-pointer items-center px-3.5 text-sm text-[#C8CBD0] transition-colors hover:bg-[#1E2530] hover:text-[#F5F5F7] focus-visible:bg-[#1E2530] focus-visible:outline-none"
              >
                Rename
              </button>
              <div className="h-px bg-[#262C36]" />
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsDropdownOpen(false);
                  setIsDeleteDialogOpen(true);
                }}
                className="flex min-h-11 w-full cursor-pointer items-center px-3.5 text-sm text-[#FF8A7D] transition-colors hover:bg-[#1E2530] focus-visible:bg-[#1E2530] focus-visible:outline-none"
              >
                Delete
              </button>
            </div>
          </>
        )}
      </li>

      {isRenameDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              closeDialog("rename");
            }
          }}
        >
          <section
            ref={renameDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`rename-title-${id}`}
            className="w-full max-w-sm rounded-2xl border border-[#262C36] bg-[#12161C] p-6 sm:p-7"
          >
            <h2
              id={`rename-title-${id}`}
              className="mb-4 text-base font-medium text-[#F5F5F7]"
            >
              Rename draft
            </h2>
            <label htmlFor={`rename-input-${id}`} className="sr-only">
              Draft title
            </label>
            <input
              id={`rename-input-${id}`}
              autoFocus
              value={renameInput}
              maxLength={200}
              onChange={(event) => setRenameInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleRename();
                }
              }}
              placeholder="Untitled draft"
              className="min-h-11 w-full rounded-xl border border-[#2E3643] bg-[#0B0D10] px-4 text-sm text-[#F5F5F7] transition-colors outline-none placeholder:text-[#6B7280] focus:border-[#697386]"
            />
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                disabled={renameDocTitle.isPending}
                onClick={() => closeDialog("rename")}
                className="min-h-11 w-full cursor-pointer rounded-xl text-sm text-[#AEB4BE] transition-colors hover:bg-[#1E2530] hover:text-[#F5F5F7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8E96A3] disabled:cursor-wait disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!renameInput.trim() || renameDocTitle.isPending}
                onClick={handleRename}
                className="flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#F5F5F7] text-sm font-medium text-[#0B0D10] transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5F5F7] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {renameDocTitle.isPending && <LoadingIcon />}
                <span>{renameDocTitle.isPending ? "Renaming" : "Rename"}</span>
              </button>
            </div>
          </section>
        </div>
      )}

      {isDeleteDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          onKeyDown={(event) => {
            if (event.key === "Escape" && !isDeleting) {
              closeDialog("delete");
            }
          }}
        >
          <section
            ref={deleteDialogRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={`delete-title-${id}`}
            aria-describedby={`delete-description-${id}`}
            className="w-full max-w-sm rounded-2xl border border-[#4B2E2A] bg-[#12161C] p-6 sm:p-7"
          >
            <h2
              id={`delete-title-${id}`}
              className="text-base font-medium text-[#F5F5F7]"
            >
              Delete “{title}”?
            </h2>
            <p
              id={`delete-description-${id}`}
              className="mt-2 text-sm leading-6 text-[#8E96A3]"
            >
              This action cannot be undone.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                autoFocus
                disabled={isDeleting}
                onClick={() => closeDialog("delete")}
                className="min-h-11 w-full cursor-pointer rounded-xl text-sm text-[#AEB4BE] transition-colors hover:bg-[#1E2530] hover:text-[#F5F5F7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8E96A3] disabled:cursor-wait disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => onDelete(id)}
                className="flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#D85E50] text-sm font-medium text-white transition-colors hover:bg-[#EA6C5E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF8A7D] disabled:cursor-wait disabled:opacity-60"
              >
                {isDeleting && <LoadingIcon />}
                <span>{isDeleting ? "Deleting" : "Delete"}</span>
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
