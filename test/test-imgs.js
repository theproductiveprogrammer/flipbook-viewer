'use strict'

/* for development/hotloading */
//import * as flipbook from '../src'

import * as flipbook from '../dist/flipbook-viewer.js'

import * as book from './book-imgs.js'

/*    understand/
 * main entry point into our program
 */
function main() {
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

  const next = document.getElementById('next')
  const prev = document.getElementById('prev')
  const zoom = document.getElementById('zoom')

  book.init(pages, (err, book) => {
    if(err) console.error(err)
    else flipbook.init(book, 'app', (err, viewer) => {
      if(err) console.error(err)

      viewer.on('seen', n => console.log('page number: ' + n))

      next.onclick = () => viewer.flip_forward();
      prev.onclick = () => viewer.flip_back();
      zoom.onclick = () => viewer.zoom();

    })
  })

}

main()
