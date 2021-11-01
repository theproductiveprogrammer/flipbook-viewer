# Flipbook Viewer

Amazing flip book component with animated pages.

![demo](./test/demo.gif)

This is a tiny, library (no dependencies), that uses can show images and PDF flip books.

## Advantages

1. Tiny (17 *Kb* compressed / 54 *Kb* uncompressed). For comparison, the amazing [page-flip](./https://www.npmjs.com/package/page-flip) is 10 **Mb**.
2. Zero dependencies
3. Can use any input as a book simply by creating a “book provider”. An example book using the amazing [pdfjs](./https://www.npmjs.com/package/pdfjs-dist) from Mozilla can be found in [book-pdf.js](./test/book-pdf.js) (used in [test-pdf.js](./test/test-pdf.js))
4. Supports **Panning**, **Zooming**, **Liking**, **Sharing**, along with page turning effects
5. Highly Configurable
6. Provides Programmatic API & Hooks to every event

## Usage

Below shows the flip `book` on the given `div` with the id `div-id`:

```js
'use strict'

import * as flipbook from '../src'

...

flipbook.init(book, 'div-id', (err, viewer) => {
  if(err) console.error(err)
  viewer.on('seen', n => console.log('page number: ' + n))
  viewer.on('liked', liked => console.log('liked: ' + liked))
  viewer.on('shared', () => console.log('shared'))
})
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
  toolbarSeparator: "#9e9e9e",
  toolbarColor: "#353535",
  toolbarSize: 24,
  boxColor: "#353535",
  boxBorder: 4,
  width: 800,
  height: 600,
}

flipbook.init(book, 'div-id', opts, (err, viewer) => ...
```

## Events

You can listen on the `viewer` for the following events:

```js
viewer.on('seen', n => ...)
viewer.on('liked', liked => ...)
viewer.on('shared', () => ...)
```

## Programmatic API

The returned viewer can be used to programmatically control the viewer:

```js
viewer.nav.nextPage()
viewer.nav.prevPage()
viewer.zoom()
viewer.share()
viewer.heart() // toggles. viewer.heart(0) / viewer.heart(1) to set
```

Enjoy!

------------

