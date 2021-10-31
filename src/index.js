'use strict'

import * as pageFlip from './page-flip.js'

/*    understand/
 * main entry point into our program
 */
function main() {
  pageFlip.init('app', pageFn(), viewer => window.viewer = viewer)
}

function pageFn() {
  const pages = [
    '/0.png',
    '/1.png',
    '/2.png',
    '/3.png',
    '/4.png',
    '/5.png',
    '/6.png',
    '/7.png',
  ]

  const imgs = []

  return {
    numPages: () => pages.length,
    get,
  }


  function get(n, cb) {
    if(!n || n > pages.length) return cb()
    if(imgs[n]) return cb(null, imgs[n])

    const img = new Image()
    img.src = pages[n-1]
    img.addEventListener("load", () => {
      imgs[n] = {
        img,
        num: n,
        width: img.width,
        height: img.height,
      }
      cb(null, imgs[n])
    }, false)
  }
}

main()
