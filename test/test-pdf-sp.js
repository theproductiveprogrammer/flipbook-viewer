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
    singlepage: true,
  };

  const app = document.getElementById('app');

  book.init('/fp.pdf', (err, book) => {
    if(err) console.error(err);
    else flipbook.init(book, app, opts, (err, viewer) => {
      if(err) return console.error(err);

      viewer.on('seen', n => console.log('page number: ' + n))

      window.viewbook = viewer
    })
  })

}

main()
