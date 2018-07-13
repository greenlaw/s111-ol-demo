//const webpack = require('webpack');
const path = require('path');
const HtmlPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'build'), // __dirname
    filename: 'main.js' // 'bundle.js'
  },
  devtool: 'source-map',
  devServer: {
    port: 3000,
    clientLogLevel: 'none',
    stats: 'errors-only'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlPlugin({
      template: 'index.html'
    })
  ]
};
