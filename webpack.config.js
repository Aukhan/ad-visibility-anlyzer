const path = require('path');

module.exports = {
  entry: [
    __dirname + "/public/index.html",
    './src/index.js'
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'script.js'
  },
  devServer: {
    compress: true,
    port: 9000
  },
  module: {
    rules: [
      {
        test: /\.html/,
        loader: 'file-loader?name=[name].[ext]',
      },
      {
      test: /\.m?js$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env']
        }
      }
    }
    ]
  }
};
