/*

global.ENV_CONFIG = {
    debug_enabled:true,
    absolute_app_path:''
};
ENV_CONFIG.absolute_app_path = process.argv[1];

require('./globals.js');

require('./app/init.js'); */

require('dotenv').config()
process.env.ABSOLUTE_APP_PATH = process.cwd()
require('./ui/cli-vorpal-v1/ui_start')
