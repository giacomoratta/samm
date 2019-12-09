const log = require('./modules/Logger').createLogger('app')
log.info('Starting app...')

require('dotenv').config() /* Load .env file to process.env */


process.env.ABSOLUTE_APP_PATH = process.argv[1]

//console.log(ENV_CONFIG);

//require('./globals.js');

//require('./app/init.js');
