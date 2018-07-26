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

/* Help function */
function printHelp(){
    console.log("\nHelp");
}

/* Project logic & interface */
let CliParams = CliMgr.processParams();
if(CliParams.isError()){
    console.log("Invalid process parameters");
    printHelp();
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
    printHelp();
}

console.log("\n");
