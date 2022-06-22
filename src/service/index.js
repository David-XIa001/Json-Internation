// import AjaxRequest from "@/utility/AjaxRequest";
// const Qs = require("qs");
// export function transtoEn(params) {
//   return AjaxRequest({
//     url: "/api/trans/vip/translate?" + Qs.stringify(params),
//     method: "get",
//     headers: { "Content-type": "application/x-www-form-urlencoded" },
//   });
// }
import jsonp from "jsonp";
const Qs = require("qs");
const ajaxUrl = "https://api.fanyi.baidu.com/api/trans/vip/translate?";
export function transtoEn(params) {
  return new Promise((resolve, reject) => {
    jsonp(ajaxUrl + Qs.stringify(params), null, (err, data) => {
      if (!err) {
        resolve(data);
      } else {
        reject(err);
      }
    });
  });
}

//  {
//   "common": {
//       "laSave": "保存",
//       "standby": "待机界面自定义",
//       "standby1": "自定义",
//   }
// }
