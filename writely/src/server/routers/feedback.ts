import createRouter from "~/server/trpc/createRouter";
import submit from "~/server/procedures/feedback/submit";

export default createRouter({
  submit,
});
