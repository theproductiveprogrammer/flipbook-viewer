'use strict'
/*    understand/
 * pdfjs needs a worker script to be set up.
 * While being served from webpack-dev-server this can
 * be served directly from '/pdf.worker.js' but when
 * we move to a production environment we will need
 * to adjust this parameter (TODO)
 */

const pdfjsLib = require("pdfjs-dist")

function getPdfjs() {
  return pdfjsLib
}

function init(pfx) {
  pfx = pfx || ""
  pdfjsLib.GlobalWorkerOptions.workerSrc = `${pfx}/pdf.worker.js`
}

module.exports = {
  init,
  getPdfjs,
}

