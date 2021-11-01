'use strict'

/* for development/hotloading */
//import * as flipbook from '../src'

import * as flipbook from '../dist/flipbook-viewer.js'

import * as book from './book-pdf.js'

/*    understand/
 * main entry point into our program
 */
function main() {
  const opts = {
    backgroundColor: "#fff",
    toolbarSeparator: "white",
    toolbarColor: "#ebbaae",
    boxColor: "#f55e39",
    boxBorder: 16,
    width: 800,
    height: 600,
  }

  book.init('/fp.pdf', (err, book) => {
    if(err) console.error(err)
    else flipbook.init(book, 'app', opts, (err, viewer) => {
      if(err) console.error(err)
      window.flipbook = viewer
      viewer.on('seen', n => console.log('page number: ' + n))
      viewer.on('liked', liked => console.log('liked: ' + liked))
      viewer.on('shared', () => console.log('shared'))
    })
  })

}

main()
