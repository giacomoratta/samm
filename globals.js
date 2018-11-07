
/* Standard Libraries */
global._ =  require('lodash');
require('./libs/Lodash.Extensions.js');

/* Output */
let UI_options = {};
if(!ENV_CONFIG.debug_enabled){
    UI_options.debugFn=function(){};
    UI_options.debugTimedFn=function(){};
}
global.clUI  = new (require('./modules/UI.class.js'))(UI_options);
global.d$ = clUI .debug;
global.dt$ = clUI .debugTimed;

/* Common Libraries */
global.Utils = require('./libs/Utils.js');
global.DataCache = require('./libs/DataCache.class.js');
global.PathInfo = require('./libs/PathInfo.class.js');
global.DirectoryTree = require('./libs/DirectoryTree.class.js');
global.Samples = require('./libs/Samples.class.js');
global.SamplesTree = require('./libs/SamplesTree.class.js');
global.DataMgr = require('./libs/DataManager.js');

/* Project Modules */
global.ConfigMgr = require('./modules/ConfigManager.js');
global.CliMgr = require('./modules/CliManager.js');
global.SamplesMgr = require('./modules/SamplesManager.js');
global.DirCommand = require('./modules/Dir.command.js');