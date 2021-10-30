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

  canvas.width = rect.w
  canvas.height = rect.h

  const img = h("img", {
    src: pages[0],
    onload: () => {
      ctx.drawImage(img, 0, 0, rect.w, rect.h)
    },
  })

  e.c(
    canvas,
    toolbar,
  )
}
