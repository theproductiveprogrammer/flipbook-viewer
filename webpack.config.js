'use strict'
const path = require('path')

module.exports = {
  entry: './src/page-flip.js',
  output: {
    filename: 'page-flip.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },

  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    static: './test',
  },
}
