'use strict'
import { init as pdfjsInit, getPdfjs } from './pdfjs-init.js'
import { h } from '@tpp/htm-x'

export function init(pdflink, cb) {
  pdfjsInit()
  const pdfjs = getPdfjs()

  const cache = []

  pdfjs.getDocument(pdflink).promise
    .then(pdf => {
      warm_cache_1(pdf, 1)
      cb(null, {
        pdf,
        numPages: () => pdf.numPages,
        getPage: (n, cb) => get_page_1(pdf, n, cb)
      })
    })
    .catch(err => cb(err || "pdf parsing failed"))

  function warm_cache_1(pdf, n) {
    if(n <= pdf.numPages) get_page_1(pdf, n, () => warm_cache_1(pdf, n+1))
  }

  function get_page_1(pdf, n, cb) {
    if(!n || n > pdf.numPages) return cb()
    if(cache[n]) return cb(null, cache[n])

    pdf.getPage(n)
      .then(page => {
        const scale = 1.2;
        const viewport = page.getViewport({scale})
        // Support HiDPI-screens.
        const outputScale = window.devicePixelRatio || 1;

        const canvas = h("canvas")
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = Math.floor(viewport.width) + "px";
        canvas.style.height =  Math.floor(viewport.height) + "px";

        const transform = outputScale !== 1
          ? [outputScale, 0, 0, outputScale, 0, 0]
          : null;

        const context = canvas.getContext("2d")
        const renderContext = {
          canvasContext: context,
          transform,
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
