import { Extension } from "@tiptap/core";
import { Plugin } from "@tiptap/pm/state";
import { countUnsupportedPictographs } from "~/lib/writingLanguage";

type Options = {
  limit: number;
  onLimitExceeded: () => void;
  onUnsupportedPictograph: () => void;
};

export const DocumentCharacterLimit = Extension.create<Options>({
  name: "documentCharacterLimit",

  addOptions() {
    return {
      limit: 50_000,
      onLimitExceeded: () => undefined,
      onUnsupportedPictograph: () => undefined,
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        filterTransaction: (transaction, state) => {
          if (!transaction.docChanged) {
            return true;
          }

          const currentLength = state.doc.textContent.length;
          const nextLength = transaction.doc.textContent.length;
          const isHydratingSavedContent =
            transaction.getMeta("preventUpdate") === true;
          const currentPictographCount = countUnsupportedPictographs(
            state.doc.textContent,
          );
          const nextPictographCount = countUnsupportedPictographs(
            transaction.doc.textContent,
          );
          const isWithinLimit =
            nextLength <= this.options.limit || nextLength <= currentLength;

          if (isHydratingSavedContent) {
            return true;
          }

          if (nextPictographCount > currentPictographCount) {
            this.options.onUnsupportedPictograph();
            return false;
          }

          if (isWithinLimit) {
            return true;
          }

          this.options.onLimitExceeded();
          return false;
        },
      }),
    ];
  },
});
