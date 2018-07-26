/* Standard Libraries */
global._ =  require('lodash');
global.path = require('path');
global.fs = require('fs');
global.fs_extra = require('fs-extra');
global.d = console.log;

/* Project Libraries */
global.ConfigMgr = require('./libs/ConfigManager.js');
global.Utils = require('./libs/Utils.js');
global.CliMgr = require('./libs/CliManager.js');
global.SamplesMgr = require('./libs/SamplesManager.js');

/* Project logic & interface */
let CliParams = CliMgr.processParams();
if(CliParams.isError()){
    console.log("Invalid process parameters");
    ConfigMgr.printHelp();
    process.exit(0);
}

if(CliParams.commandIs('set')){
    CliMgr.C_set();

} else if(CliParams.commandIs('config')){
    ConfigMgr.print();

} else if(CliParams.commandIs('lookup')){
    CliMgr.C_lookup();

} else if(CliParams.commandIs('save')){
    CliMgr.C_save();

} else if(CliParams.commandIs('scan')){
    CliMgr.C_scan();

} else {
    console.log(" Unrecognized command");
    ConfigMgr.printHelp();
}

console.log("\n");
