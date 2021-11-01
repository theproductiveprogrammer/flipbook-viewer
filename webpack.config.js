'use strict'
const path = require('path')

const base = {
  entry: {
    test: './test/index.js',
    'page-flip': './src/page-flip.js',
    'pdf.worker': 'pdfjs-dist/build/pdf.worker.entry',
  },
  output: {
    filename: '[name].js',
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
    allowedHosts: 'testing-page-flip.com',
  },
})

const prod = Object.assign({}, base, {
  mode: "production",
})

module.exports = env => {
  if(!env.production && env.development) return dev
  else return prod
}
