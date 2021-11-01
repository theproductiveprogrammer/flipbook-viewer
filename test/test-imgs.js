'use strict'

/* for development/hotloading */
//import * as flipbook from '../src'

import * as flipbook from '../dist/flipbook-viewer.js'

import * as book from './book-imgs.js'

/*    understand/
 * main entry point into our program
 */
function main() {
  /* see test-pdf.js for used options
  const defaultOpts = {
    backgroundColor: "#353535",
    toolbarSeparator: "#9e9e9e",
    toolbarColor: "#353535",
    toolbarSize: 24,
    boxColor: "#353535",
    boxBorder: 4,
    width: 800,
    height: 600,
  }
  */

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

  book.init(pages, (err, book) => {
    if(err) console.error(err)
    else flipbook.init(book, 'app', (err, viewer) => {
      if(err) console.error(err)
      window.flipbook = viewer
      viewer.on('seen', n => console.log('page number: ' + n))
      viewer.on('liked', liked => console.log('liked: ' + liked))
      viewer.on('shared', () => console.log('shared'))
    })
  })

}

main()
