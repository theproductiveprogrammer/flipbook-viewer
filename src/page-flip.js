'use strict'
import { h, getH } from '@tpp/htm-x'

/*    way/
 * set up the canvas and the toolbar, then show the
 * first page
 */
export function init(id, pages) {
  const e = getH(id)

  setupCanvas(pages, canvas => {
    setupToolbar(pages, canvas, toolbar => {

      e.c(
        canvas.e,
        toolbar.e,
      )

      showFirstPage(canvas, pages)

    })
  })

}

/*    way/
 * set up a canvas element with some width
 * and height and use the first page to
 * calculate the display.
 */
function setupCanvas(pages, cb) {
  const canvas = h("canvas")
  const ctx = canvas.getContext('2d')
  const box = {
    width: 800,
    height: 800,
  }
  canvas.width = box.width
  canvas.height = box.height

  pages(0, (err, pg) => {
    if(err) return console.error(err)
    calcDisplay(box, pg, display => {
      cb({
        box,
        e: canvas,
        ctx,
        display,
      })
    })
  })
}

/*    way/
 * keep a 10% margin on the closest side and
 * enough space for two pages.
 */
function calcDisplay(box, pg, cb) {
  let height = box.height * 0.8
  let width = (pg.width * 2) * (height / pg.height)
  const maxwidth = box.width * 0.8
  if(width > maxwidth) {
    width = maxwidth
    height = (pg.height) * (width / (pg.width * 2))
  }
  const page_l = {
    top: (box.height - height) / 2,
    left: (box.width - width) / 2,
    width: width / 2,
    height,
  }
  const page_r = {
    top: (box.height - height) / 2,
    left: box.width / 2,
    width: width / 2,
    height,
  }
  cb({ page_l, page_r })
}

function setupToolbar(pages, canvas, cb) {
  cb({
    e: h(".toolbar", "tool bar"),
  })
}


function showFirstPage(canvas, pages) {
  pages(0, (err, pg) => {
    if(err) return console.error(err)
    canvas.ctx.save()
    canvas.ctx.fillStyle = "#aaa"
    canvas.ctx.fillRect(0, 0, canvas.box.width, canvas.box.height)
    canvas.ctx.restore()
    let loc = canvas.display.page_l
    canvas.ctx.save()
    canvas.ctx.fillStyle = "#666"
    const border = 4
    canvas.ctx.fillRect(loc.left - border, loc.top-border, (loc.width+border)*2, loc.height+2*border)
    loc = canvas.display.page_r
    canvas.ctx.drawImage(pg.img, loc.left, loc.top, loc.width, loc.height)
  })
}
