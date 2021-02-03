const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = {
  mode: "development",
  // 入口js路径
  entry: {
    index: "./src/js/index.js",
    inference: "./src/js/inference.js"
  },
  // 动态监测并实时更新页面
  devServer: {
    publicPath: "/",
    // proxy: {
    //   "/api": {
    //     target: "http://127.0.0.1:32767",
    //     secure: false,
    //     changeOrigin: true,
    //   },
    // },
    contentBase: "./dist",
    compress: true,
    // 默认8080，可不写
    port: 8080,
    // 热更新，无需刷新
    hot: true
  },
  // 方便追踪源代码错误
  // devtool: "source-map",
  plugins: [
    // 自动清空dist目录
    new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
    // 设置html模板生成路径
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "./src/index.html",
      chunks: ["index"],
      title: "Development"
    })
  ],
  // 编译输出配置
  output: {
    // js生成到dist/js，[name]表示保留原js文件名
    filename: "js/[name].js",
    // 输出路径为dist
    path: path.resolve(__dirname, "dist")
  },
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        loader: "file-loader",
        options: {
          name: "[name].[ext]?[hash]",
          outputPath: "image/"
        }
      }
    ]
  }
};
