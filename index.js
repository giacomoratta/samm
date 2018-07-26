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
let cli_params = [];
if(process.argv.length<3){
    printHelp();
    process.exit(0);
}
else{
    cli_params=_.slice(process.argv,2);
}

let CliParams = CliMgr.processParams(cli_params);
if(!CliParams){
    console.log("Impossible to read command line parameters");
    printHelp();
}

if(CliParams.commandIs('set')){
    CliMgr.C_set(cli_params);

} else if(CliParams.commandIs('config')){
    ConfigMgr.print();

} else if(CliParams.commandIs('lookup')){
    CliMgr.C_lookup(cli_params);

} else if(CliParams.commandIs('save')){
    CliMgr.C_save(cli_params);

} else if(CliParams.commandIs('scan')){
    CliMgr.C_scan(cli_params);

} else {
    console.log(" Unrecognized command");
    printHelp();
}

console.log("\n");
