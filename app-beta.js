
require('./globals_dev.js');
global.ENV_CONFIG.debug_enabled = false;
require('./globals.js');
CliMgr.show();
