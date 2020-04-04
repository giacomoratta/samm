const path = require('path')
const { FileLogger, BasicLogger } = require('../core/logger')
const logsDirPath = path.join(process.env.APP_ABSPATH || process.cwd(), process.env.APP_DATA_DIRNAME || 'app-data', 'logs')

let LoggerFactoryClass = BasicLogger
let minLevel = 'debug'

if (process.env.NODE_ENV === 'production') {
  LoggerFactoryClass = FileLogger
  minLevel = 'info'
}

const initLoggerFactory = () => {
  const loggerFactory = new LoggerFactoryClass({
    logsDirPath,
    minLevel
  })

  const log = loggerFactory.child({ module: 'logger' })
  log.info('.')
  log.info('.')
  log.info('.')
  log.info({
    NODE_ENV: process.env.NODE_ENV,
    minLevel,
    logsDirPath
  }, 'Logger config')
  log.info(`LOGGER STARTED at ${(new Date().toUTCString())}`)

  return loggerFactory
}

const loggerFactory = initLoggerFactory()

module.exports = {
  createLogger: (module) => {
    return loggerFactory.child({ module })
  }
}
