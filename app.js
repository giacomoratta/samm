/*

global.ENV_CONFIG = {
    debug_enabled:true,
    absolute_app_path:''
};
ENV_CONFIG.absolute_app_path = process.argv[1];

require('./globals.js');

require('./app/init.js'); */

// const log = require('./core/logger').createLogger('app')

require('dotenv').config()
process.env.ABSOLUTE_APP_PATH = __dirname
// require('./ui/cli-vorpal-v1')
