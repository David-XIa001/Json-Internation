import AjaxRequest from "@/utility/AjaxRequest";
const Qs = require("qs");
export function transtoEn(params) {
  return AjaxRequest({
    url: "/api/trans/vip/translate?" + Qs.stringify(params),
    method: "get",
    headers: { "Content-type": "application/x-www-form-urlencoded" },
  });
}
