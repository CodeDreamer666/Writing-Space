import { TRPCError, DOCUMENT_NOT_FOUND_MESSAGE } from "../support";

export default function createDocumentNotFoundError() {
  return new TRPCError({
    code: "NOT_FOUND",
    message: DOCUMENT_NOT_FOUND_MESSAGE,
  });
}
