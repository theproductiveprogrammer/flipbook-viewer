'use strict'

/*    way/
 * return pages from the images, caching them once loaded
 */
export function init(pages, cb) {
  const cache = []

  cb(null, {
    numPages: () => pages.length,
    getPage,
  })


  function getPage(n, cb) {
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
