# Flipbook Viewer

Amazing flip book component with animated pages.

![demo](./test/demo.gif)

This is a tiny library that can show flip books from any source (including PDF’s, images, etc).

## Advantages

1. Tiny (18 ***Kb***). For comparison, the amazing [page-flip](./https://www.npmjs.com/package/page-flip) is 10 **Mb** (x1000 times bigger!).
2. Can use any input as a book simply by plugging in a “book provider”. An example PDF book using the amazing [pdfjs](./https://www.npmjs.com/package/pdfjs-dist) from Mozilla can be found in the test folder—[book-pdf.js](./test/book-pdf.js) (referenced usage: [test-pdf.js](./test/test-pdf.js))
3. Supports **Panning**, **Zooming**, **Liking**, **Sharing**, along with page turning effects.
4. Raises events to track which pages are being viewed by user.

## Usage

Below shows the flip `book` on the given `div` with the id `div-id`:

```js
'use strict'

import { init as flipbook } from 'flipbook-viewer';

...

flipbook(book, 'div-id', (err, viewer) => {
  if(err) console.error(err);

  console.log('Number of pages: ' + viewer.page_count);
  viewer.on('seen', n => console.log('page number: ' + n));

  next.onclick = () => viewer.flip_forward();
  prev.onclick = () => viewer.flip_back();
  zoom.onclick = () => viewer.zoom();

});
```

The viewer can show *any* flip book. All you need to do is provide a book interface:

```js
{
  numPages: () => {
    /* return number of pages */
  },
  getPage: (num, cb) => {
    /* return page number 'num'
     * in the callback 'cb'
     * as any CanvasImageSource:
     * (CSSImageValue, HTMLImageElement, 
     *  SVGImageElement, HTMLVideoElement,
     *  HTMLCanvasElement, ImageBitmap,
     *  OffscreenCanvas)
     */
  }
}
```

## Options

An optional `opts` parameter can be passed in to change the UI:

```js
const opts = {
  backgroundColor: "#353535",
  boxColor: "#353535",
  width: 800,
  height: 600,
}

flipbook(book, 'div-id', opts, (err, viewer) => ...
```

## Events

You can listen on the `viewer` for which pages were seen:

```js
viewer.on('seen', n => ...)
```

## Programmatic API

The returned viewer can be used to programmatically control the viewer:

```js
viewer.flip_forward()
viewer.flip_back()
viewer.zoom()
```

## Single Page View

Finally, sometimes it makes sense to just show the book as a simple, scrollable view. To do this set the `singlepage` option:

```js
const opts = {
  width: 800,
  height: 600,
  singlepage: true,
  marginTop: 5,   /* percent */
  marginLeft: 2,  /* percent */
}

flipbook(book, 'div-id', opts, (err, viewer) => ...
```


Enjoy!

------------

