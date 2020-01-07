const basicLogger = require('../basic.logger')
const pinoLogger = require('../pino.logger')

describe('logger(s) class and object', function () {
  it('should create a basic logger', function () {
    const logger1 = basicLogger.createLogger('module1')
    logger1.info('test info', 123)
    logger1.warn('test warning', 123)
    logger1.error('test error', 123)
  })

  it('should create a pino logger', function () {
    const logger1 = pinoLogger.createLogger('module2')
    logger1.info('test info', 123)
    logger1.warn('test warning', 123)
    logger1.error('test error', 123)
  })
})
