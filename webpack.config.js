'use strict'
const path = require('path')

const base = {
  entry: './src/index.js',
  output: {
    filename: 'page-flip.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.svg$/,
        loader: 'svg-inline-loader'
      }
    ]
  }
}

const dev = Object.assign({}, base, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    static: './test',
  },
})

const prod = Object.assign({}, base, {
  mode: "production",
})

module.exports = env => {
  if(!env.production && env.development) return dev
  else return prod
}
