import { TRPCError, DOCUMENT_CONFLICT_MESSAGE } from "../support";

export default function createDocumentConflictError() {
  return new TRPCError({
    code: "CONFLICT",
    message: DOCUMENT_CONFLICT_MESSAGE,
  });
}
