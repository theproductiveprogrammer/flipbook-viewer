'use strict'
import { h, getH } from '@tpp/htm-x'

export function init(id, pages) {
  const e = getH(id)

  const canvas = h("canvas")
  const ctx = canvas.getContext('2d')
  const toolbar = h(".toolbar", "tool bar")

  const rect = {
    w: 2480,
    h: 3508,
  }
  rect.w /= 5
  rect.h /= 5

  canvas.width = rect.w * 2
  canvas.height = rect.h

  canvas.attr({
    onmousedown: evt => {
      const pos = get_mouse_pos_1(canvas, evt)
      if(pos.x < rect.w) {
        page_1(0)
        page_1(1)
      } else {
        page_1(2)
        page_1(3)
      }
    }
  })

  page_1(0)
  page_1(1)

  e.c(
    canvas,
    toolbar,
  )

  function page_1(ndx) {
    const xoff = (ndx % 2) * rect.w
    const img = h("img", {
      src: pages[ndx],
      onload: () => {
        ctx.drawImage(img, xoff, 0, rect.w, rect.h)
      },
    })
  }

  function get_mouse_pos_1(canvas, evt) {
    const rect = canvas.getBoundingClientRect()
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top,
    }
  }

}
