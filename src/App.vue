<template>
  <div>
    <h3 class="title">JSON国际化小工具</h3>
    <div class="app">
      <div class="left">
        <p>中文</p>
        <textarea v-model="info"></textarea>
        <div class="eg">
          <p>示例:</p>
          <p>{</p>
          <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"device": {</p>
          <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"device": "激活设备",</p>
          <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"confirm": "密码确认",</p>
          <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"active":"激活" }</p>
          <p>}</p>
        </div>
      </div>
      <div class="option">
        <select class="langs" v-model="languages">
          <option
            v-for="item in langs"
            :key="item.value"
            :value="item.value"
            :label="item.label"
          />
        </select>
        <button @click="handle">翻译</button>
        <button @click="cleanInfo">清空</button>
        <button @click="copy">复制</button>
      </div>
      <div class="right">
        <p>{{ currentLang() }}</p>
        <textarea v-model="result"></textarea>
        <div class="eg">
          <p>结果:</p>
          <p>{</p>
          <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"device": {</p>
          <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"device": "Activate the device",</p>
          <p>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"confirm": "Password confirmation",
          </p>
          <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"active":"Activate" }</p>
          <p>}</p>
        </div>
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
      languages: "en",
      langs: [
        { label: "英语", value: "en" },
        { label: "日语", value: "jp" },
        { label: "法语", value: "fra" },
        { label: "韩语", value: "kor" },
      ],
    };
  },
  methods: {
    currentLang() {
      for (let i = 0; i < this.langs.length; i++) {
        if (this.langs[i].value == this.languages) {
          return this.langs[i].label;
        }
      }
    },
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
          this.str = this.str + v + " \n";
        }
      }
      return res;
    },
    // 重新给对象赋翻译后的值
    transform(obj, res = {}) {
      for (let [k, v] of Object.entries(obj)) {
        if (typeof v === "object") {
          res[k] = {};
          this.transform(v, res[k]);
        } else {
          res[k] = this.transResult[this.index]?.dst?.trim();
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
    isObj(str) {
      try {
        let obj = {};
        eval("obj =" + str);
        if (obj && typeof obj === "object") {
          return true;
        } else {
          return false;
        }
      } catch (e) {
        console.log("e =", e);
      }
    },
    isJSON(str) {
      try {
        const object = JSON.parse(str);
        if (object && typeof object === "object") {
          return true;
        } else {
          return false;
        }
      } catch (e) {
        console.log("e =", e);
      }
    },
    async send(isObj) {
      let jsonObj = {};
      if (isObj) {
        eval("jsonObj =" + this.info);
      } else {
        jsonObj = JSON.parse(this.info);
      }
      this.str = "";
      this.index = 0;
      this.flat(jsonObj);
      // 要翻译的字符串
      let query = this.str.substr(0, this.str.length);
      let allResult = [];
      const pice = 1000; //分片长度
      // 超过长度进行分片处理
      if (query.length > pice) {
        let maxPice = Math.ceil(query.length / pice);
        let start = 0;
        for (let i = 1; i <= maxPice; i++) {
          let end = pice * i;
          while (query[end] != "]" && query[end - 1] != "]") {
            end--;
          }
          allResult = allResult.concat( (await this.sendApi(query.slice(start, end))));
          start = end;
        }
        this.restore(allResult, jsonObj, isObj);
      } else {
        allResult = await this.sendApi(query);
        this.restore(allResult, jsonObj, isObj);
      }
    },
    // 还原成英文
    restore(transResultArr, jsonObj, isObj) {
      this.transResult = transResultArr
      setTimeout(() => {
        let result = this.transform(jsonObj);
        if (isObj) {
          this.result = JSON.stringify(result, null, "\t");
        } else {
          this.result = JSON.stringify(result, null, "\t");
        }
      }, 0);
    },
    // 调api
    sendApi(query) {
      let appid = "20220530001234142"; //自己申请
      let key = "tunwKhOriVfTiSaAtH9n"; //自己申请
      let salt = new Date().getTime();
      let str1 = appid + query + salt + key;
      let params = {
        q: query,
        appid: appid,
        salt: salt,
        from: "zh",
        to: this.languages,
        sign: md5(str1),
      };
      return transtoEn(params).then((res) => {
        return res.trans_result;
      });
    },
    handle() {
      if (this.info.length == 0) {
        return;
      }
      if (this.isJSON(this.info)) {
        this.send(false);
      } else if (this.isObj(this.info)) {
        this.send(true);
      } else {
        alert("请输入正确的JSON格式或者对象内容!");
      }
    },
    // objToString(obj) {
    //   var tabjson = [];
    //   for (var p in obj) {
    //     if (Object.prototype.hasOwnProperty.call(obj,p)) {
    //       tabjson.push(  p + ":" + "'" +obj[p] + "'");
    //     }
    //   }
    //   tabjson.push();
    //   return "{" + tabjson.join(",") + "}";
    // },
  },
};
</script>

<style>
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
button:active {
  background-color: #125af7;
}
.eg {
  margin-top: 10px;
  text-align: left;
}
.langs{
  width: 100px;
  margin: 20px;
}
</style>
