'use strict'
import { h } from '@tpp/htm-x';
import * as EventEmitter from 'events';

class SinglePageViewer extends EventEmitter {};

/*    way/
 * Set up a viewer container and generate all
 * the pages within that container.
 */
export function singlePageViewer(ctx, cb) {
  const viewer = new SinglePageViewer();
  viewer.page_count = ctx.book.numPages();

  setupCont(ctx, err => {
    if(err) return cb(err);

    generatePages(ctx, err => {
      if(err) return cb(err);
      else return cb(null, viewer);
    });

  });
}

/*    way/
 * Create a temporary "page" to get the
 * expected size (width) of the pages set
 * by the CSS
 */
function setupCont(ctx, cb) {
  const tst = h("canvas.flipbook__page");
  ctx.app.c(tst);
  setTimeout(() => {
    ctx.page_width = tst.getBoundingClientRect().width;
    ctx.app.rm(tst);
    cb();
  });
}

function generatePages(ctx, cb) {
  console.log(ctx)
  gen_pg_1(0);

  function gen_pg_1(ndx) {
    if(ndx >= ctx.book.numPages()) return cb();

  }
}


/*

  setupCanvas(ctx, err => {
    if(err) return cb(err);

    ctx.app.c(ctx.canvas.e);

    cb(null, viewer);

    showPages(ctx, viewer);

  });

}


/*    way/
 * walk the pages and calculate the various parameters
 * of the view from the first page and number of pages
 */
function setupCanvas(ctx, cb) {
  const canvas = { e: h("canvas") };

  ctx.book.getPage(1, (err, pg) => {
    if(err) return cb(err);

    const scale = 4.0;
    const viewport = pg.page.getViewport({ scale });

    const outputScale = window.devicePixelRatio || 1;

    const mT = ctx.sz.marginTop/100;
    const mL = ctx.sz.marginLeft/100;

    canvas.e.width = Math.floor(viewport.width * outputScale);
    canvas.e.height = Math.floor(viewport.height * outputScale);
    canvas.e.style.width = Math.floor(viewport.width) + "px";
    canvas.e.style.height =  Math.floor(viewport.height) + "px";
    canvas.ctx = canvas.e.getContext("2d");

    const width = viewport.width;
    const height = viewport.height;

    const offsetTop = ctx.sz.boxw * mT;
    const offsetLeft = ctx.sz.boxw * mL;

    const fullHeight = height + offsetTop;
    const totHeight = fullHeight * ctx.book.numPages() + offsetTop;

    ctx.layout = {
      offsetTop,
      offsetLeft,
      width,
      height,
      fullHeight,
      totHeight,
      outputScale,
    };

    ctx.canvas = canvas;
    cb();
  });
}


/*    way/
 * show the background and currently visible
 * pages on the viewer
 */
function showPages(ctx, viewer) {
  const canvas = ctx.canvas;
  canvas.ctx.save();
  show_bg_1();

  show_pgs_1(0);

  function show_pgs_1(num) {
    if(num >= viewer.page_count) return;
    if(is_visible_1(num)) {
      show_page_1(num, err => {
        if(err) return console.error(err);
        else show_pgs_1(num+1);
      });
    } else {
      show_pgs_1(num+1);
    }
  }

  function is_visible_1(num) {
    return true;
  }

  function show_page_1(num, cb) {
    num += 1;
    ctx.book.getPage(num, (err, pg) => {
      if(err) return cb(err);
      const layout = Object.assign({}, ctx.layout);
      layout.offsetTop = layout.fullHeight * (num-1) + layout.offsetTop;
      canvas.ctx.drawImage(pg.img, layout.offsetLeft, layout.offsetTop, layout.width, layout.height)
      cb();
    })
  }

  function show_bg_1() {
    canvas.ctx.fillStyle = ctx.color.bg
    canvas.ctx.fillRect(0, 0, ctx.sz.boxw, ctx.layout.totHeight)
  }
}
