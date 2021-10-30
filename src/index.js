'use strict'

import * as pageFlip from './page-flip.js'

/*    understand/
 * main entry point into our program
 */
function main() {
  pageFlip.init('app', [
    '/1.png',
    '/2.png',
    '/3.png',
    '/4.png',
    '/5.png',
  ])
}

main()
