import createRouter from "~/server/trpc/createRouter";
import deleteAccount from "~/server/procedures/account/deleteAccount";

export default createRouter({
  deleteAccount,
});
