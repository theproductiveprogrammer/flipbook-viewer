'use strict'

import * as flipbook from '../src'

import * as book from './book-pdf.js'

/*    understand/
 * main entry point into our program
 */
function main() {
  const opts = {
    backgroundColor: "#666",
    toolbarSeparator: "#9e9e9e",
    toolbarColor: "#333",
    boxColor: "#333",
    width: 800,
    height: 600,
  }

  book.init('/fp.pdf', (err, book) => {
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
