export default {
  updateAll: function (className = 'sg-line', option) {
    const els = [...document.getElementsByClassName(className)]
    this.update(els, option)
  },
  update: function (els = [], option) {
    els.forEach(el => {
      this.updateEl(el, option)
    })
  },
  updateEl: function (el, option) {
    const MIN_LEN = 10
    const originText = el.getAttribute('originText') || el.innerHTML
    if (originText.length < MIN_LEN) {
      el.innerHTML = originText
      return
    }

    let ctx = window.testCtx
    if (!ctx) {
      const c = document.createElement('CANVAS')
      ctx = c.getContext('2d')
      window.testCtx = ctx

      const style = getComputedStyle(el)
      ctx.font = style.font
      ctx.letterSpacing = parseInt(style.letterSpacing)
      ctx.paddingLeft = parseInt(style.paddingLeft)
      ctx.paddingRight = parseInt(style.paddingRight)
    }
    const LINE_WIDTH = el.clientWidth - ctx.paddingLeft - ctx.paddingRight
    const LETTER_SPACING = ctx.letterSpacing
    const { line: MAX_LINES = 2 } = option || {}
    let start = 0
    let end = MIN_LEN - 1
    let lines = []
    // 可优化成MIN_LEN作为步长进行测量
    for (const len = originText.length; end < len; end++) {
      const text = originText.substring(start, end)
      const spacing = LETTER_SPACING * text.length
      if (ctx.measureText(text).width + spacing > LINE_WIDTH) {
        lines.push({
          text: originText.substring(start, end - 1),
          isFull: true
        })
        start = end
      }
    }
    if (start !== end - 1) {
      lines.push({
        text: originText.substring(start, end),
        isFull: false
      })
    }

    lines = lines.slice(0, MAX_LINES)
    const lastLine = lines[lines.length - 1]
    if (lines.length === MAX_LINES && lastLine.isFull) {
      const lineText = lines[MAX_LINES - 1].text
      let ellipsisText = lineText + '...'
      let len = lineText.length
      let spacing = LETTER_SPACING * ellipsisText.length
      while (ctx.measureText(ellipsisText).width + spacing > LINE_WIDTH) {
        len--
        ellipsisText = lineText.substr(0, len) + '...'
        spacing = LETTER_SPACING * ellipsisText.length
      }
      lines[lines.length - 1].text = ellipsisText
      el.innerHTML = lines.map(o => o.text).join('')
    }
  }
}