'use strict'
import { h, getH } from '@tpp/htm-x'

/*    way/
 * set up the canvas and the toolbar, then show the
 * first page
 */
export function init(id, pagefn) {
  const e = getH(id)

  const ctx = {
    pagefn
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

  ctx.pagefn.get(1, (err, pg) => {
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
    "opacity": "1",
  }
  const nxt = nxt_1()
  const prv = prv_1()
  enable_disable_1()

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

  function enable_disable_1() {
    const disabled = {
      cursor: "not-allowed",
      "user-select": "none",
      opacity: "0.5",
    }
    if(!ctx.showNdx || ctx.pagefn.numPages() <= 1) {
      prv.attr({ style: disabled })
    } else {
      prv.attr({ style })
    }
    if((ctx.showNdx * 2 + 1) >= ctx.pagefn.numPages()) {
      nxt.attr({ style: disabled })
    } else {
      nxt.attr({ style })
    }
  }

  function nxt_1() {
    return h("span", {
      onclick: () => {
        if((ctx.showNdx * 2 + 1) >= ctx.pagefn.numPages()) return
        ctx.showNdx++
        enable_disable_1()
        showPages(ctx)
      },
      style
    }, ">")
  }

  function prv_1() {
    return h("span", {
      onclick: () => {
        if(!ctx.showNdx || ctx.pagefn.numPages() <= 1) return
        ctx.showNdx--
        enable_disable_1()
        showPages(ctx)
      },
      style
    }, "<")
  }
}


function showPages(ctx) {
  const canvas = ctx.canvas
  const left = ctx.showNdx * 2
  const right = left + 1
  canvas.ctx.save()
  show_bg_1()
  ctx.pagefn.get(left, (err, left) => {
    if(err) return console.error(err)
    ctx.pagefn.get(right, (err, right) => {
      if(err) return console.error(err)
      show_pgs_1(left, right, () => canvas.ctx.restore())
    })
  })

  function show_pgs_1(left, right, cb) {
    let layout = ctx.layout

    if(ctx.zoom > 0) {
      layout = Object.assign({}, layout)
      const zoom = ctx.zoom * 0.2
      layout.left = layout.left - layout.width * zoom / 2
      layout.top = layout.top - layout.height * zoom / 2
      layout.width = layout.width * (1 + zoom)
      layout.height = layout.height * (1 + zoom)
    }

    show_bx_1(layout)

    const page_l = Object.assign({}, layout)
    const page_r = Object.assign({}, layout)
    page_l.width /= 2
    page_r.width /= 2
    page_r.left = layout.mid
    if(left) show_pg_1(left, page_l)
    if(right) show_pg_1(right, page_r)
    cb()
  }

  function show_pg_1(pg, loc) {
    canvas.ctx.drawImage(pg.img, loc.left, loc.top, loc.width, loc.height)
  }

  function show_bx_1(loc) {
    canvas.ctx.fillStyle = "#666"
    const border = 4
    canvas.ctx.fillRect(loc.left - border, loc.top-border, loc.width+border*2, loc.height+2*border)
  }

  function show_bg_1() {
    canvas.ctx.fillStyle = "#aaa"
    canvas.ctx.fillRect(0, 0, canvas.box.width, canvas.box.height)
  }
}
