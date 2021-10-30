'use strict'

import * as pageFlip from './page-flip.js'

/*    understand/
 * main entry point into our program
 */
function main() {
  pageFlip.init('app', pageFn())
}

function pageFn() {
  const pages = [
    '/1.png',
    '/2.png',
    '/3.png',
    '/4.png',
    '/5.png',
  ]

  return (n, cb) => {
    const img = new Image()
    img.src = pages[n]
    img.addEventListener("load", () => {
      cb(null, {
        img,
        num: n,
        width: img.width,
        height: img.height,
      })
    }, false)
  }
}

main()
