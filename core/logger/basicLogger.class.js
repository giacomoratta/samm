const pino = require('pino')

class BasicLogger {
  constructor ({ minLevel = 10 } = {}) {
    this.log = pino({
      // name: 'project',
      prettyPrint: { colorize: true },
      timestamp: '',
      level: minLevel,
      base: {}
    })
  }

  child ({ module }) {
    return this.log.child({ module })
  }

  kill () {
  }
}

module.exports = {
  BasicLogger
}
