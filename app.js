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

/* Project Libraries */
global.Utils = require('./libs/Utils.js');
global.ConfigMgr = require('./libs/ConfigManager.js');
global.CliMgr = require('./libs/CliManager.js');
global.SamplesMgr = require('./libs/SamplesManager.js');

CliMgr.show();