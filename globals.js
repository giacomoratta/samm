if(typeof ENV_CONFIG === 'undefined') ENV_CONFIG={ undefined:true };

/* Standard Libraries */
global._ =  require('lodash');
require('./modules/libs/utils/lodash.js');

/* Output */
let UI_options = {};
if(!ENV_CONFIG.debug_enabled){
    UI_options.debugFn=function(){};
    UI_options.debugTimedFn=function(){};
}
global.clUI  = new (require('./modules/ui.class.js'))(UI_options);
global.d$ = clUI.debug;
global.dt$ = clUI.debugTimed;

/* Common Libraries */
global.Utils = require('./modules/utils.js');
global.DataCache = require('./modules/atoms/dataCache.class.js');
global.pathInfo = require('./modules/libs/directory-tree/pathInfo.class.js');
global.directoryTree = require('./modules/libs/directory-tree/directoryTree.class.js');
global.dataFileHolder = require('./modules/libs/data-file-holder/dataFileHolder.class.js');
global.configMgr = require('./modules/config.manager.js');

/* Latest module: Command Line Interface */
global.cliMgr = require('./modules/cli.manager.js');
