const { ConsoleLogger } = require('../consoleLogger')

/* EXAMPLE START */
const globalLogger = new ConsoleLogger()

const log = globalLogger.child({ module: 'test1' })
log.debug('debug123456789')
log.info('info123456789')
log.warn('warn123456789')
log.error('error123456789')
log.fatal('fatal123456789')

log.info({ data: 123, string: 'abc' }, 'fatal123456789')
log.info({ data: 345, string: 'qwerty' }, 'fatal123456789')
globalLogger.kill()
