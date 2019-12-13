const INDENT = '  '

class cliPrinter {
  constructor ({ command }) {
    this.command = command
  }

  info (message) {
    console.info(`${INDENT}${message}`)
  }

  warn (message) {
    console.info(`${INDENT}WARNING: ${message}`)
  }

  error (message) {
    console.info(`${INDENT}ERROR: ${message}`)
  }

  orderedList () {

  }

  unorderedList () {

  }

  simpleMap () {

  }
}


module.exports = {
  cliPrinter
}
