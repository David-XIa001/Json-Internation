import axios from "axios";

const request = axios.create({
  baseURL: "/", // api的base_url
  timeout: 30000, // 请求超时时间
});

// request拦截器
request.interceptors.request.use(
  (config) => {
    config.headers["Content-Type"] = "application/json; charset=UTF-8";
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

// respone拦截器
request.interceptors.response.use(
  (response) => {
    if (response.headers["content-disposition"]) {
      return response;
    }
    return response.data;
  },

  (error) => {
    const { response = {} } = error;
    const { data } = response;
    console.log("response =", response);
    console.log("error =", error);
    if (data.lock_info) {
      return Promise.reject(response);
    } else {
      return Promise.reject(error);
    }
  }
);

export default request;
