
global.ENV_CONFIG = {
    debug_enabled:false,
    absolute_app_path:''
};
ENV_CONFIG.absolute_app_path = process.argv[1];

require('./globals.js');

require('./app/init.js');
