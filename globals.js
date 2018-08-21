/* Standard Libraries */
global._ =  require('lodash');
global.readlinesync = require('readline-sync');
global.d = console.log;
global.UI = {
    print:console.log,
    warning:console.warn,
    error:console.error
};
global.MPL_Options = {

};

/* Common Libraries */
global.Utils = require('./libs/Utils.js');
global.DirectoryTree = require('./libs/DirectoryTree.class.js');
global.DataMgr = require('./libs/DataManager.js');

/* Project Modules */
global.ConfigMgr = require('./modules/ConfigManager.js');
global.CliMgr = require('./modules/CliManager.js');
global.SamplesMgr = require('./modules/SamplesManager.js');