import createRouter from "~/server/trpc/createRouter";
import getStatus from "~/server/procedures/ai/getStatus";
import askAi from "~/server/procedures/ai/askAi";

export default createRouter({
    getStatus,
    askAi,
});
