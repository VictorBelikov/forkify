const path = require('path'); // получаем доступ к абсолютному пути
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: ['babel-polyfill', './src/js/index.js'], // точка входа webpack; ./ - current folder
  output: {
    path: path.resolve(__dirname, 'dist'), // __dirname - абсолютный путь до папки проекта.
    filename: 'js/bundle.js' // в какой файл собирать
  },
  devServer: {
    contentBase: './dist'
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html', // куда копировать
      template: './src/index.html' // откуда копировать
    })
  ],
  // babel settings
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/, // искл. все файлы из папки node_modules
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  }
};

/*
webpack-cli --> webpack command line interface
*/
