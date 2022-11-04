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

  calcLayoutParameters(ctx, err => {
    if(err) return cb(err);

    setupCanvas(ctx, err => {
      if(err) return cb(err);

      ctx.app.c(ctx.canvas.e);

      cb(null, viewer);

      showPages(ctx, viewer);

    });

  });

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
  canvas.e.height = ctx.layout.totHeight;

  ctx.canvas = canvas;

  cb();
}

/*    way/
 * walk the pages and calculate the various parameters
 * of the view from the first page and number of pages
 */
function calcLayoutParameters(ctx, cb) {
  ctx.book.getPage(1, (err, pg) => {

    const mT = ctx.sz.marginTop/100;
    const mL = ctx.sz.marginLeft/100;
    const usableW = 1 - mL*2;

    const width = ctx.sz.boxw * usableW;
    const height = pg.height * (width / pg.width);

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
    };

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
