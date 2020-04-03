const path = require('path')
const { FileLogger } = require('../fileLogger.class')

/* TEST START */

const logsDirPath = path.join(process.cwd(), 'logs')
const log = new FileLogger({ logsDirPath })

const x = log.child({ module: 'test1' })
x.debug('debug123456789')
x.info('info123456789')
x.warn('warn123456789')
x.error('error123456789')
x.fatal('fatal123456789')

log.kill()
