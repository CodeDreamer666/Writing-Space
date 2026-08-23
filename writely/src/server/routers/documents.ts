import createRouter from "~/server/trpc/createRouter";
import createDoc from "~/server/procedures/documents/createDoc";
import getUserDocs from "~/server/procedures/documents/getUserDocs";
import getSelectedDoc from "~/server/procedures/documents/getSelectedDoc";
import deleteDoc from "~/server/procedures/documents/deleteDoc";
import updateWritingMode from "~/server/procedures/documents/updateWritingMode";
import saveDoc from "~/server/procedures/documents/saveDoc";
import exportDoc from "~/server/procedures/documents/exportDoc";

export default createRouter({
  createDoc,
  getUserDocs,
  getSelectedDoc,
  deleteDoc,
  updateWritingMode,
  saveDoc,
  exportDoc,
});
