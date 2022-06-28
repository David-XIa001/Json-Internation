module.exports = {
  publicPath:"./",
  transpileDependencies: true,
  devServer: {
    open: true,
    proxy: {
      "/api": {
        target: "http://api.fanyi.baidu.com",
        pathRewrite: {
          "^/api": "/api",
        },
      },
    },
  },
};