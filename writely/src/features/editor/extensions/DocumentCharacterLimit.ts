import { Extension } from "@tiptap/core";
import { Plugin } from "@tiptap/pm/state";

type Options = {
  limit: number;
  onLimitExceeded: () => void;
};

export const DocumentCharacterLimit = Extension.create<Options>({
  name: "documentCharacterLimit",

  addOptions() {
    return {
      limit: 50_000,
      onLimitExceeded: () => undefined,
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
          const isWithinLimit =
            nextLength <= this.options.limit || nextLength <= currentLength;

          if (isHydratingSavedContent || isWithinLimit) {
            return true;
          }

          this.options.onLimitExceeded();
          return false;
        },
      }),
    ];
  },
});
