'use strict'

import * as flipbook from '../src'

import * as book from './book-imgs.js'

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
