var resolve = require("path").resolve;
var CopyWebpackPlugin = require('copy-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: "./src/js/app.js",
  output: {
    path: resolve("./dist"),
    filename: "app.js",
    chunkFilename: "[hash].js",
    publicPath: "dist/"
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        loader: "babel-loader",
      },
      {
        test: /\.(sass|scss)$/,
        loader: ExtractTextPlugin.extract(['css-loader', 'sass-loader'])
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: 'src/index.html', to: 'index.html' },
      { from: 'src/img/', to: 'img/' },
    ]),
    new ExtractTextPlugin('main.css'),
  ],
  devtool: "#source-map"
}
