'use strict'
import { h, getH } from '@tpp/htm-x'

/*    way/
 * set up the canvas and the toolbar, then show the
 * first page
 */
export function init(id, pagefn, cb) {
  if(!cb) cb = () => 1
  const app = getH(id)

  const ctx = {
    color: {
      bg: "#aaa",
      bx: "#666",
    },
    sz: {
      bx_border: 4,
      outdent: 20,
    },
    app,
    pagefn
  }

  setupCanvas(ctx, err => {
    if(err) return console.error(err)

    setupToolbar(ctx, err => {
      if(err) return console.error(err)

      app.c(
        ctx.canvas.e,
        ctx.toolbar.e,
      )

      setupMouseHandler(ctx)

      ctx.zoom = 0
      ctx.showNdx = 0
      showPages(ctx)

      cb({
        nav: ctx.nav,
      })

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
    e: h("canvas", { style: { display: 'block', margin: '0', padding: '0' } })
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
    calcInitialLayout(canvas.box, pg, layout => {
      ctx.layout = layout
      cb()
    })
  })
}

/*    way/
 * keep a 10% margin on the closest side and
 * enough space for two pages.
 */
function calcInitialLayout(box, pg, cb) {
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

/*    way/
 * show the toolbar with next, previous, and zoom buttons
 */
function setupToolbar(ctx, cb) {
  const toolbar = h(".toolbar", {
    style: {
      'box-sizing': 'border-box',
      width: ctx.canvas.box.width + 'px',
      margin: '0',
      padding: '8px',
      background: "#333",
      color: '#eee',
      'font-size': '24px',
    }
  })

  const nxt = nxt_1()
  const prv = prv_1()
  enable_disable_1()

  const zoom = zoom_1()

  toolbar.c(
    prv, nxt.e, zoom
  )

  ctx.toolbar = {
    e: toolbar
  }
  ctx.nav = {
    nxt: nxt.onclick,
  }

  cb()

  /*    way/
   * enable or disable the buttons
   * based on the current state
   */
  function enable_disable_1() {
    const enabled = {
      cursor: "pointer",
      "user-select": "none",
      "opacity": "1",
    }
    const disabled = {
      cursor: "not-allowed",
      "user-select": "none",
      opacity: "0.5",
    }
    if(ctx.flipNdx !== undefined && ctx.flipNdx !== null) {
      prv.attr({ style: disabled })
      nxt.e.attr({ style: disabled })
      return
    }
    if(!ctx.showNdx || ctx.pagefn.numPages() <= 1) {
      prv.attr({ style: disabled })
    } else {
      prv.attr({ style: enabled })
    }
    if((ctx.showNdx * 2 + 1) >= ctx.pagefn.numPages()) {
      nxt.e.attr({ style: disabled })
    } else {
      nxt.e.attr({ style: enabled })
    }
  }

  function nxt_1() {
    const e = h("span", { onclick }, " > ")

    return {
      e, onclick
    }

    function onclick() {
      if(ctx.flipNdx) return
      if((ctx.showNdx * 2 + 1) >= ctx.pagefn.numPages()) return
      ctx.flipNdx = ctx.showNdx + 1
      enable_disable_1()
      flip_1()
    }
  }

  function prv_1() {
    return h("span", {
      onclick: () => {
        if(ctx.flipNdx) return
        if(!ctx.showNdx || ctx.pagefn.numPages() <= 1) return
        ctx.flipNdx = ctx.showNdx - 1
        enable_disable_1()
        flip_1()
      }
    }, " < ")
  }

  function flip_1() {
    animate({
      draw: curr => {
        ctx.flipFrac = curr.flipFrac
        showFlip(ctx)
      },
      duration: 1111,
      from: { flipFrac: 0 },
      to: { flipFrac: 1 },
      timing: t => t * t * (3.0 - 2.0 * t),
      ondone: () => {
        ctx.showNdx = ctx.flipNdx
        ctx.flipNdx = null
        enable_disable_1()
        showPages(ctx)
      }
    })
  }

  /*    understand/
   * zoom smoothly, going up then re-setting back (pan AND zoom)
   * when too big
   */
  function zoom_1() {
    return h("span", {
      onclick: () => {
        let zoom = ctx.zoom + 1
        if(zoom > 4) {
          ctx.zoom = 0
          ctx.pan = null
          showPages(ctx)
        } else {
          animate({
            draw: curr => {
              ctx.zoom = curr.zoom
              showPages(ctx)
            },
            duration: 500,
            from: { zoom: ctx.zoom },
            to: { zoom },
            timing: t => t * t * (3.0 - 2.0 * t),
          })
        }
      },
      style : {
        "cursor": "pointer",
        "cursor": "zoom-in",
        "user-select": "none",
      }
    }, " + ")
  }
}

/*    way/
 * capture mouse events, passing them to the
 * actual handlers if set up
 */
function setupMouseHandler(ctx) {
  const handlers = [
    setupPanning(ctx),
  ]

  const events = [
    "onmouseenter", "onmouseleave",
    "onmousemove",
    "onclick",
    "onmousedown", "onmouseup",
  ]

  const attr = {}
  events.map(e => {
    attr[e] = evt => {
      handlers.map(h => {
        if(h[e]) h[e](evt)
      })
    }
  })

  ctx.app.attr(attr)
}

/*    way/
 * set up the ctx.pan offsets (only when zooming),
 * starting on the first mouse click and ending when
 * mouse up or we leave the box
 */
function setupPanning(ctx) {
  let start

  function onmouseleave(evt) {
    start = null
  }

  function onmousedown(evt) {
    if(!ctx.zoom) return
    start = mousePt(ctx, evt)
    if(ctx.pan) {
      start.x -= ctx.pan.x
      start.y -= ctx.pan.y
    }
  }

  function onmouseup(evt) {
    start = null
  }

  function onmousemove(evt) {
    const pt = mousePt(ctx, evt)
    if(start && inBox(ctx, pt)) {
      ctx.pan = {
        x: (pt.x - start.x),
        y: (pt.y - start.y),
      }
      showPages(ctx)
    } else {
      start = null
    }
  }

  return {
    onmouseleave,
    onmousedown,
    onmouseup,
    onmousemove,
  }

}

/*    way/
 * return true if the point is in the current box
 */
function inBox(ctx, pt) {
  const rt = currBox(ctx)
  return (rt.top <= pt.y && rt.bottom >= pt.y &&
          rt.left <= pt.x && rt.right >= pt.x)
}

/*    way/
 * return the location of the mouse relative to the app area
 */
function mousePt(ctx, evt) {
  const rect = ctx.app.getBoundingClientRect()
  return {
    x: evt.clientX - rect.x,
    y: evt.clientY - rect.y
  }
}

/*    way/
 * return the current rectangle
 */
function currBox(ctx) {
  const l = calcLayout(ctx)
  return {
    top: l.top,
    left: l.left,
    bottom: l.top + l.height,
    right: l.left + l.width,
  }
}

/*    understand/
 * return the layout, adjusted for zoom and panning
 */
function calcLayout(ctx) {
  let layout = ctx.layout

  if(ctx.zoom > 0) {
    layout = Object.assign({}, layout)
    if(ctx.zoom) {
      const zoom = ctx.zoom * 0.5
      layout.left = layout.left - layout.width * zoom / 2
      layout.top = layout.top - layout.height * zoom / 2
      layout.width = layout.width * (1 + zoom)
      layout.height = layout.height * (1 + zoom)
    }
    if(ctx.pan) {
      layout.left += ctx.pan.x
      layout.top += ctx.pan.y
      layout.mid += ctx.pan.x
    }
  }

  return layout
}

/*    way/
 * show the background, and the pages
 */
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

  /*    way/
   * get the current layout and, if no zoom, show the
   * surrounding box. Otherwise show the left and right
   * pages on the correct positions
   */
  function show_pgs_1(left, right, cb) {
    const layout = calcLayout(ctx)

    if(ctx.zoom == 0) show_bx_1(layout)

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
    canvas.ctx.fillStyle = ctx.color.bx
    const border = ctx.sz.bx_border
    canvas.ctx.fillRect(loc.left - border, loc.top-border, loc.width+border*2, loc.height+2*border)
  }

  function show_bg_1() {
    canvas.ctx.fillStyle = ctx.color.bg
    canvas.ctx.fillRect(0, 0, canvas.box.width, canvas.box.height)
  }
}

/*    way/
 * show the current pages, then overlay the current flip
 */
function showFlip(ctx) {
  showPages(ctx)

  const canvas = ctx.canvas
  const left = ctx.flipNdx * 2
  const right = left + 1
  const layout = calcLayout(ctx)
  const strength = 0.5 - Math.abs(0.5 - ctx.flipFrac)
  canvas.ctx.save()

  ctx.pagefn.get(left, (err, left) => {
    if(err) return console.error(err)
    ctx.pagefn.get(right, (err, right) => {
      if(err) return console.error(err)
      show_flip_1(left, right, ctx.flipFrac, () => canvas.ctx.restore())
    })
  })


  function show_flip_1(left, right, frac, cb) {
    let loc, show, width, region, xloc, oheight, otop, controlpt, endpt

    if(ctx.showNdx < ctx.flipNdx) {

      loc = Object.assign({}, layout)
      loc.width /= 2
      loc.left = layout.mid
      show = loc.left + (1 - frac) * loc.width
      width = loc.width * frac
      xloc = xpand_rect_1(ctx, loc)
      canvas.ctx.save()
      region = new Path2D()
      region.rect(show, xloc.top, width, xloc.height)
      canvas.ctx.clip(region)
      if(right) {
        canvas.ctx.drawImage(right.img, loc.left, loc.top, loc.width, loc.height)
      } else {
        const fillStyle = ctx.zoom ? ctx.color.bg : ctx.color.bx
        show_empty_1(fillStyle, xloc)
      }
      canvas.ctx.restore()

      loc = Object.assign({}, layout)
      loc.left += (1 - frac) * loc.width
      loc.width /= 2
      width = loc.width * frac

      oheight = loc.height
      otop = loc.top
      loc.height *= (1 + strength * 0.1)
      loc.top -= (loc.height-oheight)/2

      canvas.ctx.save()
      region = new Path2D()
      region.moveTo(loc.left, otop)
      region.lineTo(loc.left, otop + oheight)
      controlpt = {
        x: loc.left + width / 2,
        y: loc.top + loc.height,
      }
      endpt = {
        x: loc.left + width,
        y: otop + oheight,
      }
      region.quadraticCurveTo(controlpt.x, controlpt.y, endpt.x, endpt.y)
      region.lineTo(endpt.x, otop)
      controlpt = {
        x: loc.left + width,
        y: loc.top
      }
      endpt = {
        x: loc.left,
        y: otop,
      }
      region.quadraticCurveTo(controlpt.x, controlpt.y, endpt.x, endpt.y)
      canvas.ctx.clip(region)
      canvas.ctx.drawImage(left.img, loc.left, loc.top, loc.width, loc.height)
      canvas.ctx.restore()


      canvas.ctx.save()
      const shadowsz = (loc.width / 2) * Math.max(Math.min(strength, 0.5), 0)

      // Draw a sharp shadow on the left side of the page
      canvas.ctx.strokeStyle = 'rgba(0,0,0,'+(0.1 * strength)+')'
      canvas.ctx.lineWidth = 30 * strength
      canvas.ctx.beginPath()
      canvas.ctx.moveTo(loc.left, otop)
      canvas.ctx.lineTo(loc.left, otop + oheight)
      canvas.ctx.stroke()

      // Right side drop shadow
      let gradient = canvas.ctx.createLinearGradient(loc.left + width, otop, loc.left+width+shadowsz, otop)
      gradient.addColorStop(0, 'rgba(0,0,0,'+ (0.3*strength)+')')
      gradient.addColorStop(0.8, 'rgba(0,0,0,0.0)')
      canvas.ctx.fillStyle = gradient
      canvas.ctx.fillRect(loc.left + width, otop, width + shadowsz, oheight)

      canvas.ctx.restore()

    } else {

      loc = Object.assign({}, layout)
      loc.width /= 2
      width = loc.width * frac + ctx.sz.bx_border
      xloc = xpand_rect_1(ctx, loc)
      canvas.ctx.save()
      region = new Path2D()
      region.rect(xloc.left, xloc.top, width, xloc.height)
      canvas.ctx.clip(region)
      if(left) {
        canvas.ctx.drawImage(left.img, loc.left, loc.top, loc.width, loc.height)
      } else {
        const fillStyle = ctx.zoom ? ctx.color.bg : ctx.color.bx
        show_empty_1(fillStyle, loc)
      }
      canvas.ctx.restore()


      loc = Object.assign({}, layout)
      loc.width /= 2
      show = loc.left + frac * loc.width
      loc.left = show - (1 - frac) * loc.width
      width = loc.width * frac

      oheight = loc.height
      otop = loc.top
      loc.height *= (1 + strength * 0.1)
      loc.top -= (loc.height-oheight)/2

      canvas.ctx.save()
      region = new Path2D()
      region.moveTo(show, otop)
      region.lineTo(show, otop + oheight)
      controlpt = {
        x: show + width / 2,
        y: loc.top + loc.height,
      }
      endpt = {
        x: show + width,
        y: otop + oheight,
      }
      region.quadraticCurveTo(controlpt.x, controlpt.y, endpt.x, endpt.y)
      region.lineTo(endpt.x, otop)
      controlpt = {
        x: show + width,
        y: loc.top
      }
      endpt = {
        x: show,
        y: otop,
      }
      region.quadraticCurveTo(controlpt.x, controlpt.y, endpt.x, endpt.y)
      canvas.ctx.clip(region)
      canvas.ctx.drawImage(right.img, loc.left, loc.top, loc.width, loc.height)
      canvas.ctx.restore()


      canvas.ctx.save()
      const shadowsz = (loc.width / 2) * Math.max(Math.min(strength, 0.5), 0)

      // Draw a sharp shadow on the right side of the page
      canvas.ctx.strokeStyle = 'rgba(0,0,0,'+(0.1 * strength)+')'
      canvas.ctx.lineWidth = 30 * strength
      canvas.ctx.beginPath()
      canvas.ctx.moveTo(show + width, otop)
      canvas.ctx.lineTo(show + width, otop + oheight)
      canvas.ctx.stroke()

      // Left side drop shadow
      let gradient = canvas.ctx.createLinearGradient(show, otop, show-shadowsz, otop)
      gradient.addColorStop(0, 'rgba(0,0,0,'+ (0.3*strength)+')')
      gradient.addColorStop(0.8, 'rgba(0,0,0,0.0)')
      canvas.ctx.fillStyle = gradient
      canvas.ctx.fillRect(show-shadowsz, otop, shadowsz, oheight)

      canvas.ctx.restore()

    }

    cb()
  }

  function show_empty_1(fillStyle, loc) {
    canvas.ctx.fillStyle = fillStyle
    const border = ctx.sz.bx_border
    canvas.ctx.fillRect(loc.left - border, loc.top-border, loc.width+border*2, loc.height+2*border)
  }

  function xpand_rect_1(ctx, loc) {
    const border = ctx.sz.bx_border
    return {
      left: loc.left - border,
      top: loc.top - border,
      width: loc.width + border * 2,
      height: loc.height + border * 2,
    }
  }

}

/*    understand/
 * animate the properties {from -> to} , calling ondone when ends
 */
function animate({ draw, duration, from, to, timing, ondone }) {
  if(!ondone) ondone = () => 1
  if(!timing) timing = t => t

  const start = Date.now()

  animate_1()

  function animate_1() {
    let frac = (Date.now() - start) / duration
    if(frac > 1) frac = 1
    const curr = progress_1(frac)
    draw(curr)
    if(frac === 1) ondone()
    else requestAnimationFrame(animate_1)
  }

  function progress_1(frac) {
    frac = timing(frac)
    const ret = Object.assign({}, from)
    for(let k in from) {
      const s = Number(from[k])
      const e = Number(to[k])
      ret[k] = s + (e - s) * frac
    }
    return ret
  }
}
