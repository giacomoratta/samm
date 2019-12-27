const path = require('path')
require('dotenv').config() /* Load .env file to process.env */
process.env.ABSOLUTE_APP_FILEPATH = process.argv[1]
process.env.ABSOLUTE_APP_PATH = path.dirname(process.env.ABSOLUTE_APP_FILEPATH)

const log = require('./core/logger/pino.logger').createLogger('app')

log.info('Starting app...')
log.debug(`(env) ABSOLUTE_APP_PATH: ${process.env.ABSOLUTE_APP_PATH}`)
log.debug(`(env) ABSOLUTE_APP_FILEPATH: ${process.env.ABSOLUTE_APP_FILEPATH}`)

// console.log(ENV_CONFIG);

// require('./globals.js');

// require('./app/init.js');
