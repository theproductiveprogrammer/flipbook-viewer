'use strict'
import { h } from '@tpp/htm-x';
import * as EventEmitter from 'events';

class SinglePageViewer extends EventEmitter {};

/*    way/
 * set up the canvas and the toolbar, then show the
 * first page
 */
export function singlePageViewer(ctx, cb) {
  const viewer = new SinglePageViewer();
  viewer.page_count = ctx.book.numPages();

  setupCanvas(ctx, err => {
    if(err) return cb(err);

    calcInitialLayout(ctx, err => {
      if(err) return cb(err);

      ctx.app.c(ctx.canvas.e);

      setupMouseHandler(ctx, viewer);

      ctx.zoom = 0;

      setupControls(ctx, viewer);

      cb(null, viewer);

      showPages(ctx, viewer);

    });

  });

}


function setupControls(ctx, viewer) {

  viewer.zoom = zoom => {
    zoom = Number(zoom)
    if(isNaN(zoom)) {
      zoom = ctx.zoom * 2 + 1
      if(zoom > 4) zoom = 0
    }
    if(!zoom) {
      ctx.zoom = 0
      ctx.pan = null
      showPages(ctx, viewer)
    } else {
      animate({
        draw: curr => {
          ctx.zoom = curr.zoom
          showPages(ctx, viewer)
        },
        duration: 500,
        from: { zoom: ctx.zoom },
        to: { zoom },
        timing: t => t * t * (3.0 - 2.0 * t),
      })
    }
  }

  viewer.flip_forward = () => {
    if(ctx.flipNdx || ctx.flipNdx === 0) return
    if(ctx.book.numPages() <= 1) return
    if((ctx.showNdx * 2 + 1) >= ctx.book.numPages()) return
    ctx.flipNdx = ctx.showNdx + 1
    flip_1(ctx)
  }
  viewer.flip_back = () => {
    if(ctx.flipNdx || ctx.flipNdx === 0) return
    if(ctx.book.numPages() <= 1) return
    if(!ctx.showNdx) return
    ctx.flipNdx = ctx.showNdx - 1
    flip_1(ctx)
  }

  function flip_1(ctx) {
    animate({
      draw: curr => {
        ctx.flipFrac = curr.flipFrac
        showFlip(ctx, viewer)
      },
      duration: 1111,
      from: { flipFrac: 0 },
      to: { flipFrac: 1 },
      timing: t => t * t * (3.0 - 2.0 * t),
      ondone: () => {
        ctx.showNdx = ctx.flipNdx
        ctx.flipNdx = null
        showPages(ctx, viewer)
      }
    })
  }
}


/*    way/
 * set up a canvas element with the width and height
 */
function setupCanvas(ctx, cb) {
  const canvas = {
    e: h("canvas")
  };
  canvas.ctx = canvas.e.getContext('2d');
  canvas.e.width = ctx.sz.boxw;
  canvas.e.height = ctx.sz.boxh;

  ctx.canvas = canvas;

  cb();
}

/*    way/
 * use the initial page to calculate the usable size of the
 * view.
 */
function calcInitialLayout(ctx, cb) {
  ctx.book.getPage(1, (err, pg) => {

    const mT = ctx.sz.marginTop/100;
    const mL = ctx.sz.marginLeft/100;
    const usableH = 1 - mT*2;
    const usableW = 1 - mL*2;

    let height = ctx.sz.boxh * usableH;
    let width = pg.width * (height / pg.height);
    const maxwidth = ctx.sz.boxw * usableW;
    if(width > maxwidth) {
      width = maxwidth;
      height = pg.height * (width / pg.width);
    }

    let top = ctx.sz.boxh * mT;
    let left = ctx.sz.boxw * mL;
    if(top + height > ctx.sz.boxh) top = ctx.sz.boxh - height;
    if(left + width > ctx.sz.boxw) left = ctx.sz.boxw - width;

    ctx.layout = {
      top,
      left,
      mid: ctx.sz.boxw / 2,
      width: width,
      height,
    };
    console.log(ctx)

    cb();

  });
}

/*    way/
 * capture mouse events, passing them to the
 * actual handlers if set up
 */
function setupMouseHandler(ctx, viewer) {
  const handlers = [
    setupPanning(ctx, viewer),
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
function setupPanning(ctx, viewer) {
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
      showPages(ctx, viewer)
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
 * show the background and the pages on the viewer
 */
function showPages(ctx, viewer) {
  const canvas = ctx.canvas;
  canvas.ctx.save();
  show_bg_1();

  show_page_1(1, err => {
    if(err) console.error(err);
  });


  function show_page_1(num, cb) {
    ctx.book.getPage(num, (err, pg) => {
      const layout = calcLayout(ctx);
      if(err) return cb(err);
      viewer.emit('seen', num);
      canvas.ctx.drawImage(pg.img, layout.left, layout.top, layout.width, layout.height)
      cb();
    })
  }

  function show_bg_1() {
    canvas.ctx.fillStyle = ctx.color.bg
    canvas.ctx.fillRect(0, 0, ctx.sz.boxw, ctx.sz.boxh)
  }
}

/*    way/
 * show the current pages, then overlay the current flip
 */
function showFlip(ctx, viewer) {
  showPages(ctx, viewer)

  const canvas = ctx.canvas
  const left = ctx.flipNdx * 2
  const right = left + 1
  const layout = calcLayout(ctx)
  const strength = 0.5 - Math.abs(0.5 - ctx.flipFrac)
  canvas.ctx.save()

  ctx.book.getPage(left, (err, left) => {
    if(err) return console.error(err)
    ctx.book.getPage(right, (err, right) => {
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
