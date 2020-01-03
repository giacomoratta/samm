const basicLogger = require('../basic.logger')
const pinoLogger = require('../pino.logger')

describe('logger(s) class and object', function () {
  it('should create a basic logger', function () {
    const logger1 = basicLogger.createLogger('module1')
    logger1.info('ax', 123)
    logger1.error('exx', 123)
  })

  it('should create a pino logger', function () {
  })
})
