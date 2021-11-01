'use strict'
import { init as pdfjsInit, getPdfjs } from './pdfjs-init.js'
import { h } from '@tpp/htm-x'

export function init(cb) {
  pdfjsInit()
  const pdfjs = getPdfjs()

  const cache = []

  pdfjs.getDocument('/fp.pdf').promise
    .then(pdf => {
      warm_cache_1(pdf, 1)
      cb(null, {
        numPages: () => pdf.numPages,
        get: (n, cb) => get_page_1(pdf, n, cb)
      })
    })
    .catch(err => cb(err))

  function warm_cache_1(pdf, n) {
    if(n <= pdf.numPages) get_page_1(pdf, n, () => warm_cache_1(pdf, n+1))
  }

  function get_page_1(pdf, n, cb) {
    if(!n || n > pdf.numPages) return cb()
    if(cache[n]) return cb(null, cache[n])

    pdf.getPage(n)
      .then(page => {
        const viewport = page.getViewport({scale:1.2})
        const canvas = h("canvas")
        canvas.width = viewport.width
        canvas.height = viewport.height

        const context = canvas.getContext("2d")
        const renderContext = {
          canvasContext: context,
          viewport,
        }
        page.render(renderContext).promise
          .then(() => {
            const img = new Image()
            img.src = canvas.toDataURL()
            img.addEventListener("load", () => {
              cache[n] = {
                img,
                num: n,
                width: img.width,
                height: img.height,
              }
              cb(null, cache[n])
            }, false)
          })
          .catch(err => cb(err))
      })
      .catch(err => cb(err))

  }

}
