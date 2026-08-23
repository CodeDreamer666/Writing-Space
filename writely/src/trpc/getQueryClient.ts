import type { QueryClient } from "@tanstack/react-query";
import createQueryClient from "./query-client";

let clientQueryClientSingleton: QueryClient | undefined;

export default function getQueryClient() {
  if (typeof window === "undefined") return createQueryClient();
  clientQueryClientSingleton ??= createQueryClient();
  return clientQueryClientSingleton;
}
