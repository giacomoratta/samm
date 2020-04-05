const _ = require('lodash')
const INDENT = '  '
const NL = '\n'

class CliPrinter {
  constructor ({ command, logFn = console.info, indentLevel = 1 }) {
    this.command = command
    this.indent = INDENT.repeat(indentLevel)
    this.logFn = logFn
  }

  child ({ command }) {
    if (!command) command = this.command
    return new this.constructor({ command, indentLevel: this.indent + 1 })
  }

  newLine (count = 0) {
    this.logFn(`${NL.repeat(count)}`)
  }

  info (message) {
    this.logFn(`${this.indent}${message}`)
  }

  warn (message) {
    this.logFn(`${this.indent}WARNING: ${message}`)
  }

  error (message) {
    this.logFn(`${this.indent}ERROR: ${message}`)
  }

  title (message) {
    this.logFn(`${NL}${this.indent}${message}`)
  }

  boxed (message, title = '') {
    let centerString = ''
    let topLineLength = 0

    if (message instanceof Array) {
      const lines = message
      let finalLine
      lines.forEach((line) => {
        topLineLength = Math.max(topLineLength, line.length)
      })
      lines.forEach((line) => {
        if (line.length < 1) return
        finalLine = ` \u2502  ${line}${(' ').repeat(topLineLength - line.length)}  \u2502`
        centerString += `${finalLine}${NL}`
      })
      topLineLength += 7
    } else {
      centerString = ` \u2502 ${message} \u2502`
      topLineLength = centerString.length
      centerString = `${centerString}${NL}`
    }

    const topLine = `${('\u2500').repeat(topLineLength - 3)}`
    const middleLine = ` \u2502 ${(' ').repeat(topLineLength - 5)} \u2502`

    if (title.length > 1) {
      const repeatCount = Math.floor((topLineLength - title.length) / 2) - 3
      const space = (' ').repeat(repeatCount)
      let centerStringLine = ` \u2502 ${space}${title}${space}  `
      if (centerStringLine.length + 1 < topLineLength) {
        centerStringLine = `${centerStringLine}${(' ').repeat(topLineLength - centerStringLine.length - 1)}`
      }
      centerString = `${centerStringLine}\u2502${NL}${middleLine}${NL}${centerString}`
    }
    this.logFn(`${NL} \u250C${topLine}\u2510${NL}${middleLine}${NL}${centerString}${middleLine}${NL} \u2514${topLine}\u2518${NL}`)
  }

  value (value, message) {
    let text = `${message}: `
    if (_.isArray(value)) {
      text = `${text}${value.join(',')}`
    } else if (_.isObject(value)) {
      Object.keys(value).forEach((k) => {
        text = `${text}${NL}${this.indent}  ${k}: ${value[k]}`
      })
    } else {
      text = `${text}${value}`
    }
    text = `${text}${NL}`
    this.info(text)
  }

  orderedList (array, toString) {
    if (!array) return
    let i = 1
    const indent = `${this.indent}${''.repeat(array.length.toString().length - 1)}`
    array.forEach((e) => {
      this.logFn(`${indent} ${i++}) ${toString ? toString(e) : e}`)
    })
    this.logFn('')
  }

  unorderedList (array, toString) {
    if (!array) return
    array.forEach((e) => {
      this.logFn(`${this.indent} - ${toString ? toString(e) : e}`)
    })
    this.logFn('')
  }

  simpleMap (object, toString) {
    if (!object) return
    Object.keys(object).forEach((k) => {
      this.logFn(`${this.indent}  ${k}: ${toString ? toString(object[k]) : object[k]}`)
    })
    this.logFn('')
  }

  simpleMapByKey (object, toString) {
    if (!object) return
    Object.keys(object).sort().forEach((k) => {
      this.logFn(`${this.indent}  ${k}: ${toString ? toString(object[k]) : object[k]}`)
    })
    this.logFn('')
  }
}

module.exports = {
  CliPrinter
}
