'use strict'
import { h } from '@tpp/htm-x';
import * as EventEmitter from 'events';

class SinglePageViewer extends EventEmitter {};

/*    way/
 * Set up a viewer container, generate all
 * the pages within that container, and set up
 * the interesection observer to raise 'seen' events
 */
export function singlePageViewer(ctx, cb) {
  const viewer = new SinglePageViewer();
  viewer.page_count = ctx.book.numPages();

  setupCont(ctx, err => {
    if(err) return cb(err);

    generatePages(ctx, err => {
      if(err) return cb(err);
      cb(null, viewer);
      setupSeenEvents(ctx, viewer);
    });

  });
}

function setupSeenEvents(ctx, viewer) {
  const seen = {};
  const observer = new IntersectionObserver(pg_seen_1, {
    root: null,
    rootMargin: "0px",
    threshold: 0.25,
  });

  ctx.pages.forEach(p => observer.observe(p));


  function pg_seen_1(entries) {
    entries.forEach(e => {
      if(e.intersectionRatio) {
        try {
          const page = e.target.dataset.flipbookPage;
          if(seen[page]) return;
          seen[page] = true;
          viewer.emit("seen", page);
        } catch(e) {
          console.error(e);
        }
      }
    });
  }

}

const newpage = n => h(`canvas#flipbook__pgnum_${n}.flipbook__page`);
/*    way/
 * Create a temporary "page" to get the
 * expected size (width) of the pages set
 * by the CSS
 */
function setupCont(ctx, cb) {
  const tmp = newpage(0);
  ctx.app.c(tmp);
  setTimeout(() => {
    ctx.page_width = tmp.getBoundingClientRect().width;
    ctx.app.rm(tmp);
    cb();
  });
}

/*    way/
 * generate a correctly scaled canvas for each page, add it the app
 * and render the pdf to it.
 */
function generatePages(ctx, cb) {
  const outputScale = window.devicePixelRatio || 1; // Support HiDPI-screens
  const pdf = ctx.book.pdf;

  ctx.pages = [];
  gen_pg_1(0);

  function gen_pg_1(ndx) {
    if(ndx >= pdf.numPages) return cb();

    const num = ndx+1;

    pdf.getPage(num)
      .then(page => {
        const coresz = page.getViewport({scale:1});
        const scale = ctx.page_width / coresz.width;

        const viewport = page.getViewport({scale});

        const canvas = newpage(num);
        canvas.attr({ "data-flipbook-page": num });

        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = Math.floor(viewport.width) + "px";
        canvas.style.height =  Math.floor(viewport.height) + "px";

        ctx.pages.push(canvas);
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
          .catch(err => cb(err || "Failed rendering page" + num))
      })
      .catch(err => cb(err || "Failed getting page:" + num))
  }
}
