'use strict'

/*    way/
 * return pages from the images, caching them once loaded
 */
export function init(cb) {
  const pages = [
    '/000.png',
    '/1.png',
    '/2.png',
    '/6.png',
    '/3.png',
    '/8.png',
    '/9.png',
    '/4.png',
    '/5.png',
    '/7.png',
  ]

  const cache = []

  cb(null, {
    numPages: () => pages.length,
    get,
  })


  function get(n, cb) {
    if(!n || n > pages.length) return cb()
    if(cache[n]) return cb(null, cache[n])

    const img = new Image()
    img.src = pages[n-1]
    img.addEventListener("load", () => {
      cache[n] = {
        img,
        num: n,
        width: img.width,
        height: img.height,
      }
      cb(null, cache[n])
    }, false)
  }
}
