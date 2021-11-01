'use strict'

import * as pageFlip from '../src/page-flip.js'

import * as img from './imgpages.js'
import * as pdf from './pdfpages.js'

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

  pdf.init((err, pageProvider) => {
    if(err) console.error(err)
    else pageFlip.init(pageProvider, 'app', (err, viewer) => {
      if(err) console.error(err)
      window.pageflipviewer = viewer
      viewer.on('seen', n => console.log('page number: ' + n))
    })
  })

}

main()
