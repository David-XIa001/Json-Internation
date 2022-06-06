<template>
  <div>
    <h3 class="title">JSON国际化小工具</h3>
    <div class="app">
      <div class="left">
        <p>中文</p>
        <textarea v-model="info"></textarea>
      </div>
      <div class="option">
        <button @click="handle">中翻英</button>
        <button @click="cleanInfo">清空</button>
        <button @click="copy">复制英文</button>
      </div>

      <div class="right">
        <p>英文</p>
        <textarea v-model="result"></textarea>
      </div>
    </div>
  </div>
</template>

<script>
import { transtoEn } from "./service/index";
const md5 = require("js-md5");

export default {
  name: "App",
  data() {
    return {
      info: "",
      result: "",
      str: "",
      transResult: [],
      index: 0,
    };
  },
  methods: {
    // 对象拍平获取每一个要翻译的值
    flat(obj, key = "", res = {}, isArray = false) {
      for (let [k, v] of Object.entries(obj)) {
        if (Array.isArray(v)) {
          let tmp = isArray ? key + "[" + k + "]" : key + k;
          this.flat(v, tmp, res, true);
        } else if (typeof v === "object") {
          let tmp = isArray ? key + "[" + k + "]." : key + k + ".";
          this.flat(v, tmp, res);
        } else {
          let tmp = isArray ? key + "[" + k + "]" : key + k;
          res[tmp] = v;
          this.str = this.str + v + ";;";
        }
      }
      return res;
    },
    // 重新给对象赋翻译后的值
    flat1(obj, res = {}) {
      for (let [k, v] of Object.entries(obj)) {
        if (typeof v === "object") {
          res[k] = {};
          this.flat1(v, res[k]);
        } else {
          res[k] = this.transResult[this.index].trim();
          this.index++;
        }
      }
      return res;
    },
    cleanInfo() {
      this.info = "";
      this.result = "";
    },
    copy() {
      var tag = document.createElement("input");
      tag.setAttribute("id", "cp_hgz_input");
      tag.value = this.result;
      document.getElementsByTagName("body")[0].appendChild(tag);
      document.getElementById("cp_hgz_input").select();
      //前面所有的操作都是为了调用这个方法
      document.execCommand("copy");
      document.getElementById("cp_hgz_input").remove();
    },
    isJSON(str) {
      try {
        const object = JSON.parse(str);
        if (object && typeof object === "object") {
          console.log(object);
          return true;
        } else {
          return false;
        }
      } catch (e) {
        console.log("e =", e);
      }
    },
    handle() {
      if (this.info.length == 0) {
        return;
      }
      if (this.isJSON(this.info)) {
        let jsonObj = JSON.parse(this.info);
        this.flat(jsonObj);
        let appid = "20220530001234142"; //自己申请
        let key = "tunwKhOriVfTiSaAtH9n"; //自己申请
        let salt = new Date().getTime();
        let query = this.str.substr(0, this.str.length - 2);
        let str1 = appid + query + salt + key;
        let params = {
          q: query,
          appid: appid,
          salt: salt,
          from: "zh",
          to: "en",
          sign: md5(str1),
        };
        transtoEn(params).then((res) => {
          let transResultStr = res.trans_result[0].dst;
          this.transResult = transResultStr.split(";;");
          let result = this.flat1(jsonObj);
          this.result = JSON.stringify(result, null, "\t");
        });
      }else{
        alert("请输入正确的JSON格式内容!")
      }
    },
  },
};
</script>

<style>
html,
body,
div,
span,
applet,
object,
iframe,
h1,
h2,
h3,
h4,
h5,
h6,
p,
blockquote,
pre,
a,
abbr,
acronym,
address,
big,
cite,
code,
del,
dfn,
em,
img,
ins,
kbd,
q,
s,
samp,
small,
strike,
strong,
sub,
sup,
tt,
var,
b,
u,
i,
center,
dl,
dt,
dd,
ol,
ul,
li,
fieldset,
form,
label,
legend,
table,
caption,
tbody,
tfoot,
thead,
tr,
th,
td,
article,
aside,
canvas,
details,
embed,
figure,
figcaption,
footer,
header,
hgroup,
menu,
nav,
output,
ruby,
section,
summary,
time,
mark,
audio,
video {
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 100%;
  font: inherit;
  vertical-align: baseline;
}
/* HTML5 display-role reset for older browsers */
article,
aside,
details,
figcaption,
figure,
footer,
header,
hgroup,
menu,
nav,
section {
  display: block;
}
body {
  line-height: 1;
}
ol,
ul {
  list-style: none;
}
blockquote,
q {
  quotes: none;
}
blockquote:before,
blockquote:after,
q:before,
q:after {
  content: "";
  content: none;
}
table {
  border-collapse: collapse;
  border-spacing: 0;
}
.title {
  position: absolute;
  top: 20px;
  left: 20px;
}
.app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width: 100vw;
  height: 100vh;
  max-height: 100vh;
  border: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}
.left,
.right {
  width: 40%;
}
.left textarea {
  display: inline-block;
  width: 100%;
  height: 600px;
  vertical-align: middle;
}
.right textarea {
  display: inline-block;
  width: 100%;
  height: 600px;
  vertical-align: middle;
}
.option {
  display: flex;
  flex-direction: column;
}
button {
  cursor: pointer;
  font-size: 14px;
  color: #ffffff;
  line-height: 20px;
  padding: 5px 20px;
  font-size: 14px;
  border-radius: 2px;
  outline: none;
  border: none;
  text-align: center;
  width: 100px;
  height: 30px;
  background: #128bf7;
  margin: 20px;
}
button:active{
  background-color: #125af7;
}
</style>
