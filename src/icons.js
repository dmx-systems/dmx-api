import 'font-awesome/css/font-awesome.css'

import fa from 'font-awesome/fonts/fontawesome-webfont.svg'
import rpc from './rpc'

let svgReady            // a promise resolved once the Font Awesome SVG is loaded
let faFont              // Font Awesome SVG <font> element
let faDefaultWidth      // Default icon width

svgReady = rpc.getXML(fa).then(svg => {
  faFont = svg.querySelector('font')
  faDefaultWidth = faFont.getAttribute('horiz-adv-x')
})

function faGlyph (unicode) {
  try {
    const glyph = faFont.querySelector(`glyph[unicode="${unicode}"]`)
    return {
      path: glyph.getAttribute('d'),
      width: glyph.getAttribute('horiz-adv-x') || faDefaultWidth
    }
  } catch (e) {
    throw Error(`Font Awesome glyph "${unicode}" not available (${e})`)
  }
}

export default {
  ready: svgReady,
  faGlyph
}
