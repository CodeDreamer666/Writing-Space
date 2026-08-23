import auth from "./config";
import { headers } from "next/headers";
import { cache } from "react";

const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);

export default getSession;
