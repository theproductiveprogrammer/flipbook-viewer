'use strict'
import { getH } from '@tpp/htm-x';

import { flipbookViewer } from "./flipbookviewer.js";
import { singlePageViewer } from "./singlepageviewer.js";
import pkg from '../package.json';

/*    way/
 * set up the options and return the requested viewer
 */
export function init(book, id, opts, cb) {
  if(typeof opts === 'function') {
    cb = opts;
    opts = {};
  }
  if(!opts) opts = {};
  if(!cb) cb = () => 1;
  const app = getH(id);
  if(!app) {
    const emsg = ("flipbook-viewer: Failed to find container for viewer: " + id);
    console.error(emsg);
    cb(emsg);
    return;
  }

  if(opts.singlepage) {

    singlePageViewer({ app, book }, ret_1);

  } else {

    const ctx = {
      color: {
        bg: opts.backgroundColor || "#353535",
      },
      sz: {
        bx_border: opts.boxBorder || 0,
        boxw: opts.width || 800,
        boxh: opts.height || 600,
      },
      app,
      book,
    };

    const margin = opts.margin || 1;
    if(opts.marginTop || opts.marginTop === 0) ctx.sz.marginTop = opts.marginTop;
    else ctx.sz.marginTop = margin;
    if(opts.marginLeft || opts.marginLeft === 0) ctx.sz.marginLeft = opts.marginLeft;
    else ctx.sz.marginLeft = margin;

    flipbookViewer(ctx, ret_1);
  }


  function ret_1(err, viewer) {
    if(opts.popup) history.pushState({}, "", "#");
    if(viewer) viewer.version = pkg.version;
    return cb(err, viewer);
  }
}
