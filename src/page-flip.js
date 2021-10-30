'use strict'
import { h, getH } from '@tpp/htm-x'

export function init(e) {
  e = getH(e)

  const canvas = h("canvas")
  const toolbar = h(".toolbar", "tool bar")

  e.c(
    canvas,
    toolbar,
  )
}
