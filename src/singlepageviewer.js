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

const newpage = () => h("canvas.flipbook__page");
/*    way/
 * Create a temporary "page" to get the
 * expected size (width) of the pages set
 * by the CSS
 */
function setupCont(ctx, cb) {
  const tmp = newpage();
  ctx.app.c(tmp);
  setTimeout(() => {
    ctx.page_width = tmp.getBoundingClientRect().width;
    ctx.app.rm(tmp);
    cb();
  });
}

function generatePages(ctx, cb) {
  const outputScale = window.devicePixelRatio || 1; // Support HiDPI-screens
  const pdf = ctx.book.pdf;

  gen_pg_1(0);

  function gen_pg_1(ndx) {
    if(ndx >= pdf.numPages) return cb();

    pdf.getPage(ndx+1)
      .then(page => {
        const coresz = page.getViewport({scale:1});
        const scale = ctx.page_width / coresz.width;

        const viewport = page.getViewport({scale});

        const canvas = newpage();
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = Math.floor(viewport.width) + "px";
        canvas.style.height =  Math.floor(viewport.height) + "px";
        ctx.app.add(canvas);

        const transform = outputScale !== 1
          ? [outputScale, 0, 0, outputScale, 0, 0]
          : null;

        const context = canvas.getContext("2d")
        const renderContext = {
          canvasContext: context,
          transform,
          viewport,
        }
        page.render(renderContext).promise
          .then(() => gen_pg_1(ndx+1))
          .catch(err => cb(err || "Failed rendering page" + (ndx+1)))
      })
      .catch(err => cb(err || "Failed getting page:" + (ndx+1)))
  }
}
