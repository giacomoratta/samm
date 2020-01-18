let logModule
if (process.env.NODE_ENV !== 'test' || process.env.NODE_ENV !== 'production') {
  logModule = require('./pino.logger')
} else {
  logModule = require('./basic.logger')
}

logModule = require('./basic.logger')

const log = logModule.createLogger('logger')
log.info('.')
log.info('.')
log.info('.')
log.info(`LOGGER STARTED at ${(new Date().toUTCString())}`)

module.exports = logModule
