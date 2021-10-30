'use strict'
import { h, getH } from '@tpp/htm-x'

/*    way/
 * set up the canvas and the toolbar, then show the
 * first page
 */
export function init(id, pages) {
  const e = getH(id)

  const ctx = {
    pages
  }

  setupCanvas(ctx, err => {
    if(err) return console.error(err)

    setupToolbar(ctx, err => {
      if(err) return console.error(err)

      e.c(
        ctx.canvas.e,
        toolbar.e,
      )

      ctx.showNdx = 0
      showPages(ctx)

    })
  })

}

/*    way/
 * set up a canvas element with some width
 * and height and use the first page to
 * calculate the display.
 */
function setupCanvas(ctx, cb) {
  const canvas = {
    e: h("canvas")
  }
  canvas.ctx = canvas.e.getContext('2d')
  canvas.box = {
    width: 800,
    height: 800,
  }
  canvas.e.width = canvas.box.width
  canvas.e.height = canvas.box.height

  ctx.canvas = canvas

  ctx.pages(1, (err, pg) => {
    if(err) return cb(err)
    calcLayout(canvas.box, pg, layout => {
      ctx.layout = layout
      cb()
    })
  })
}

/*    way/
 * keep a 10% margin on the closest side and
 * enough space for two pages.
 */
function calcLayout(box, pg, cb) {
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

function setupToolbar(ctx, cb) {
  const toolbar = h(".toolbar", "tool bar")
  const zoom = h("span", {
    onclick: () => {
    }
  }, "+")
  toolbar.c(
    zoom
  )

  ctx.toolbar = {
    e: toolbar
  }

  cb()
}


function showPages(ctx) {
  const canvas = ctx.canvas
  const pages = ctx.pages
  const layout = ctx.layout
  const left = ctx.showNdx * 2
  const right = left + 1
  canvas.ctx.save()
  show_bg_1()
  show_bx_1()
  pages(left, (err, left) => {
    if(err) return console.error(err)
    if(left) show_pg_1(left, layout.page_l)
    pages(right, (err, right) => {
      if(err) return console.error(err)
      if(right) show_pg_1(right, layout.page_r)
      canvas.ctx.restore()
    })
  })

  function show_pg_1(pg, loc) {
    canvas.ctx.drawImage(pg.img, loc.left, loc.top, loc.width, loc.height)
  }

  function show_bx_1() {
    const loc = layout.page_l
    canvas.ctx.fillStyle = "#666"
    const border = 4
    canvas.ctx.fillRect(loc.left - border, loc.top-border, (loc.width+border)*2, loc.height+2*border)
  }

  function show_bg_1() {
    canvas.ctx.fillStyle = "#aaa"
    canvas.ctx.fillRect(0, 0, canvas.box.width, canvas.box.height)
  }
}
