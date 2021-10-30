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
        ctx.toolbar.e,
      )

      ctx.zoom = 0
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
  const layout = {
    top: (box.height - height) / 2,
    left: (box.width - width) / 2,
    mid: box.width / 2,
    width: width,
    height,
  }
  cb(layout)
}

function setupToolbar(ctx, cb) {
  const toolbar = h(".toolbar", "tool bar")
  const style = {
    cursor: "pointer",
    "user-select": "none",
  }
  const nxt = h("span", {
    onclick: () => {
      ctx.showNdx++
      showPages(ctx)
    },
    style
  }, ">")
  const prv = h("span", {
    onclick: () => {
      ctx.showNdx--
      showPages(ctx)
    },
    style
  }, "<")
  const zoom = h("span", {
    onclick: () => {
      ctx.zoom++
      showPages(ctx)
    },
    style
  }, "+")
  toolbar.c(
    prv, nxt, zoom
  )

  ctx.toolbar = {
    e: toolbar
  }

  cb()
}


function showPages(ctx) {
  const canvas = ctx.canvas
  const pages = ctx.pages
  const left = ctx.showNdx * 2
  const right = left + 1
  canvas.ctx.save()
  show_bg_1()
  pages(left, (err, left) => {
    if(err) return console.error(err)
    pages(right, (err, right) => {
      if(err) return console.error(err)

      let layout = ctx.layout

      if(!ctx.zoom) show_bx_1()
      else {
        layout = Object.assign({}, layout)
        const zoom = 1 + (ctx.zoom * 0.2)
        const width = layout.width * zoom
        const height = layout.height * zoom
        const left = layout.left - (width - layout.width) / 2
        const top = layout.top - (height - layout.height) / 2
        layout.width = width
        layout.height = height
        layout.left = left
        layout.top = top
      }
      const page_l = Object.assign({}, layout)
      const page_r = Object.assign({}, layout)
      page_l.width /= 2
      page_r.width /= 2
      page_r.left = layout.mid
      if(left) show_pg_1(left, page_l)
      if(right) show_pg_1(right, page_r)

      canvas.ctx.restore()
    })
  })

  function show_pg_1(pg, loc) {
    canvas.ctx.drawImage(pg.img, loc.left, loc.top, loc.width, loc.height)
  }

  function show_bx_1() {
    const loc = ctx.layout
    canvas.ctx.fillStyle = "#666"
    const border = 4
    canvas.ctx.fillRect(loc.left - border, loc.top-border, loc.width+border*2, loc.height+2*border)
  }

  function show_bg_1() {
    canvas.ctx.fillStyle = "#aaa"
    canvas.ctx.fillRect(0, 0, canvas.box.width, canvas.box.height)
  }
}
