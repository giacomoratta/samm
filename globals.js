
/* Standard Libraries */
global._ =  require('lodash');
require('./modules/extensions/Lodash.Extensions.js');

/* Output */
let UI_options = {};
if(!ENV_CONFIG.debug_enabled){
    UI_options.debugFn=function(){};
    UI_options.debugTimedFn=function(){};
}
global.clUI  = new (require('./modules/UI.class.js'))(UI_options);
global.d$ = clUI.debug;
global.dt$ = clUI.debugTimed;

/* Common Libraries */
global.Utils = require('./modules/Utils.js');
global.DataCache = require('./modules/micro/DataCache.class.js');
global.PathInfo = require('./modules/micro/PathInfo.class.js');
global.DirectoryTree = require('./modules/DirectoryTree.class.js');
global.DataMgr = require('./modules/DataManager.js');
global.ConfigMgr = require('./modules/ConfigManager.js');

/* Latest module: Command Line Interface */
global.CliMgr = require('./modules/CliManager.js');